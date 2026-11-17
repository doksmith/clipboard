'use client'

import { useCallback } from 'react'

export function useWebCrypto() {
  const generateKey = useCallback(async (): Promise<string> => {
    const key = await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    )
    const exported = await window.crypto.subtle.exportKey('raw', key)
    return Array.from(new Uint8Array(exported))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }, [])

  const encrypt = useCallback(async (plaintext: string, hexKey: string): Promise<string> => {
    const keyBytes = new Uint8Array(
      hexKey.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
    )
    const key = await window.crypto.subtle.importKey(
      'raw',
      keyBytes,
      'AES-GCM',
      false,
      ['encrypt']
    )
    const iv = window.crypto.getRandomValues(new Uint8Array(12))
    const encoded = new TextEncoder().encode(plaintext)
    const cipherBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      encoded
    )

    const ivHex = Array.from(iv)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
    const cipherHex = Array.from(new Uint8Array(cipherBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    return `${ivHex}:${cipherHex}`
  }, [])

  const decrypt = useCallback(async (ciphertext: string, hexKey: string): Promise<string> => {
    const [ivHex, cipherHex] = ciphertext.split(':')
    if (!ivHex || !cipherHex) {
      throw new Error('Invalid ciphertext format')
    }

    const keyBytes = new Uint8Array(
      hexKey.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
    )
    const key = await window.crypto.subtle.importKey(
      'raw',
      keyBytes,
      'AES-GCM',
      false,
      ['decrypt']
    )

    const iv = new Uint8Array(
      ivHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
    )
    const encryptedBytes = new Uint8Array(
      cipherHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
    )

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      encryptedBytes
    )

    return new TextDecoder().decode(decryptedBuffer)
  }, [])

  return { generateKey, encrypt, decrypt }
}
