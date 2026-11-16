import { eq, or } from 'drizzle-orm'
import { useDb, schema } from '../../utils/db'
import { verifyPassword } from '../../utils/security'
import { purgeExpiredPastes } from '../../utils/cleanup'

export default defineEventHandler(async (event) => {
  purgeExpiredPastes()
  const db = useDb()
  const param = getRouterParam(event, 'id')

  if (!param) {
    throw createError({ statusCode: 400, statusMessage: 'Paste identifier required' })
  }

  const paste = db
    .select()
    .from(schema.pastes)
    .where(or(eq(schema.pastes.id, param), eq(schema.pastes.slug, param)))
    .get()

  if (!paste) {
    throw createError({ statusCode: 404, statusMessage: 'Paste not found or has expired' })
  }

  // Check TTL
  if (paste.expiresAt && paste.expiresAt.getTime() < Date.now()) {
    db.delete(schema.pastes).where(eq(schema.pastes.id, paste.id)).run()
    throw createError({ statusCode: 404, statusMessage: 'Paste has expired' })
  }

  // Check password if protected
  if (paste.passwordHash) {
    const query = getQuery(event)
    const headerPass = getHeader(event, 'x-paste-password')
    const queryPass = typeof query.password === 'string' ? query.password : null
    const providedPass = headerPass || queryPass

    if (!providedPass || !verifyPassword(providedPass, paste.passwordHash)) {
      return {
        requiresPassword: true,
        id: paste.id,
        slug: paste.slug,
        title: paste.title,
        isEncrypted: paste.isEncrypted,
        createdAt: paste.createdAt,
      }
    }
  }

  // Retrieve files
  const files = db
    .select()
    .from(schema.pasteFiles)
    .where(eq(schema.pasteFiles.pasteId, paste.id))
    .orderBy(schema.pasteFiles.position)
    .all()

  // Increment view count
  db.update(schema.pastes)
    .set({ viewCount: paste.viewCount + 1 })
    .where(eq(schema.pastes.id, paste.id))
    .run()

  // Handle burn-after-read: delete paste immediately after successful read
  if (paste.burnAfterRead) {
    db.delete(schema.pastes).where(eq(schema.pastes.id, paste.id)).run()
  }

  return {
    id: paste.id,
    title: paste.title,
    slug: paste.slug,
    description: paste.description,
    visibility: paste.visibility,
    isEncrypted: paste.isEncrypted,
    burnAfterRead: paste.burnAfterRead,
    hasPassword: Boolean(paste.passwordHash),
    viewCount: paste.viewCount + 1,
    expiresAt: paste.expiresAt,
    createdAt: paste.createdAt,
    updatedAt: paste.updatedAt,
    files,
  }
})
