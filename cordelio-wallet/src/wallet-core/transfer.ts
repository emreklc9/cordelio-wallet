import {
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
} from 'viem'
import { mnemonicToAccount } from 'viem/accounts'
import { sepolia } from 'viem/chains'
import { networks } from './network.ts'
import { derivationPath } from './mnemonic.ts'
import { formatWeiHex } from './balance.ts'

export type TransferStatus = 'pending' | 'success' | 'reverted'

export function parseTransferAmount(value: string): bigint {
  const amount = value.trim()
  if (!/^\d+(\.\d{1,18})?$/.test(amount)) throw new Error('Miktar geçersiz')
  const wei = parseEther(amount)
  if (wei <= 0n) throw new Error('Miktar geçersiz')
  return wei
}

export function asHexAddress(value: string): `0x${string}` {
  if (!/^0x[a-fA-F0-9]{40}$/.test(value)) throw new Error('Adres geçersiz')
  return value as `0x${string}`
}

export function asTransferHash(value: string): `0x${string}` {
  if (!/^0x[a-fA-F0-9]{64}$/.test(value)) throw new Error('İşlem bulunamadı')
  return value as `0x${string}`
}

export function transferFeeEth(gas: bigint, maxFeePerGas: bigint): string {
  return formatWeiHex(`0x${(gas * maxFeePerGas).toString(16)}`)
}

export function chainErrorMessage(text: string, fallback: string): string {
  if (/insufficient funds|outoffunds/i.test(text)) return 'Bakiye yetersiz'
  return fallback
}

export function publicChainError(error: unknown, fallback: string): string {
  return chainErrorMessage(errorText(error), fallback)
}

export function receiptStatus(status: string): 'success' | 'reverted' {
  if (status === 'success' || status === 'reverted') return status
  throw new Error('İşlem durumu okunamadı')
}

export async function estimateSepoliaTransfer(
  from: `0x${string}`,
  to: `0x${string}`,
  value: bigint,
): Promise<{ eth: string; gas: string }> {
  const client = publicClient()
  await assertSepolia(client)
  try {
    const gas = await client.estimateGas({ account: from, to, value })
    const maxFeePerGas = await maxFee(client)
    return { eth: transferFeeEth(gas, maxFeePerGas), gas: gas.toString() }
  } catch (error) {
    if (error instanceof Error && error.message === 'Ağ Sepolia değil') throw error
    throw new Error(publicChainError(error, 'Ücret tahmin edilemedi'))
  }
}

export async function sendSepoliaTransfer(
  mnemonic: string,
  to: `0x${string}`,
  value: bigint,
): Promise<`0x${string}`> {
  const account = mnemonicToAccount(mnemonic, { path: derivationPath })
  const client = createWalletClient({
    account,
    chain: sepolia,
    transport: http(networks.sepolia.rpcUrl),
  })
  await assertSepolia(client)
  try {
    return asTransferHash(await client.sendTransaction({ chain: sepolia, to, value }))
  } catch (error) {
    if (error instanceof Error && error.message === 'Ağ Sepolia değil') throw error
    throw new Error(publicChainError(error, 'İşlem gönderilemedi'))
  }
}

export async function readSepoliaTransfer(hash: string): Promise<TransferStatus> {
  const transferHash = asTransferHash(hash)
  const client = publicClient()
  await assertSepolia(client)
  try {
    const receipt = await client.getTransactionReceipt({ hash: transferHash })
    return receiptStatus(receipt.status)
  } catch (error) {
    if (isMissingReceipt(error)) return 'pending'
    if (error instanceof Error && error.message === 'İşlem bulunamadı') throw error
    throw new Error('İşlem durumu okunamadı')
  }
}

function publicClient() {
  return createPublicClient({
    chain: sepolia,
    transport: http(networks.sepolia.rpcUrl),
  })
}

async function assertSepolia(client: { getChainId: () => Promise<number> }) {
  if (sepolia.id !== networks.sepolia.chainId) throw new Error('Ağ Sepolia değil')
  if ((await client.getChainId()) !== sepolia.id) throw new Error('Ağ Sepolia değil')
}

async function maxFee(client: ReturnType<typeof publicClient>): Promise<bigint> {
  try {
    const fees = await client.estimateFeesPerGas()
    return fees.maxFeePerGas
  } catch {
    return client.getGasPrice()
  }
}

function isMissingReceipt(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === 'TransactionReceiptNotFoundError' || error.name === 'TransactionNotFoundError')
  )
}

function errorText(error: unknown): string {
  const parts: string[] = []
  let current: unknown = error
  for (let depth = 0; depth < 6 && current instanceof Error; depth += 1) {
    parts.push(current.name, current.message)
    if ('details' in current && typeof current.details === 'string') parts.push(current.details)
    if ('shortMessage' in current && typeof current.shortMessage === 'string') {
      parts.push(current.shortMessage)
    }
    current = 'cause' in current ? current.cause : undefined
  }
  return parts.join(' ')
}
