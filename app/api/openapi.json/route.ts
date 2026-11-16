import { NextResponse } from 'next/server'
import { generateOpenAPIDocument } from '@/server/openapi/generator'

export async function GET() {
  try {
    const doc = generateOpenAPIDocument()
    return NextResponse.json(doc)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to generate OpenAPI spec'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
