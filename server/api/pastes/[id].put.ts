import { eq, or } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { useDb, schema } from '../../utils/db'
import { verifyPassword } from '../../utils/security'

export default defineEventHandler(async (event) => {
  const db = useDb()
  const param = getRouterParam(event, 'id')
  const body = await readBody(event)

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

  // Verify password if protected
  if (paste.passwordHash) {
    const headerPass = getHeader(event, 'x-paste-password') || body?.password
    if (!headerPass || !verifyPassword(headerPass, paste.passwordHash)) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid or missing password' })
    }
  }

  const now = new Date()

  // Update title / description if provided
  db.update(schema.pastes)
    .set({
      title: body.title !== undefined ? body.title : paste.title,
      description: body.description !== undefined ? body.description : paste.description,
      updatedAt: now,
    })
    .where(eq(schema.pastes.id, paste.id))
    .run()

  // If new files provided, replace or update
  if (Array.isArray(body.files) && body.files.length > 0) {
    // Delete existing files
    db.delete(schema.pasteFiles).where(eq(schema.pasteFiles.pasteId, paste.id)).run()

    // Insert updated files
    body.files.forEach((file: { filename?: string; content?: string; syntax?: string }, idx: number) => {
      const fileId = nanoid(12)
      const content = file.content ?? ''
      const filename = file.filename?.trim() || `file-${idx + 1}.txt`
      const syntax = file.syntax?.trim() || 'text'
      const sizeBytes = Buffer.byteLength(content, 'utf8')

      db.insert(schema.pasteFiles).values({
        id: fileId,
        pasteId: paste.id,
        filename,
        content,
        syntax,
        position: idx,
        sizeBytes,
        createdAt: now,
        updatedAt: now,
      }).run()
    })

    // Record revision
    const existingRevisions = db
      .select()
      .from(schema.pasteRevisions)
      .where(eq(schema.pasteRevisions.pasteId, paste.id))
      .all()

    db.insert(schema.pasteRevisions).values({
      id: nanoid(10),
      pasteId: paste.id,
      revisionNumber: existingRevisions.length + 1,
      diffPatch: JSON.stringify(body.files),
      createdAt: now,
    }).run()
  }

  return { success: true, updatedAt: now }
})
