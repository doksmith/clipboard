import { nanoid } from 'nanoid'
import { eq, or, desc, and, like, sql } from 'drizzle-orm'
import { getDb, schema } from '../db'
import { SecurityService } from './security.service'
import { CleanupService } from './cleanup.service'
import { ApiError } from '../errors/api-error'
import type {
  CreatePasteInput,
  UpdatePasteInput,
  PasteQuery,
  CreatePasteResponse,
  ListPastesResponse,
  PasteDetailResponse,
  PasswordRequiredResponse,
} from '../schemas/paste.schema'

export class PasteService {
  static async createPaste(input: CreatePasteInput): Promise<CreatePasteResponse> {
    CleanupService.purgeExpiredPastes()
    const db = getDb()

    // Normalize files input
    let filesInput = input.files
    if (!filesInput || filesInput.length === 0) {
      if (typeof input.content === 'string') {
        filesInput = [
          {
            filename: input.filename?.trim() || 'snippet.txt',
            content: input.content,
            syntax: input.syntax?.trim() || 'text',
          },
        ]
      } else {
        throw ApiError.badRequest('At least one file or content field is required')
      }
    }

    const pasteId = nanoid(10)
    const slug =
      input.slug && input.slug.trim().length > 0
        ? input.slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-')
        : pasteId

    // Check unique slug
    const existing = db
      .select({ id: schema.pastes.id })
      .from(schema.pastes)
      .where(eq(schema.pastes.slug, slug))
      .get()

    if (existing) {
      throw ApiError.conflict('A paste with this slug already exists')
    }

    // Expiry calculation
    let expiresAt: Date | null = null
    if (input.expiresIn && input.expiresIn !== 'never') {
      const now = Date.now()
      if (input.expiresIn === '10m') expiresAt = new Date(now + 10 * 60 * 1000)
      else if (input.expiresIn === '1h') expiresAt = new Date(now + 60 * 60 * 1000)
      else if (input.expiresIn === '1d') expiresAt = new Date(now + 24 * 60 * 60 * 1000)
      else if (input.expiresIn === '7d') expiresAt = new Date(now + 7 * 24 * 60 * 60 * 1000)
      else if (input.expiresIn === '30d') expiresAt = new Date(now + 30 * 24 * 60 * 60 * 1000)
      else if (typeof input.expiresIn === 'number') expiresAt = new Date(now + input.expiresIn)
    }

    const passwordHash = input.password ? SecurityService.hashPassword(input.password) : null
    const now = new Date()

    // Insert main paste
    db.insert(schema.pastes)
      .values({
        id: pasteId,
        title: input.title || null,
        slug,
        description: input.description || null,
        visibility: input.visibility || 'unlisted',
        isEncrypted: Boolean(input.isEncrypted),
        passwordHash,
        expiresAt,
        burnAfterRead: Boolean(input.burnAfterRead),
        viewCount: 0,
        createdAt: now,
        updatedAt: now,
      })
      .run()

    // Insert files
    const insertedFiles = filesInput.map((file, idx) => {
      const fileId = nanoid(12)
      const content = file.content ?? ''
      const filename = file.filename?.trim() || `file-${idx + 1}.txt`
      const syntax = file.syntax?.trim() || 'text'
      const sizeBytes = Buffer.byteLength(content, 'utf8')

      db.insert(schema.pasteFiles)
        .values({
          id: fileId,
          pasteId,
          filename,
          content,
          syntax,
          position: idx,
          sizeBytes,
          createdAt: now,
          updatedAt: now,
        })
        .run()

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
        title: input.title || null,
        visibility: input.visibility || 'unlisted',
        isEncrypted: Boolean(input.isEncrypted),
        hasPassword: Boolean(passwordHash),
        burnAfterRead: Boolean(input.burnAfterRead),
        expiresAt,
        filesCount: insertedFiles.length,
        files: insertedFiles,
        url: `/${slug}`,
        rawUrl: `/raw/${slug}`,
      },
    }
  }

