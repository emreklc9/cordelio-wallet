import { isVaultPhase, type VaultPhase } from '../storage/vault.ts'
import { findBlockedField } from '../wallet-core/boundary.ts'

export const statusMessageKind = 'extension.getStatus'
export const createVaultKind = 'vault.create'
export const unlockVaultKind = 'vault.unlock'
export const lockVaultKind = 'vault.lock'
export const balanceMessageKind = 'network.balance'
export const gasMessageKind = 'network.gas'
export const sendMessageKind = 'network.send'
export const txMessageKind = 'network.tx'

export type StatusRequest = {
  kind: typeof statusMessageKind
}

export type StatusResponse = {
  ok: true
  kind: typeof statusMessageKind
  version: string
  wokenAt: number
  vault: VaultPhase
}

export type StatusFailure = {
  ok: false
  kind: typeof statusMessageKind
  error: string
}

export function isStatusRequest(value: unknown): value is StatusRequest {
  return isRecord(value) && value.kind === statusMessageKind
}

export function isStatusResponse(value: unknown): value is StatusResponse {
  return (
    isRecord(value) &&
    value.ok === true &&
    value.kind === statusMessageKind &&
    typeof value.version === 'string' &&
    typeof value.wokenAt === 'number' &&
    isVaultPhase(value.vault) &&
    findBlockedField(value) === null
  )
}

export type CreateVaultRequest = {
  kind: typeof createVaultKind
  mnemonic: string
  password: string
}

export type UnlockVaultRequest = {
  kind: typeof unlockVaultKind
  password: string
}

export type LockVaultRequest = {
  kind: typeof lockVaultKind
}

export type VaultCommandResponse = {
  ok: true
  kind: typeof createVaultKind | typeof unlockVaultKind | typeof lockVaultKind
  vault: VaultPhase
}

export function isCreateVaultRequest(value: unknown): value is CreateVaultRequest {
  return (
    isRecord(value) &&
    value.kind === createVaultKind &&
    typeof value.mnemonic === 'string' &&
    typeof value.password === 'string' &&
    Object.keys(value).length === 3
  )
}

export function isUnlockVaultRequest(value: unknown): value is UnlockVaultRequest {
  return (
    isRecord(value) &&
    value.kind === unlockVaultKind &&
    typeof value.password === 'string' &&
    Object.keys(value).length === 2
  )
}

export function isLockVaultRequest(value: unknown): value is LockVaultRequest {
  return isRecord(value) && value.kind === lockVaultKind && Object.keys(value).length === 1
}

export type BalanceRequest = {
  kind: typeof balanceMessageKind
}

export type BalanceResponse = {
  ok: true
  kind: typeof balanceMessageKind
  eth: string
}

export function isBalanceRequest(value: unknown): value is BalanceRequest {
  return isRecord(value) && value.kind === balanceMessageKind && Object.keys(value).length === 1
}

export function isBalanceResponse(value: unknown): value is BalanceResponse {
  return (
    isRecord(value) &&
    value.ok === true &&
    value.kind === balanceMessageKind &&
    typeof value.eth === 'string' &&
    findBlockedField(value) === null
  )
}

export type GasRequest = {
  kind: typeof gasMessageKind
  to: string
  amount: string
}

export type GasResponse = {
  ok: true
  kind: typeof gasMessageKind
  eth: string
  gas: string
}

export function isGasRequest(value: unknown): value is GasRequest {
  return (
    isRecord(value) &&
    value.kind === gasMessageKind &&
    typeof value.to === 'string' &&
    typeof value.amount === 'string' &&
    Object.keys(value).length === 3
  )
}

export function isGasResponse(value: unknown): value is GasResponse {
  return (
    isRecord(value) &&
    value.ok === true &&
    value.kind === gasMessageKind &&
    typeof value.eth === 'string' &&
    typeof value.gas === 'string' &&
    findBlockedField(value) === null
  )
}

export type SendRequest = {
  kind: typeof sendMessageKind
  to: string
  amount: string
  password: string
}

export type SendResponse = {
  ok: true
  kind: typeof sendMessageKind
  hash: string
}

export function isSendRequest(value: unknown): value is SendRequest {
  return (
    isRecord(value) &&
    value.kind === sendMessageKind &&
    typeof value.to === 'string' &&
    typeof value.amount === 'string' &&
    typeof value.password === 'string' &&
    Object.keys(value).length === 4
  )
}

export function isSendResponse(value: unknown): value is SendResponse {
  return (
    isRecord(value) &&
    value.ok === true &&
    value.kind === sendMessageKind &&
    typeof value.hash === 'string' &&
    /^0x[0-9a-fA-F]{64}$/.test(value.hash) &&
    findBlockedField(value) === null
  )
}

export type TxRequest = {
  kind: typeof txMessageKind
  hash: string
}

export type TxResponse = {
  ok: true
  kind: typeof txMessageKind
  hash: string
  status: 'pending' | 'success' | 'reverted'
}

export function isTxRequest(value: unknown): value is TxRequest {
  return (
    isRecord(value) &&
    value.kind === txMessageKind &&
    typeof value.hash === 'string' &&
    Object.keys(value).length === 2
  )
}

export function isTxResponse(value: unknown): value is TxResponse {
  return (
    isRecord(value) &&
    value.ok === true &&
    value.kind === txMessageKind &&
    typeof value.hash === 'string' &&
    (value.status === 'pending' || value.status === 'success' || value.status === 'reverted') &&
    findBlockedField(value) === null
  )
}

export function isVaultCommandResponse(value: unknown): value is VaultCommandResponse {
  return (
    isRecord(value) &&
    value.ok === true &&
    (value.kind === createVaultKind ||
      value.kind === unlockVaultKind ||
      value.kind === lockVaultKind) &&
    isVaultPhase(value.vault) &&
    findBlockedField(value) === null
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
