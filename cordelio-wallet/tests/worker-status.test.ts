import assert from 'node:assert/strict'
import { recordWake, workerStatusKey, type StoredWake } from '../src/background/status.ts'
import { isStatusRequest, isStatusResponse } from '../src/shared/messages.ts'

const memory = new Map<string, StoredWake>()
const area = {
  async set(items: Record<string, StoredWake>) {
    for (const [key, value] of Object.entries(items)) memory.set(key, value)
  },
  async get(key: string) {
    return { [key]: memory.get(key) }
  },
}

const wake = await recordWake(area, { version: '0.0.1', wokenAt: 10 })
assert.deepEqual(wake, { version: '0.0.1', wokenAt: 10 })
assert.equal(memory.get(workerStatusKey)?.wokenAt, 10)

assert.equal(isStatusRequest({ kind: 'extension.getStatus' }), true)
assert.equal(isStatusRequest({ kind: 'other' }), false)
assert.equal(isStatusRequest(null), false)
assert.equal(
  isStatusResponse({
    ok: true,
    kind: 'extension.getStatus',
    version: '0.0.1',
    wokenAt: 10,
    vault: { phase: 'absent' },
  }),
  true,
)
assert.equal(
  isStatusResponse({
    ok: true,
    kind: 'extension.getStatus',
    version: '0.0.1',
    wokenAt: 10,
    vault: { phase: 'absent', password: 'gizli' },
  }),
  false,
)
assert.equal(isStatusResponse({ ok: false, kind: 'extension.getStatus' }), false)

await assert.rejects(
  () => recordWake({ ...area, async get() { return {} } }, wake),
  /Oturum kaydı okunamadı/,
)

console.log('worker-status tests passed')
