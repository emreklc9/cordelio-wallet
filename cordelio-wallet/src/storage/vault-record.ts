import { isAddress } from '../wallet-core/account.ts'
import { findBlockedField } from '../wallet-core/boundary.ts'
import { deriveAddress } from '../wallet-core/mnemonic.ts'
import { isNetworkId } from '../wallet-core/network.ts'
import { decryptSecret, encryptSecret, type EncryptedSecret } from './vault-crypto.ts'
import { publicAccount } from './vault.ts'

export const vaultRecordKey = 'cordelio.vault'
export const primaryAccountId = 'hesap-1'
export const primaryAccountLabel = 'Ana hesap'

export type VaultRecord = EncryptedSecret & {
  version: 1
  address: `0x${string}`
  networkId: 'sepolia'
  accountId: typeof primaryAccountId
  label: typeof primaryAccountLabel
}

export async function buildVaultRecord(
  mnemonic: string,
  password: string,
): Promise<VaultRecord> {
  const address = deriveAddress(mnemonic)
  const account = publicAccount(primaryAccountId, primaryAccountLabel, address)
  if (!account) throw new Error('Adres türetilemedi')
  const encrypted = await encryptSecret(mnemonic, password)
  return {
    version: 1,
    ...encrypted,
    address,
    networkId: 'sepolia',
    accountId: primaryAccountId,
    label: primaryAccountLabel,
  }
}

export async function unlockRecord(record: VaultRecord, password: string): Promise<void> {
  await withRecordMnemonic(record, password, async () => undefined)
}

export async function withRecordMnemonic<T>(
  record: VaultRecord,
  password: string,
  open: (mnemonic: string) => Promise<T>,
): Promise<T> {
  const mnemonic = await decryptSecret(record, password)
  const address = deriveAddress(mnemonic)
  if (address.toLowerCase() !== record.address.toLowerCase()) {
    throw new Error('Kasa bozuk')
  }
  return open(mnemonic)
}

export function isVaultRecord(value: unknown): value is VaultRecord {
  if (findBlockedField(value) || !isRecord(value)) return false
  return (
    value.version === 1 &&
    typeof value.iterations === 'number' &&
    typeof value.salt === 'string' &&
    typeof value.iv === 'string' &&
    typeof value.ciphertext === 'string' &&
    isAddress(value.address) &&
    isNetworkId(value.networkId) &&
    value.accountId === primaryAccountId &&
    value.label === primaryAccountLabel &&
    !value.ciphertext.includes(' ')
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
