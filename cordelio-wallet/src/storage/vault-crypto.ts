const defaultIterations = 600_000

export type EncryptedSecret = {
  iterations: number
  salt: string
  iv: string
  ciphertext: string
}

export async function encryptSecret(
  secret: string,
  password: string,
  iterations = defaultIterations,
): Promise<EncryptedSecret> {
  if (password.length < 8) {
    throw new Error('Parola en az 8 karakter olmalı')
  }
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(password, salt, iterations)
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      new TextEncoder().encode(secret),
    ),
  )
  return {
    iterations,
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(ciphertext),
  }
}

export async function decryptSecret(
  encrypted: EncryptedSecret,
  password: string,
): Promise<string> {
  try {
    const key = await deriveKey(
      password,
      base64ToBytes(encrypted.salt),
      encrypted.iterations,
    )
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: copyBytes(base64ToBytes(encrypted.iv)) },
      key,
      copyBytes(base64ToBytes(encrypted.ciphertext)),
    )
    return new TextDecoder().decode(plain)
  } catch {
    throw new Error('Parola yanlış')
  }
}

async function deriveKey(password: string, salt: Uint8Array, iterations: number) {
  const saltBytes = copyBytes(salt)
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: saltBytes, iterations, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

function copyBytes(bytes: Uint8Array): Uint8Array<ArrayBuffer> {
  const copy = new Uint8Array(new ArrayBuffer(bytes.byteLength))
  copy.set(bytes)
  return copy
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes
}
