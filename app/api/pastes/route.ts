import { NextRequest, NextResponse } from 'next/server'
import { PasteService } from '@/server/services/paste.service'
import { CreatePasteSchema, PasteQuerySchema } from '@/server/schemas/paste.schema'
import { ApiError } from '@/server/errors/api-error'
import { ZodError } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const rawQuery = {
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
      q: searchParams.get('q') || undefined,
    }

    const query = PasteQuerySchema.parse(rawQuery)
    const result = await PasteService.listPastes(query)

    return NextResponse.json(result)
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameters', details: error.issues },
        { status: 400 }
      )
    }
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedInput = CreatePasteSchema.parse(body)
    const result = await PasteService.createPaste(validatedInput)

    return NextResponse.json(result, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }
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
