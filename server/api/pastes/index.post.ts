import { nanoid } from 'nanoid'
import { eq } from 'drizzle-orm'
import { useDb, schema } from '../../utils/db'
import { hashPassword } from '../../utils/security'
import { purgeExpiredPastes } from '../../utils/cleanup'

export default defineEventHandler(async (event) => {
  purgeExpiredPastes()
  const db = useDb()
  const body = await readBody(event)

  if (!body) {
    throw createError({ statusCode: 400, statusMessage: 'Request body is required' })
  }

  // Support single content shortcut or multi-file array
  let filesInput = body.files as Array<{ filename?: string; content?: string; syntax?: string }> | undefined
  if (!filesInput || !Array.isArray(filesInput) || filesInput.length === 0) {
    if (typeof body.content === 'string') {
      filesInput = [{
        filename: body.filename || 'snippet.txt',
        content: body.content,
        syntax: body.syntax || 'text',
      }]
    } else {
      throw createError({ statusCode: 400, statusMessage: 'At least one file or content is required' })
    }
  }

  const pasteId = nanoid(10)
  const slug = (body.slug && typeof body.slug === 'string' && body.slug.trim().length > 0)
    ? body.slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-')
    : pasteId

  // Check if custom slug already exists
  const existing = db.select().from(schema.pastes).where(eq(schema.pastes.slug, slug)).get()
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'A paste with this slug or URL already exists' })
  }

  // Calculate expiration
  let expiresAt: Date | null = null
  if (body.expiresIn) {
    const now = Date.now()
    if (body.expiresIn === '10m') expiresAt = new Date(now + 10 * 60 * 1000)
    else if (body.expiresIn === '1h') expiresAt = new Date(now + 60 * 60 * 1000)
    else if (body.expiresIn === '1d') expiresAt = new Date(now + 24 * 60 * 60 * 1000)
    else if (body.expiresIn === '7d') expiresAt = new Date(now + 7 * 24 * 60 * 60 * 1000)
    else if (body.expiresIn === '30d') expiresAt = new Date(now + 30 * 24 * 60 * 60 * 1000)
    else if (typeof body.expiresIn === 'number') expiresAt = new Date(now + body.expiresIn)
  }

  const passwordHash = body.password ? hashPassword(body.password) : null
  const now = new Date()

  // Insert paste record
  db.insert(schema.pastes).values({
    id: pasteId,
    title: body.title || null,
    slug,
    description: body.description || null,
    visibility: ['public', 'unlisted', 'private'].includes(body.visibility) ? body.visibility : 'unlisted',
    isEncrypted: Boolean(body.isEncrypted),
    passwordHash,
    expiresAt,
    burnAfterRead: Boolean(body.burnAfterRead),
    viewCount: 0,
    createdAt: now,
    updatedAt: now,
  }).run()

  // Insert files
  const insertedFiles = filesInput.map((file, idx) => {
    const fileId = nanoid(12)
    const content = file.content ?? ''
    const filename = file.filename?.trim() || `file-${idx + 1}.txt`
    const syntax = file.syntax?.trim() || 'text'
    const sizeBytes = Buffer.byteLength(content, 'utf8')

    db.insert(schema.pasteFiles).values({
      id: fileId,
      pasteId,
      filename,
      content,
      syntax,
      position: idx,
      sizeBytes,
      createdAt: now,
      updatedAt: now,
    }).run()

    return {
      id: fileId,
      filename,
      syntax,
      sizeBytes,
    }
  })

  return {
    success: true,
    paste: {
      id: pasteId,
      slug,
      title: body.title || null,
      visibility: body.visibility || 'unlisted',
      isEncrypted: Boolean(body.isEncrypted),
      hasPassword: Boolean(passwordHash),
      burnAfterRead: Boolean(body.burnAfterRead),
      expiresAt,
      filesCount: insertedFiles.length,
      files: insertedFiles,
      url: `/${slug}`,
      rawUrl: `/raw/${slug}`,
    },
  }
})
