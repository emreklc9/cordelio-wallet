import { findBlockedField } from '../wallet-core/boundary.ts'
import { readSepoliaBalance } from '../wallet-core/balance.ts'
import {
  createStoredVault,
  currentVaultPhase,
  handleAutoLockAlarm,
  lockStoredVault,
  noteVaultActivity,
  quoteStoredTransfer,
  readStoredTransfer,
  sendStoredTransfer,
  unlockStoredVault,
} from './vault-store.ts'
import type { VaultPhase } from '../storage/vault.ts'
import { recordWake } from './status.ts'
import {
  balanceMessageKind,
  gasMessageKind,
  isBalanceRequest,
  isCreateVaultRequest,
  isGasRequest,
  isLockVaultRequest,
  isSendRequest,
  isStatusRequest,
  isTxRequest,
  isUnlockVaultRequest,
  sendMessageKind,
  statusMessageKind,
  txMessageKind,
  type BalanceResponse,
  type GasResponse,
  type SendResponse,
  type StatusResponse,
  type TxResponse,
  type VaultCommandResponse,
} from '../shared/messages.ts'

const session = {
  get: (key: string) => chrome.storage.session.get(key),
  set: (items: Record<string, { version: string; wokenAt: number }>) =>
    chrome.storage.session.set(items),
}

async function rememberThisWake() {
  return recordWake(session, {
    version: chrome.runtime.getManifest().version,
    wokenAt: Date.now(),
  })
}

function failure(kind: string, error: unknown) {
  return {
    ok: false as const,
    kind,
    error: error instanceof Error ? error.message : 'İşlem başarısız',
  }
}

function publicResponse<
  T extends
    | StatusResponse
    | VaultCommandResponse
    | BalanceResponse
    | GasResponse
    | SendResponse
    | TxResponse,
>(response: T): T {
  if (findBlockedField(response)) throw new Error('Açık yanıt reddedildi')
  return response
}

chrome.runtime.onInstalled.addListener(() => {
  void rememberThisWake()
})

chrome.runtime.onStartup.addListener(() => {
  void rememberThisWake()
})

chrome.alarms.onAlarm.addListener((alarm) => {
  handleAutoLockAlarm(alarm.name)
})

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (isStatusRequest(message)) {
    void rememberThisWake()
      .then(async (wake) => {
        const vault = await currentVaultPhase()
        noteVaultActivity()
        return publicResponse<StatusResponse>({
          ok: true,
          kind: statusMessageKind,
          version: wake.version,
          wokenAt: wake.wokenAt,
          vault,
        })
      })
      .then(sendResponse)
      .catch((error: unknown) => sendResponse(failure(statusMessageKind, error)))
    return true
  }

  if (isCreateVaultRequest(message)) {
    void createStoredVault(message.mnemonic, message.password)
      .then((vault) =>
        publicResponse<VaultCommandResponse>({
          ok: true,
          kind: message.kind,
          vault,
        }),
      )
      .then(sendResponse)
      .catch((error: unknown) => sendResponse(failure(message.kind, error)))
    return true
  }

  if (isUnlockVaultRequest(message)) {
    void unlockStoredVault(message.password)
      .then((vault) =>
        publicResponse<VaultCommandResponse>({
          ok: true,
          kind: message.kind,
          vault,
        }),
      )
      .then(sendResponse)
      .catch((error: unknown) => sendResponse(failure(message.kind, error)))
    return true
  }

  if (isBalanceRequest(message)) {
    void currentVaultPhase()
      .then((vault) => {
        noteVaultActivity()
        const address = vaultAddress(vault)
        if (!address) throw new Error('Kasa yok')
        return readSepoliaBalance(address)
      })
      .then((eth) =>
        publicResponse({
          ok: true as const,
          kind: balanceMessageKind,
          eth,
        }),
      )
      .then(sendResponse)
      .catch((error: unknown) => sendResponse(failure(message.kind, error)))
    return true
  }

  if (isGasRequest(message)) {
    void quoteStoredTransfer(message.to, message.amount)
      .then((quote) => {
        noteVaultActivity()
        return publicResponse<GasResponse>({
          ok: true,
          kind: gasMessageKind,
          eth: quote.eth,
          gas: quote.gas,
        })
      })
      .then(sendResponse)
      .catch((error: unknown) => sendResponse(failure(message.kind, error)))
    return true
  }

  if (isSendRequest(message)) {
    void sendStoredTransfer(message.password, message.to, message.amount)
      .then((hash) => {
        noteVaultActivity()
        return publicResponse<SendResponse>({
          ok: true,
          kind: sendMessageKind,
          hash,
        })
      })
      .then(sendResponse)
      .catch((error: unknown) => sendResponse(failure(message.kind, error)))
    return true
  }

  if (isTxRequest(message)) {
    void readStoredTransfer(message.hash)
      .then((status) => {
        noteVaultActivity()
        return publicResponse<TxResponse>({
          ok: true,
          kind: txMessageKind,
          hash: message.hash,
          status,
        })
      })
      .then(sendResponse)
      .catch((error: unknown) => sendResponse(failure(message.kind, error)))
    return true
  }

  if (isLockVaultRequest(message)) {
    void lockStoredVault()
      .then((vault) =>
        publicResponse<VaultCommandResponse>({
          ok: true,
          kind: message.kind,
          vault,
        }),
      )
      .then(sendResponse)
      .catch((error: unknown) => sendResponse(failure(message.kind, error)))
    return true
  }

  return false
})

function vaultAddress(vault: VaultPhase): string | undefined {
  if (vault.phase === 'locked') return vault.address
  if (vault.phase === 'unlocked') return vault.accounts[0]?.address
  return undefined
}
