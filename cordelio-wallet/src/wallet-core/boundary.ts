const blockedFields = new Set([
  'mnemonic',
  'seedPhrase',
  'privateKey',
  'password',
  'encryptionKey',
])

export function findBlockedField(value: unknown, depth = 0): string | null {
  if (depth > 6 || value === null || typeof value !== 'object') return null
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findBlockedField(item, depth + 1)
      if (found) return found
    }
    return null
  }
  for (const [key, child] of Object.entries(value)) {
    if (blockedFields.has(key)) return key
    const found = findBlockedField(child, depth + 1)
    if (found) return found
  }
  return null
}
