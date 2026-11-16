import { NextResponse } from 'next/server'
import { getDb } from '@/server/db'

export async function GET() {
  try {
    const db = getDb()
    // Perform a lightweight query check
    db.run('SELECT 1')

    return NextResponse.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: 'connected',
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Database check failed'
    return NextResponse.json(
      {
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        error: message,
      },
      { status: 500 }
    )
  }
}
