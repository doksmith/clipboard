import { NextRequest, NextResponse } from 'next/server'
import { PasteService } from '@/server/services/paste.service'
import { UpdatePasteSchema } from '@/server/schemas/paste.schema'
import { ApiError } from '@/server/errors/api-error'
import { ZodError } from 'zod'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const { searchParams } = new URL(request.url)

    const queryPassword = searchParams.get('password')
    const headerPassword = request.headers.get('x-paste-password')
    const providedPassword = headerPassword || queryPassword

    const result = await PasteService.getPaste(id, providedPassword)
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

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const validatedInput = UpdatePasteSchema.parse(body)

    const result = await PasteService.updatePaste(id, validatedInput)
    return NextResponse.json(result)
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
