import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './schema'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

declare global {
  // eslint-disable-next-line no-var
  var __dbInstance: BetterSQLite3Database<typeof schema> | undefined
  // eslint-disable-next-line no-var
  var __sqliteInstance: Database.Database | undefined
}

export function getDb(): BetterSQLite3Database<typeof schema> {
  if (globalThis.__dbInstance) {
    return globalThis.__dbInstance
  }

  const dbPath = process.env.DATABASE_URL || resolve(process.cwd(), '.data/clipboard.db')
  const dir = dirname(dbPath)

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }

  const sqlite = new Database(dbPath)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS pastes (
      id TEXT PRIMARY KEY,
      title TEXT,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      visibility TEXT NOT NULL DEFAULT 'unlisted',
      is_encrypted INTEGER NOT NULL DEFAULT 0,
      password_hash TEXT,
      expires_at INTEGER,
      burn_after_read INTEGER NOT NULL DEFAULT 0,
      view_count INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS paste_files (
      id TEXT PRIMARY KEY,
      paste_id TEXT NOT NULL,
      filename TEXT NOT NULL DEFAULT 'snippet.txt',
      content TEXT NOT NULL DEFAULT '',
      syntax TEXT NOT NULL DEFAULT 'text',
      position INTEGER NOT NULL DEFAULT 0,
      size_bytes INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (paste_id) REFERENCES pastes (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS paste_revisions (
      id TEXT PRIMARY KEY,
      paste_id TEXT NOT NULL,
      revision_number INTEGER NOT NULL,
      diff_patch TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (paste_id) REFERENCES pastes (id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_pastes_slug ON pastes(slug);
    CREATE INDEX IF NOT EXISTS idx_pastes_expires_at ON pastes(expires_at);
    CREATE INDEX IF NOT EXISTS idx_paste_files_paste_id ON paste_files(paste_id);
  `)

  const db = drizzle(sqlite, { schema })

  if (process.env.NODE_ENV !== 'production') {
    globalThis.__sqliteInstance = sqlite
    globalThis.__dbInstance = db
  }

  return db
}

export { schema }
