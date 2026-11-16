import { lt, and, isNotNull } from 'drizzle-orm'
import { useDb, schema } from './db'

export function purgeExpiredPastes() {
  const db = useDb()
  const now = new Date()

  try {
    db.delete(schema.pastes)
      .where(
        and(
          isNotNull(schema.pastes.expiresAt),
          lt(schema.pastes.expiresAt, now),
        ),
      )
      .run()
  } catch (error) {
    console.error('[Purge Error]', error)
  }
}
