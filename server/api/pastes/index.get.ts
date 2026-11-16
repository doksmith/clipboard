import { desc, eq, and, or, like, sql } from 'drizzle-orm'
import { useDb, schema } from '../../utils/db'
import { purgeExpiredPastes } from '../../utils/cleanup'

export default defineEventHandler(async (event) => {
  purgeExpiredPastes()
  const db = useDb()
  const query = getQuery(event)

  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 20))
  const offset = (page - 1) * limit
  const search = typeof query.q === 'string' ? query.q.trim() : ''

  const whereConditions = [
    eq(schema.pastes.visibility, 'public'),
    eq(schema.pastes.burnAfterRead, false),
  ]

  if (search) {
    whereConditions.push(
      or(
        like(schema.pastes.title, `%${search}%`),
        like(schema.pastes.description, `%${search}%`),
        like(schema.pastes.slug, `%${search}%`),
      )!,
    )
  }

  const items = db
    .select({
      id: schema.pastes.id,
      title: schema.pastes.title,
      slug: schema.pastes.slug,
      description: schema.pastes.description,
      isEncrypted: schema.pastes.isEncrypted,
      hasPassword: sql<boolean>`${schema.pastes.passwordHash} IS NOT NULL`,
      viewCount: schema.pastes.viewCount,
      createdAt: schema.pastes.createdAt,
      updatedAt: schema.pastes.updatedAt,
    })
    .from(schema.pastes)
    .where(and(...whereConditions))
    .orderBy(desc(schema.pastes.createdAt))
    .limit(limit)
    .offset(offset)
    .all()

  // Attach file counts and primary syntaxes
  const enriched = items.map((paste) => {
    const files = db
      .select({
        id: schema.pasteFiles.id,
        filename: schema.pasteFiles.filename,
        syntax: schema.pasteFiles.syntax,
        sizeBytes: schema.pasteFiles.sizeBytes,
      })
      .from(schema.pasteFiles)
      .where(eq(schema.pasteFiles.pasteId, paste.id))
      .orderBy(schema.pasteFiles.position)
      .all()

    return {
      ...paste,
      files,
      filesCount: files.length,
    }
  })

  return {
    page,
    limit,
    items: enriched,
  }
})
