import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

export const pastes = sqliteTable('pastes', {
  id: text('id').primaryKey(),
  title: text('title'),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  visibility: text('visibility').$type<'public' | 'unlisted' | 'private'>().default('unlisted').notNull(),
  isEncrypted: integer('is_encrypted', { mode: 'boolean' }).default(false).notNull(),
  passwordHash: text('password_hash'),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }),
  burnAfterRead: integer('burn_after_read', { mode: 'boolean' }).default(false).notNull(),
  viewCount: integer('view_count').default(0).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
})

export const pasteFiles = sqliteTable('paste_files', {
  id: text('id').primaryKey(),
  pasteId: text('paste_id')
    .notNull()
    .references(() => pastes.id, { onDelete: 'cascade' }),
  filename: text('filename').default('snippet.txt').notNull(),
  content: text('content').default('').notNull(),
  syntax: text('syntax').default('text').notNull(),
  position: integer('position').default(0).notNull(),
  sizeBytes: integer('size_bytes').default(0).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
})

export const pasteRevisions = sqliteTable('paste_revisions', {
  id: text('id').primaryKey(),
  pasteId: text('paste_id')
    .notNull()
    .references(() => pastes.id, { onDelete: 'cascade' }),
  revisionNumber: integer('revision_number').notNull(),
  diffPatch: text('diff_patch').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
})

export const pastesRelations = relations(pastes, ({ many }) => ({
  files: many(pasteFiles),
  revisions: many(pasteRevisions),
}))

export const pasteFilesRelations = relations(pasteFiles, ({ one }) => ({
  paste: one(pastes, {
    fields: [pasteFiles.pasteId],
    references: [pastes.id],
  }),
}))

export const pasteRevisionsRelations = relations(pasteRevisions, ({ one }) => ({
  paste: one(pastes, {
    fields: [pasteRevisions.pasteId],
    references: [pastes.id],
  }),
}))

export type Paste = typeof pastes.$inferSelect
export type NewPaste = typeof pastes.$inferInsert
export type PasteFile = typeof pasteFiles.$inferSelect
export type NewPasteFile = typeof pasteFiles.$inferInsert
export type PasteRevision = typeof pasteRevisions.$inferSelect
