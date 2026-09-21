import { loadNotes, replaceNotes, saveSettings } from './store.js'

function validate(settings) {
  if (!settings.enabled) throw new Error('请先开启 GitHub 同步')
  if (!settings.owner || !settings.repo || !settings.branch || !settings.token) {
    throw new Error('请填写完整的 GitHub 配置')
  }
}

function fileUrl(settings) {
  const path = [settings.basePath, 'thoughts.json']
    .filter(Boolean)
    .join('/')
    .split('/')
    .map(encodeURIComponent)
    .join('/')
  return `https://api.github.com/repos/${encodeURIComponent(settings.owner)}/${encodeURIComponent(settings.repo)}/contents/${path}`
}

function headers(settings) {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${settings.token}`,
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

function request(options) {
  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      success(response) {
        if (response.statusCode >= 200 && response.statusCode < 300) resolve(response)
        else reject(Object.assign(new Error(response.data?.message || `请求失败（${response.statusCode}）`), { statusCode: response.statusCode }))
      },
      fail(error) { reject(new Error(error.errMsg || '网络请求失败')) },
    })
  })
}

function encodeBase64(value) {
  const utf8 = unescape(encodeURIComponent(JSON.stringify(value, null, 2)))
  if (typeof btoa === 'function') return btoa(utf8)
  return encodeBinary(utf8)
}

function decodeBase64(value) {
  const source = String(value).replace(/\n/g, '')
  const binary = typeof atob === 'function' ? atob(source) : decodeBinary(source)
  return JSON.parse(decodeURIComponent(escape(binary)))
}

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

function encodeBinary(binary) {
  let output = ''
  for (let index = 0; index < binary.length; index += 3) {
    const first = binary.charCodeAt(index)
    const second = binary.charCodeAt(index + 1)
    const third = binary.charCodeAt(index + 2)
    const combined = (first << 16) | ((second || 0) << 8) | (third || 0)
    output += BASE64_CHARS[(combined >> 18) & 63]
    output += BASE64_CHARS[(combined >> 12) & 63]
    output += Number.isNaN(second) ? '=' : BASE64_CHARS[(combined >> 6) & 63]
    output += Number.isNaN(third) ? '=' : BASE64_CHARS[combined & 63]
  }
  return output
}

function decodeBinary(source) {
  let output = ''
  const clean = source.replace(/=+$/, '')
  let buffer = 0
  let bits = 0
  for (const char of clean) {
    const value = BASE64_CHARS.indexOf(char)
    if (value < 0) continue
    buffer = (buffer << 6) | value
    bits += 6
    if (bits >= 8) {
      bits -= 8
      output += String.fromCharCode((buffer >> bits) & 255)
    }
  }
  return output
}

async function readRemote(settings) {
  try {
    const response = await request({
      url: `${fileUrl(settings)}?ref=${encodeURIComponent(settings.branch)}`,
      method: 'GET',
      header: headers(settings),
    })
    return { sha: response.data.sha, notes: decodeBase64(response.data.content) }
  } catch (error) {
    if (error.statusCode === 404) return { sha: '', notes: [] }
    throw error
  }
}

function timestamp(note) {
  return Date.parse(note.deletedAt || note.updatedAt || note.createdAt || 0)
}

export function mergeNotes(localNotes, remoteNotes) {
  const byId = new Map()
  for (const note of Array.isArray(remoteNotes) ? remoteNotes : []) byId.set(note.id, note)
  for (const note of Array.isArray(localNotes) ? localNotes : []) {
    const remote = byId.get(note.id)
    if (!remote || timestamp(note) >= timestamp(remote)) byId.set(note.id, note)
  }
  return [...byId.values()].sort((a, b) => timestamp(b) - timestamp(a))
}

async function writeRemote(settings, notes, sha = '') {
  return request({
    url: fileUrl(settings),
    method: 'PUT',
    header: { ...headers(settings), 'Content-Type': 'application/json' },
    data: {
      message: 'Sync 余白 thoughts.json',
      branch: settings.branch,
      content: encodeBase64(notes),
      ...(sha ? { sha } : {}),
    },
  })
}

export async function syncWithGitHub(settings) {
  validate(settings)
  const remote = await readRemote(settings)
  const merged = mergeNotes(loadNotes({ includeDeleted: true }), remote.notes)
  try {
    await writeRemote(settings, merged, remote.sha)
  } catch (error) {
    if (error.statusCode !== 409) throw error
    const latest = await readRemote(settings)
    const retryMerged = mergeNotes(merged, latest.notes)
    await writeRemote(settings, retryMerged, latest.sha)
    replaceNotes(retryMerged)
    const saved = saveSettings({ ...settings, lastSyncedAt: new Date().toISOString() })
    return { notes: retryMerged, settings: saved }
  }
  replaceNotes(merged)
  const saved = saveSettings({ ...settings, lastSyncedAt: new Date().toISOString() })
  return { notes: merged, settings: saved }
}
