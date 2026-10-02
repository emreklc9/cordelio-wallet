import type { VaultPhase } from '../storage/vault.ts'
import {
  balanceMessageKind,
  createVaultKind,
  gasMessageKind,
  isBalanceResponse,
  isGasResponse,
  isSendResponse,
  isStatusResponse,
  isTxResponse,
  isVaultCommandResponse,
  lockVaultKind,
  sendMessageKind,
  statusMessageKind,
  txMessageKind,
  unlockVaultKind,
} from './messages.ts'

export type WorkerConnection =
  | { state: 'outside' }
  | { state: 'connected'; version: string; wokenAt: number; vault: VaultPhase }
  | { state: 'error'; message: string }

const replyTimeoutMs = 4000

export async function requestWorkerStatus(): Promise<WorkerConnection> {
  if (typeof chrome === 'undefined' || !chrome.runtime?.id) {
    return { state: 'outside' }
  }

  try {
    const response = await withTimeout(
      chrome.runtime.sendMessage({ kind: statusMessageKind }),
      replyTimeoutMs,
    )
    if (!isStatusResponse(response)) {
      return { state: 'error', message: 'Arka plan yanıtı tanınmadı' }
    }
    return {
      state: 'connected',
      version: response.version,
      wokenAt: response.wokenAt,
      vault: response.vault,
    }
  } catch (error) {
    return {
      state: 'error',
      message: error instanceof Error ? error.message : 'Arka plan yanıt vermedi',
    }
  }
}

export type VaultCommandResult =
  | { state: 'outside' }
  | { state: 'saved'; vault: VaultPhase }
  | { state: 'error'; message: string }

export async function createVault(
  mnemonic: string,
  password: string,
): Promise<VaultCommandResult> {
  return sendCommand({ kind: createVaultKind, mnemonic, password })
}

export async function unlockVault(password: string): Promise<VaultCommandResult> {
  return sendCommand({ kind: unlockVaultKind, password })
}

export async function lockVault(): Promise<VaultCommandResult> {
  return sendCommand({ kind: lockVaultKind })
}

export type BalanceResult =
  | { state: 'outside' }
  | { state: 'ok'; eth: string }
  | { state: 'error'; message: string }

export type GasQuoteResult =
  | { state: 'outside' }
  | { state: 'ok'; eth: string; gas: string }
  | { state: 'error'; message: string }

export async function requestGasQuote(to: string, amount: string): Promise<GasQuoteResult> {
  return sendPublic({ kind: gasMessageKind, to, amount }, 12_000, (response) => {
    if (!isGasResponse(response)) return null
    return { state: 'ok', eth: response.eth, gas: response.gas }
  })
}

export type SendResult =
  | { state: 'outside' }
  | { state: 'ok'; hash: string }
  | { state: 'error'; message: string }

export async function sendTransfer(
  to: string,
  amount: string,
  password: string,
): Promise<SendResult> {
  return sendPublic({ kind: sendMessageKind, to, amount, password }, 30_000, (response) => {
    if (!isSendResponse(response)) return null
    return { state: 'ok', hash: response.hash }
  })
}

export type TransferStatusResult =
  | { state: 'outside' }
  | { state: 'ok'; status: 'pending' | 'success' | 'reverted' }
  | { state: 'error'; message: string }

export async function requestTransferStatus(hash: string): Promise<TransferStatusResult> {
  return sendPublic({ kind: txMessageKind, hash }, 12_000, (response) => {
    if (!isTxResponse(response)) return null
    return { state: 'ok', status: response.status }
  })
}

export async function requestBalance(): Promise<BalanceResult> {
  if (typeof chrome === 'undefined' || !chrome.runtime?.id) {
    return { state: 'outside' }
  }
  try {
    const response = await withTimeout(
      chrome.runtime.sendMessage({ kind: balanceMessageKind }),
      12_000,
    )
    if (isBalanceResponse(response)) return { state: 'ok', eth: response.eth }
    if (isFailure(response)) return { state: 'error', message: response.error }
    return { state: 'error', message: 'Bakiye okunamadı' }
  } catch (error) {
    return {
      state: 'error',
      message: error instanceof Error ? error.message : 'Sepolia yanıt vermedi',
    }
  }
}

async function sendCommand(message: {
  kind: string
  mnemonic?: string
  password?: string
}): Promise<VaultCommandResult> {
  if (typeof chrome === 'undefined' || !chrome.runtime?.id) {
    return { state: 'outside' }
  }
  try {
    const response = await withTimeout(chrome.runtime.sendMessage(message), replyTimeoutMs)
    if (isVaultCommandResponse(response)) {
      return { state: 'saved', vault: response.vault }
    }
    if (isFailure(response)) return { state: 'error', message: response.error }
    return { state: 'error', message: 'Arka plan yanıtı tanınmadı' }
  } catch (error) {
    return {
      state: 'error',
      message: error instanceof Error ? error.message : 'Arka plan yanıt vermedi',
    }
  }
}

async function sendPublic<T extends { state: 'ok' }>(
  message: Record<string, string>,
  timeoutMs: number,
  read: (response: unknown) => T | null,
): Promise<T | { state: 'outside' } | { state: 'error'; message: string }> {
  if (typeof chrome === 'undefined' || !chrome.runtime?.id) return { state: 'outside' }
  try {
    const response = await withTimeout(chrome.runtime.sendMessage(message), timeoutMs)
    const parsed = read(response)
    if (parsed) return parsed
    if (isFailure(response)) return { state: 'error', message: response.error }
    return { state: 'error', message: 'Arka plan yanıtı tanınmadı' }
  } catch (error) {
    return {
      state: 'error',
      message: error instanceof Error ? error.message : 'Arka plan yanıt vermedi',
    }
  }
}

function isFailure(value: unknown): value is { ok: false; error: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'ok' in value &&
    value.ok === false &&
    'error' in value &&
    typeof value.error === 'string'
  )
}

function withTimeout(promise: Promise<unknown>, ms: number): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Arka plan zaman aşımı'))
    }, ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error: unknown) => {
        clearTimeout(timer)
        reject(error instanceof Error ? error : new Error('Arka plan yanıt vermedi'))
      },
    )
  })
}
