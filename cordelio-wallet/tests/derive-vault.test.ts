import assert from 'node:assert/strict'
import { deriveAddress, normalizeMnemonic } from '../src/wallet-core/mnemonic.ts'
import { decryptSecret, encryptSecret } from '../src/storage/vault-crypto.ts'
import { buildVaultRecord, unlockRecord } from '../src/storage/vault-record.ts'

const mnemonic =
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
const expected = '0x9858effd232b4033e47d90003d41ec34ecaeda94'

assert.equal(deriveAddress(mnemonic).toLowerCase(), expected)
assert.equal(normalizeMnemonic(`  ${mnemonic.toUpperCase()}  `), mnemonic)
assert.equal(deriveAddress(normalizeMnemonic(mnemonic)).toLowerCase(), expected)
assert.throws(() => normalizeMnemonic('yalnızca üç kelime'), /12 veya 24 kelime/)
assert.throws(() => deriveAddress('not a phrase'), /Kurtarma ifadesi geçersiz/)

const encrypted = await encryptSecret(mnemonic, 'parola-test', 1_000)
assert.equal(encrypted.ciphertext.includes('abandon'), false)
assert.equal(await decryptSecret(encrypted, 'parola-test'), mnemonic)
await assert.rejects(() => decryptSecret(encrypted, 'yanlis-parola'), /Parola yanlış/)

const record = await buildVaultRecord(mnemonic, 'parola-test')
assert.equal(record.address.toLowerCase(), expected)
assert.equal(JSON.stringify(record).includes(mnemonic), false)
await unlockRecord(record, 'parola-test')
await assert.rejects(() => unlockRecord(record, 'yanlis-parola'), /Parola yanlış/)

console.log('derive-vault tests passed')
