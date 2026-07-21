import assert from 'node:assert/strict'
import { mergeNotes } from '../common/github.js'

const remoteOlder = { id: 'same', title: '远端旧内容', content: '', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T01:00:00.000Z' }
const localNewer = { ...remoteOlder, title: '本地新内容', updatedAt: '2026-01-02T01:00:00.000Z' }
const merged = mergeNotes([localNewer], [remoteOlder])
assert.equal(merged[0].title, '本地新内容')

const remoteDelete = { ...localNewer, deletedAt: '2026-01-03T01:00:00.000Z', updatedAt: '2026-01-03T01:00:00.000Z' }
const deletedMerged = mergeNotes([localNewer], [remoteDelete])
assert.equal(deletedMerged[0].deletedAt, remoteDelete.deletedAt)

const distinct = mergeNotes([{ ...localNewer, id: 'local' }], [{ ...remoteOlder, id: 'remote' }])
assert.deepEqual(new Set(distinct.map((note) => note.id)), new Set(['local', 'remote']))

console.log('GitHub merge tests passed')
