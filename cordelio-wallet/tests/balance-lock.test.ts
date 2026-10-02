import assert from 'node:assert/strict'
import { formatWeiHex } from '../src/wallet-core/balance.ts'
import { autoLockMs, isUnlockExpired } from '../src/background/vault-store.ts'

const ether = 10n ** 18n

assert.equal(formatWeiHex('0x0'), '0')
assert.equal(formatWeiHex(`0x${ether.toString(16)}`), '1')
assert.equal(formatWeiHex(`0x${((ether * 3n) / 2n).toString(16)}`), '1.5')
assert.equal(formatWeiHex('0x1'), '< 0.000001')
assert.throws(() => formatWeiHex('1'), /Bakiye okunamadı/)

const opened = 1_000
assert.equal(isUnlockExpired(null, opened + autoLockMs), false)
assert.equal(isUnlockExpired(opened, opened + autoLockMs - 1), false)
assert.equal(isUnlockExpired(opened, opened + autoLockMs), true)

console.log('bakiye ve otomatik kilit tamam')
