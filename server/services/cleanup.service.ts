import { lt } from 'drizzle-orm'
import { getDb, schema } from '../db'

export class CleanupService {
  static purgeExpiredPastes(): void {
    try {
      const db = getDb()
      const now = new Date()
      db.delete(schema.pastes)
        .where(lt(schema.pastes.expiresAt, now))
        .run()
    } catch {
      // Ignore background cleanup failures so request is never blocked
    }
  }
}
