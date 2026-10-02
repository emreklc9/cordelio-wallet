export const networks = {
  sepolia: {
    id: 'sepolia',
    chainId: 11_155_111,
    name: 'Sepolia',
    nativeSymbol: 'ETH',
    rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
  },
} as const

export type NetworkId = keyof typeof networks
export type Network = (typeof networks)[NetworkId]

export function isNetworkId(value: unknown): value is NetworkId {
  return value === 'sepolia'
}
