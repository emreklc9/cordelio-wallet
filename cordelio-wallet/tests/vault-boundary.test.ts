import assert from 'node:assert/strict'
import { findBlockedField } from '../src/wallet-core/boundary.ts'
import { absentVault, isVaultPhase, publicAccount } from '../src/storage/vault.ts'

const absent = absentVault()
assert.equal(isVaultPhase(absent), true)
assert.equal(findBlockedField(absent), null)

assert.equal(
  isVaultPhase({
    phase: 'locked',
    networkId: 'sepolia',
    address: '0x0000000000000000000000000000000000000001',
  }),
  true,
)
assert.equal(isVaultPhase({ phase: 'locked', password: 'gizli' }), false)
assert.equal(findBlockedField({ phase: 'locked', password: 'gizli' }), 'password')

const account = publicAccount(
  'hesap-1',
  'Ana hesap',
  '0x0000000000000000000000000000000000000001',
)
assert.ok(account)
assert.equal(
  isVaultPhase({ phase: 'unlocked', networkId: 'sepolia', accounts: [account] }),
  true,
)
assert.equal(
  isVaultPhase({
    phase: 'unlocked',
    networkId: 'sepolia',
    accounts: [{ ...account, privateKey: '0xabc' }],
  }),
  false,
)
assert.equal(publicAccount('boş id', 'Ana', '0x1234'), null)
assert.equal(isVaultPhase({ phase: 'missing' }), false)

console.log('vault-boundary tests passed')
