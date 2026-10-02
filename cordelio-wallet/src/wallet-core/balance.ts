import { networks } from './network.ts'

export function formatWeiHex(weiHex: string): string {
  if (!/^0x[0-9a-fA-F]+$/.test(weiHex)) {
    throw new Error('Bakiye okunamadı')
  }
  const wei = BigInt(weiHex)
  const ether = 10n ** 18n
  const whole = wei / ether
  const fraction = (wei % ether).toString().padStart(18, '0').slice(0, 6).replace(/0+$/, '')
  if (wei > 0n && whole === 0n && !fraction) return '< 0.000001'
  return fraction ? `${whole}.${fraction}` : whole.toString()
}

export async function readSepoliaBalance(address: string): Promise<string> {
  const response = await fetch(networks.sepolia.rpcUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_getBalance',
      params: [address, 'latest'],
    }),
    signal: AbortSignal.timeout(8_000),
  })
  if (!response.ok) throw new Error('Sepolia yanıt vermedi')
  const body: unknown = await response.json()
  if (!isRpcBalance(body)) throw new Error('Bakiye okunamadı')
  return formatWeiHex(body.result)
}

function isRpcBalance(value: unknown): value is { result: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'result' in value &&
    typeof value.result === 'string'
  )
}
