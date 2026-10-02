import { generateMnemonic, mnemonicToAccount, english } from 'viem/accounts'

export const derivationPath = "m/44'/60'/0'/0/0"

export function createMnemonic(): string {
  return generateMnemonic(english)
}

export function deriveAddress(mnemonic: string): `0x${string}` {
  try {
    return mnemonicToAccount(mnemonic, { path: derivationPath }).address
  } catch {
    throw new Error('Kurtarma ifadesi geçersiz')
  }
}

export function mnemonicWords(mnemonic: string): string[] {
  return mnemonic.trim().split(/\s+/)
}

export function normalizeMnemonic(value: string): string {
  const words = value.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length !== 12 && words.length !== 24) {
    throw new Error('Kurtarma ifadesi 12 veya 24 kelime olmalı')
  }
  const mnemonic = words.join(' ')
  deriveAddress(mnemonic)
  return mnemonic
}
