import {
  isAccountId,
  isAddress,
  isPublicAccount,
  type Address,
  type PublicAccount,
} from '../wallet-core/account.ts'
import { findBlockedField } from '../wallet-core/boundary.ts'
import { isNetworkId, type NetworkId } from '../wallet-core/network.ts'

export type VaultPhase =
  | { phase: 'absent' }
  | { phase: 'locked'; networkId: NetworkId; address: Address }
  | {
      phase: 'unlocked'
      networkId: NetworkId
      accounts: PublicAccount[]
    }

export function absentVault(): VaultPhase {
  return { phase: 'absent' }
}

export function isVaultPhase(value: unknown): value is VaultPhase {
  if (findBlockedField(value) || !isRecord(value)) return false
  if (value.phase === 'absent') return Object.keys(value).length === 1
  if (value.phase === 'locked') {
    return (
      Object.keys(value).length === 3 &&
      isNetworkId(value.networkId) &&
      isAddress(value.address)
    )
  }
  if (value.phase !== 'unlocked') return false
  return (
    Object.keys(value).length === 3 &&
    isNetworkId(value.networkId) &&
    Array.isArray(value.accounts) &&
    value.accounts.every(isPublicAccount)
  )
}

export function publicAccount(
  id: string,
  label: string,
  address: string,
): PublicAccount | null {
  if (!isAccountId(id) || !isAddress(address)) return null
  const account = { id, label, address }
  return isPublicAccount(account) ? account : null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