  static async getPaste(
    idOrSlug: string,
    providedPassword?: string | null
  ): Promise<PasteDetailResponse | PasswordRequiredResponse> {
    CleanupService.purgeExpiredPastes()
    const db = getDb()

    const paste = db
      .select()
      .from(schema.pastes)
      .where(or(eq(schema.pastes.id, idOrSlug), eq(schema.pastes.slug, idOrSlug)))
      .get()

    if (!paste) {
      throw ApiError.notFound('Paste not found or has expired')
    }

    // Check expiration
    if (paste.expiresAt && paste.expiresAt.getTime() < Date.now()) {
      db.delete(schema.pastes).where(eq(schema.pastes.id, paste.id)).run()
      throw ApiError.notFound('Paste has expired')
    }

    // Check password protection
    if (paste.passwordHash) {
      if (!providedPassword || !SecurityService.verifyPassword(providedPassword, paste.passwordHash)) {
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
      .select({
        id: schema.pasteFiles.id,
        filename: schema.pasteFiles.filename,
        syntax: schema.pasteFiles.syntax,
        content: schema.pasteFiles.content,
        sizeBytes: schema.pasteFiles.sizeBytes,
        position: schema.pasteFiles.position,
        createdAt: schema.pasteFiles.createdAt,
      })
      .from(schema.pasteFiles)
      .where(eq(schema.pasteFiles.pasteId, paste.id))
      .orderBy(schema.pasteFiles.position)
      .all()

    // Increment view count
    db.update(schema.pastes)
      .set({ viewCount: paste.viewCount + 1 })
      .where(eq(schema.pastes.id, paste.id))
      .run()

    // Burn after read handling
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
      requiresPassword: false,
    }
  }

  static async listPastes(query: PasteQuery): Promise<ListPastesResponse> {
    CleanupService.purgeExpiredPastes()
    const db = getDb()

    const page = Math.max(1, query.page || 1)
    const limit = Math.min(50, Math.max(1, query.limit || 20))
    const offset = (page - 1) * limit
    const search = query.q?.trim() || ''

    const whereConditions = [
      eq(schema.pastes.visibility, 'public'),
      eq(schema.pastes.burnAfterRead, false),
    ]

    if (search) {
      whereConditions.push(
        or(
          like(schema.pastes.title, `%${search}%`),
          like(schema.pastes.description, `%${search}%`),
          like(schema.pastes.slug, `%${search}%`)
        )!
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
  }

  static async updatePaste(idOrSlug: string, input: UpdatePasteInput): Promise<PasteDetailResponse> {
    const db = getDb()

    const paste = db
      .select()
      .from(schema.pastes)
      .where(or(eq(schema.pastes.id, idOrSlug), eq(schema.pastes.slug, idOrSlug)))
      .get()

    if (!paste) {
      throw ApiError.notFound('Paste not found')
    }

    const now = new Date()

    // Create revision snapshot
    const existingFiles = db
      .select()
      .from(schema.pasteFiles)
      .where(eq(schema.pasteFiles.pasteId, paste.id))
      .all()

    const revisionCount =
      db
        .select({ count: sql<number>`count(*)` })
        .from(schema.pasteRevisions)
        .where(eq(schema.pasteRevisions.pasteId, paste.id))
        .get()?.count || 0

    db.insert(schema.pasteRevisions)
      .values({
        id: nanoid(12),
        pasteId: paste.id,
        revisionNumber: revisionCount + 1,
        diffPatch: JSON.stringify(existingFiles),
        createdAt: now,
      })
      .run()

    // Remove existing files and replace with updated set
    db.delete(schema.pasteFiles).where(eq(schema.pasteFiles.pasteId, paste.id)).run()

    const updatedFiles = input.files.map((file, idx) => {
      const fileId = nanoid(12)
      const content = file.content ?? ''
      const filename = file.filename?.trim() || `file-${idx + 1}.txt`
      const syntax = file.syntax?.trim() || 'text'
      const sizeBytes = Buffer.byteLength(content, 'utf8')

      db.insert(schema.pasteFiles)
        .values({
          id: fileId,
          pasteId: paste.id,
          filename,
          content,
          syntax,
          position: idx,
          sizeBytes,
          createdAt: now,
          updatedAt: now,
        })
        .run()

      return {
        id: fileId,
        filename,
        content,
        syntax,
        sizeBytes,
        position: idx,
        createdAt: now,
      }
    })

    // Update main paste metadata
    db.update(schema.pastes)
      .set({
        title: input.title !== undefined ? input.title : paste.title,
        description: input.description !== undefined ? input.description : paste.description,
        updatedAt: now,
      })
      .where(eq(schema.pastes.id, paste.id))
      .run()

    return {
      id: paste.id,
      title: input.title !== undefined ? input.title : paste.title,
      slug: paste.slug,
      description: input.description !== undefined ? input.description : paste.description,
      visibility: paste.visibility,
      isEncrypted: paste.isEncrypted,
      burnAfterRead: paste.burnAfterRead,
      hasPassword: Boolean(paste.passwordHash),
      viewCount: paste.viewCount,
      expiresAt: paste.expiresAt,
      createdAt: paste.createdAt,
      updatedAt: now,
      files: updatedFiles,
      requiresPassword: false,
    }
  }

  static async getRawContent(
    idOrSlug: string,
    targetFile?: string | null,
    providedPassword?: string | null
  ): Promise<string> {
    CleanupService.purgeExpiredPastes()
    const db = getDb()

    const paste = db
      .select()
      .from(schema.pastes)
      .where(or(eq(schema.pastes.id, idOrSlug), eq(schema.pastes.slug, idOrSlug)))
      .get()

    if (!paste) {
      throw ApiError.notFound('Paste not found')
    }

    if (paste.expiresAt && paste.expiresAt.getTime() < Date.now()) {
      db.delete(schema.pastes).where(eq(schema.pastes.id, paste.id)).run()
      throw ApiError.notFound('Paste has expired')
    }

    if (paste.passwordHash) {
      if (!providedPassword || !SecurityService.verifyPassword(providedPassword, paste.passwordHash)) {
        throw ApiError.unauthorized('Password required')
      }
    }

    const files = db
      .select()
      .from(schema.pasteFiles)
      .where(eq(schema.pasteFiles.pasteId, paste.id))
      .orderBy(schema.pasteFiles.position)
      .all()

    if (files.length === 0) {
      return ''
    }

    if (paste.burnAfterRead) {
      db.delete(schema.pastes).where(eq(schema.pastes.id, paste.id)).run()
    }

    if (targetFile) {
      const match = files.find((f) => f.filename === targetFile || f.id === targetFile)
      if (match) return match.content
    }

    if (files.length === 1) {
      return files[0]?.content ?? ''
    }

    return files.map((f) => `=== [${f.filename}] ===\n${f.content}`).join('\n\n')
  }
}
