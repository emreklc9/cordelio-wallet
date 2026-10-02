import { isAddress } from '../wallet-core/account.ts'
import {
  absentVault,
  publicAccount,
  type VaultPhase,
} from '../storage/vault.ts'
import {
  buildVaultRecord,
  isVaultRecord,
  unlockRecord,
  vaultRecordKey,
  withRecordMnemonic,
  type VaultRecord,
} from '../storage/vault-record.ts'
import {
  asHexAddress,
  estimateSepoliaTransfer,
  parseTransferAmount,
  readSepoliaTransfer,
  sendSepoliaTransfer,
  type TransferStatus,
} from '../wallet-core/transfer.ts'

export const autoLockMs = 5 * 60 * 1000
const autoLockAlarm = 'cordelio.autoLock'

let unlockedAddress: string | null = null
let unlockedAt: number | null = null

export function isUnlockExpired(
  openedAt: number | null,
  now: number,
  limit = autoLockMs,
): boolean {
  return openedAt !== null && now - openedAt >= limit
}

export async function currentVaultPhase(): Promise<VaultPhase> {
  if (isUnlockExpired(unlockedAt, Date.now())) {
    unlockedAddress = null
    unlockedAt = null
    void chrome.alarms.clear(autoLockAlarm)
  }
  const record = await readRecord()
  if (!record) {
    unlockedAddress = null
    unlockedAt = null
    return absentVault()
  }
  if (
    unlockedAddress &&
    unlockedAddress.toLowerCase() === record.address.toLowerCase()
  ) {
    const account = publicAccount(record.accountId, record.label, record.address)
    if (account) {
      return {
        phase: 'unlocked',
        networkId: record.networkId,
        accounts: [account],
      }
    }
  }
  return lockedPhase(record)
}

export async function createStoredVault(
  mnemonic: string,
  password: string,
): Promise<VaultPhase> {
  if (await readRecord()) throw new Error('Kasa zaten var')
  const record = await buildVaultRecord(mnemonic, password)
  await chrome.storage.local.set({ [vaultRecordKey]: record })
  markUnlocked(record.address)
  return currentVaultPhase()
}

export async function unlockStoredVault(password: string): Promise<VaultPhase> {
  const record = await readRecord()
  if (!record) throw new Error('Kasa yok')
  await unlockRecord(record, password)
  markUnlocked(record.address)
  return currentVaultPhase()
}

export async function lockStoredVault(): Promise<VaultPhase> {
  unlockedAddress = null
  unlockedAt = null
  await chrome.alarms.clear(autoLockAlarm)
  return currentVaultPhase()
}

export function noteVaultActivity(): void {
  if (!unlockedAddress) return
  unlockedAt = Date.now()
  scheduleAutoLock()
}

export function handleAutoLockAlarm(name: string): void {
  if (name !== autoLockAlarm) return
  unlockedAddress = null
  unlockedAt = null
}

function markUnlocked(address: string) {
  unlockedAddress = address
  unlockedAt = Date.now()
  scheduleAutoLock()
}

function scheduleAutoLock() {
  void chrome.alarms.create(autoLockAlarm, { delayInMinutes: autoLockMs / 60_000 })
}

async function readRecord(): Promise<VaultRecord | null> {
  const stored = await chrome.storage.local.get(vaultRecordKey)
  const value = stored[vaultRecordKey]
  return isVaultRecord(value) ? value : null
}

export async function quoteStoredTransfer(
  to: string,
  amount: string,
): Promise<{ eth: string; gas: string }> {
  const from = await requireUnlockedAddress()
  const recipient = asHexAddress(to)
  if (recipient.toLowerCase() === from.toLowerCase()) {
    throw new Error('Kendi adresine gönderilemez')
  }
  return estimateSepoliaTransfer(from, recipient, parseTransferAmount(amount))
}

export async function sendStoredTransfer(
  password: string,
  to: string,
  amount: string,
): Promise<string> {
  const from = await requireUnlockedAddress()
  const recipient = asHexAddress(to)
  if (recipient.toLowerCase() === from.toLowerCase()) {
    throw new Error('Kendi adresine gönderilemez')
  }
  const value = parseTransferAmount(amount)
  const record = await readRecord()
  if (!record || record.address.toLowerCase() !== from.toLowerCase()) {
    throw new Error('Kasa yok')
  }
  return withRecordMnemonic(record, password, (mnemonic) =>
    sendSepoliaTransfer(mnemonic, recipient, value),
  )
}

export async function readStoredTransfer(hash: string): Promise<TransferStatus> {
  return readSepoliaTransfer(hash)
}

async function requireUnlockedAddress(): Promise<`0x${string}`> {
  const phase = await currentVaultPhase()
  const address = phase.phase === 'unlocked' ? phase.accounts[0]?.address : undefined
  if (!address) throw new Error('Kasa kilitli')
  return asHexAddress(address)
}

function lockedPhase(record: VaultRecord): VaultPhase {
  if (!isAddress(record.address)) return absentVault()
  return {
    phase: 'locked',
    networkId: record.networkId,
    address: record.address,
  }
}
