import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from '../database/schema'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null
let _sqlite: Database.Database | null = null

export function useDb() {
  if (_db) return _db

  const dbPath = process.env.DATABASE_URL || resolve(process.cwd(), '.data/clipboard.db')
  const dir = dirname(dbPath)

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }

  _sqlite = new Database(dbPath)
  // Enable WAL mode for high performance concurrent reads and writes
  _sqlite.pragma('journal_mode = WAL')
  _sqlite.pragma('foreign_keys = ON')

  // Auto-create tables if they don't exist
  _sqlite.exec(`
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

  _db = drizzle(_sqlite, { schema })
  return _db
}

export { schema }
