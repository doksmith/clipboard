export function useWebCrypto() {
  async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const enc = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey'],
    )
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as unknown as BufferSource,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt'],
    )
  }

  async function encryptText(plaintext: string, password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const key = await deriveKey(password, salt)
    const enc = new TextEncoder()

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv as unknown as BufferSource },
      key,
      enc.encode(plaintext),
    )

    const payload = {
      salt: Array.from(salt),
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encrypted)),
    }

    return btoa(JSON.stringify(payload))
  }

  async function decryptText(encryptedBase64: string, password: string): Promise<string> {
    try {
      const parsed = JSON.parse(atob(encryptedBase64))
      const salt = new Uint8Array(parsed.salt)
      const iv = new Uint8Array(parsed.iv)
      const data = new Uint8Array(parsed.data)

      const key = await deriveKey(password, salt)
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv as unknown as BufferSource },
        key,
        data as unknown as BufferSource,
      )

      const dec = new TextDecoder()
      return dec.decode(decrypted)
    } catch {
      throw new Error('Failed to decrypt: incorrect password or corrupted ciphertext')
    }
  }

  return {
    encryptText,
    decryptText,
  }
}
