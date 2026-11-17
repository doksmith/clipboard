import { NextRequest, NextResponse } from 'next/server'
import { PasteService } from '@/server/services/paste.service'
import { ApiError } from '@/server/errors/api-error'

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const result = await PasteService.incrementView(id)
    return NextResponse.json(result)
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { success: false, error: error.message, details: error.details },
        { status: error.statusCode }
      )
    }
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
