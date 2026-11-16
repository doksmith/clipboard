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
    throw createError({ statusCode: 404, statusMessage: 'Paste not found' })
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
      throw createError({ statusCode: 401, statusMessage: 'Password required' })
    }
  }

  const query = getQuery(event)
  const fileQuery = typeof query.file === 'string' ? query.file : null

  const files = db
    .select()
    .from(schema.pasteFiles)
    .where(eq(schema.pasteFiles.pasteId, paste.id))
    .orderBy(schema.pasteFiles.position)
    .all()

  if (files.length === 0) {
    setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
    return ''
  }

  // Burn-after-read check
  if (paste.burnAfterRead) {
    db.delete(schema.pastes).where(eq(schema.pastes.id, paste.id)).run()
  }

  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')

  if (fileQuery) {
    const matched = files.find(f => f.filename === fileQuery || f.id === fileQuery)
    if (matched) return matched.content
  }

  // If single file, return directly. If multiple, format clearly with headers
  if (files.length === 1) {
    return files[0]?.content ?? ''
  }

  return files
    .map(f => `=== [${f.filename}] ===\n${f.content}`)
    .join('\n\n')
})
