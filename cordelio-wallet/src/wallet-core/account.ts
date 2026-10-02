declare const addressBrand: unique symbol
declare const accountIdBrand: unique symbol

export type Address = string & { readonly [addressBrand]: 'Address' }
export type AccountId = string & { readonly [accountIdBrand]: 'AccountId' }

export type PublicAccount = {
  id: AccountId
  label: string
  address: Address
}

export function isAddress(value: unknown): value is Address {
  return typeof value === 'string' && /^0x[a-fA-F0-9]{40}$/.test(value)
}

export function isAccountId(value: unknown): value is AccountId {
  return typeof value === 'string' && /^[a-z0-9-]{1,64}$/.test(value)
}

export function isPublicAccount(value: unknown): value is PublicAccount {
  if (!isRecord(value)) return false
  const keys = Object.keys(value)
  return (
    keys.length === 3 &&
    isAccountId(value.id) &&
    typeof value.label === 'string' &&
    value.label.trim().length > 0 &&
    value.label.length <= 40 &&
    isAddress(value.address)
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
