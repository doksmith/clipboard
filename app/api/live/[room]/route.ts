import { NextRequest } from 'next/server'
import { liveHub, RealtimeMessage } from '@/server/services/live-hub.service'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ room: string }> }
) {
  const { room } = await params
  const { searchParams } = new URL(req.url)
  const peerId = searchParams.get('peerId') || `peer-${Math.random().toString(36).substring(2, 9)}`
  const name = searchParams.get('name') || `User-${peerId.substring(peerId.length - 4)}`
  const color = searchParams.get('color') || '#3b82f6'

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()

      const send = (data: RealtimeMessage) => {
        try {
          const payload = `data: ${JSON.stringify(data)}\n\n`
          controller.enqueue(encoder.encode(payload))
        } catch {
          // Stream might be closed
        }
      }

      // 1. Send initial connected event
      send({
        type: 'connected',
        peerId,
        room,
        payload: {
          currentPeers: liveHub.getPeers(room),
        },
        timestamp: Date.now(),
      })

      // 2. Register with the live hub
      liveHub.join(room, peerId, name, color, (msg) => {
        send(msg)
      })

      // 3. Keep-alive heartbeat every 15s to keep HTTP connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'))
        } catch {
          clearInterval(heartbeat)
        }
      }, 15000)

      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        liveHub.leave(room, peerId)
        try {
          controller.close()
        } catch {
          // Closed
        }
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable proxy buffering for nginx
    },
  })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ room: string }> }
) {
  const { room } = await params
  try {
    const body = await req.json()
    const { type, peerId, payload } = body

    if (!type || !peerId) {
      return Response.json({ error: 'type and peerId are required' }, { status: 400 })
    }

    liveHub.broadcast(
      room,
      {
        type,
        peerId,
        room,
        payload,
        timestamp: Date.now(),
      },
      peerId // do not echo back to sender
    )

    return Response.json({ success: true })
  } catch (err: any) {
    return Response.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
