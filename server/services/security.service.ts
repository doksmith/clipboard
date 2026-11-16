import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto'

export class SecurityService {
  static hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex')
    const hash = scryptSync(password, salt, 64).toString('hex')
    return `${salt}:${hash}`
  }

  static verifyPassword(password: string, storedHash: string): boolean {
    try {
      const parts = storedHash.split(':')
      if (parts.length !== 2 || !parts[0] || !parts[1]) return false
      const salt = parts[0]
      const key = parts[1]
      const keyBuffer = Buffer.from(key, 'hex')
      const derivedKey = scryptSync(password, salt, 64)
      return timingSafeEqual(keyBuffer, derivedKey)
    } catch {
      return false
    }
  }
}
