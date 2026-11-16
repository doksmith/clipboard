import { NextRequest, NextResponse } from 'next/server'
import { PasteService } from '@/server/services/paste.service'
import { ApiError } from '@/server/errors/api-error'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const { searchParams } = new URL(request.url)
    const file = searchParams.get('file')
    const queryPassword = searchParams.get('password')
    const headerPassword = request.headers.get('x-paste-password')
    const providedPassword = headerPassword || queryPassword

    const content = await PasteService.getRawContent(id, file, providedPassword)

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return new NextResponse(error.message, { status: error.statusCode })
    }
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    return new NextResponse(message, { status: 500 })
  }
}
