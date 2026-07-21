const NOTES_KEY = 'shixin:notes:v1'
const SETTINGS_KEY = 'shixin:github:v1'

export const defaultSettings = {
  enabled: false,
  owner: '',
  repo: '',
  branch: 'main',
  basePath: 'shixin-data',
  token: '',
  lastSyncedAt: '',
}

export function loadNotes({ includeDeleted = false } = {}) {
  const value = uni.getStorageSync(NOTES_KEY)
  const notes = Array.isArray(value) ? value : []
  return notes
    .filter((note) => includeDeleted || !note.deletedAt)
    .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
}

export function saveNotes(notes) {
  uni.setStorageSync(NOTES_KEY, notes)
}

export function getNote(id) {
  return loadNotes({ includeDeleted: true }).find((note) => note.id === id)
}

export function upsertNote(draft) {
  const now = new Date().toISOString()
  const notes = loadNotes({ includeDeleted: true })
  const index = notes.findIndex((note) => note.id === draft.id)
  const note = {
    id: draft.id || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    title: String(draft.title || '').trim(),
    content: String(draft.content || ''),
    createdAt: draft.createdAt || now,
    updatedAt: now,
  }
  if (index >= 0) notes.splice(index, 1, note)
  else notes.push(note)
  saveNotes(notes)
  return note
}

export function deleteNote(id) {
  const notes = loadNotes({ includeDeleted: true })
  const index = notes.findIndex((note) => note.id === id)
  if (index < 0) return
  const now = new Date().toISOString()
  notes[index] = { ...notes[index], updatedAt: now, deletedAt: now }
  saveNotes(notes)
}

export function loadSettings() {
  const value = uni.getStorageSync(SETTINGS_KEY)
  return { ...defaultSettings, ...(value && typeof value === 'object' ? value : {}) }
}

export function saveSettings(settings) {
  const normalized = {
    ...defaultSettings,
    ...settings,
    owner: String(settings.owner || '').trim(),
    repo: String(settings.repo || '').trim(),
    branch: String(settings.branch || 'main').trim() || 'main',
    basePath: String(settings.basePath || 'shixin-data').trim().replace(/^\/+|\/+$/g, ''),
    token: String(settings.token || '').trim(),
  }
  uni.setStorageSync(SETTINGS_KEY, normalized)
  return normalized
}

export function replaceNotes(notes) {
  saveNotes(Array.isArray(notes) ? notes : [])
}
