import { NextRequest, NextResponse } from 'next/server'
import QRCode, { QRCodeErrorCorrectionLevel } from 'qrcode'

const VALID_LEVELS: QRCodeErrorCorrectionLevel[] = ['L', 'M', 'Q', 'H']

function normalizeColor(color: string | null, fallback: string): string {
  if (!color) return fallback
  const trimmed = color.trim()
  if (/^[0-9a-fA-F]{3,8}$/.test(trimmed)) {
    return `#${trimmed}`
  }
  return trimmed
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Teks / payload target
    const text = searchParams.get('text') || searchParams.get('data') || searchParams.get('url')
    if (!text || text.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required query parameter: text (or data / url)',
        },
        { status: 400 }
      )
    }

    // Format output: svg | png
    const rawFormat = (searchParams.get('format') || searchParams.get('type') || 'svg').toLowerCase()
    const format = rawFormat === 'png' ? 'png' : 'svg'

    // Ukuran / lebar
    const rawSize = parseInt(searchParams.get('size') || searchParams.get('width') || '256', 10)
    const size = isNaN(rawSize) ? 256 : Math.max(32, Math.min(2048, rawSize))

    // Margin (quiet zone)
    const rawMargin = parseInt(searchParams.get('margin') || '2', 10)
    const margin = isNaN(rawMargin) ? 2 : Math.max(0, Math.min(10, rawMargin))

    // Error correction level: L, M, Q, H
    const rawLevel = (searchParams.get('level') || searchParams.get('ecl') || 'M').toUpperCase() as QRCodeErrorCorrectionLevel
    const level: QRCodeErrorCorrectionLevel = VALID_LEVELS.includes(rawLevel) ? rawLevel : 'M'

    // Warna dark (foreground) & light (background)
    const dark = normalizeColor(searchParams.get('dark') || searchParams.get('color'), '#000000')
    const light = normalizeColor(searchParams.get('light') || searchParams.get('bg'), '#ffffff')

    // Download attachment trigger
    const isDownload =
      searchParams.get('download') === 'true' ||
      searchParams.get('download') === '1' ||
      searchParams.has('dl')

    const qrOptions = {
      width: size,
      margin,
      errorCorrectionLevel: level,
      color: {
        dark,
        light,
      },
    }

    const headers: Record<string, string> = {
      'Cache-Control': 'public, max-age=31536000, immutable',
    }

    if (format === 'svg') {
      const svg = await QRCode.toString(text, {
        ...qrOptions,
        type: 'svg',
      })

      headers['Content-Type'] = 'image/svg+xml; charset=utf-8'
      if (isDownload) {
        headers['Content-Disposition'] = 'attachment; filename="qrcode.svg"'
      }

      return new NextResponse(svg, { status: 200, headers })
    }

    // Format PNG
    const buffer = await QRCode.toBuffer(text, {
      ...qrOptions,
      type: 'png',
    })

    headers['Content-Type'] = 'image/png'
    if (isDownload) {
      headers['Content-Disposition'] = 'attachment; filename="qrcode.png"'
    }

    return new NextResponse(new Uint8Array(buffer), { status: 200, headers })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate QR code'
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    )
  }
}
