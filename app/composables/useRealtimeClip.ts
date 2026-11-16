import { ref, onMounted, onUnmounted } from 'vue'

export interface RealtimeOptions {
  room: string
  onSync?: (payload: any, peerId: string) => void
  onPeerJoin?: (peerId: string) => void
  onPeerLeave?: (peerId: string) => void
}

export function useRealtimeClip(options: RealtimeOptions) {
  const isConnected = ref(false)
  const peerId = ref<string | null>(null)
  const activePeers = ref<number>(1)
  let ws: WebSocket | null = null
  let reconnectTimeout: any = null
  let isClosed = false

  function connect() {
    if (import.meta.server || isClosed) return

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const url = `${protocol}//${window.location.host}/_ws`

    try {
      ws = new WebSocket(url)

      ws.onopen = () => {
        isConnected.value = true
        // Join the target room
        ws?.send(JSON.stringify({
          type: 'join',
          room: options.room,
        }))
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'connected') {
            peerId.value = data.peerId
          } else if (data.type === 'peer:joined') {
            activePeers.value += 1
            options.onPeerJoin?.(data.peerId)
          } else if (data.type === 'peer:left') {
            activePeers.value = Math.max(1, activePeers.value - 1)
            options.onPeerLeave?.(data.peerId)
          } else if (data.type === 'clip:synced') {
            options.onSync?.(data.payload, data.peerId)
          }
        } catch {
          // ignore
        }
      }

      ws.onclose = () => {
        isConnected.value = false
        if (!isClosed) {
          reconnectTimeout = setTimeout(connect, 2000)
        }
      }

      ws.onerror = () => {
        ws?.close()
      }
    } catch {
      if (!isClosed) {
        reconnectTimeout = setTimeout(connect, 3000)
      }
    }
  }

  function broadcastSync(payload: any) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'clip:sync',
        room: options.room,
        payload,
      }))
    }
  }

  onMounted(() => {
    connect()
  })

  onUnmounted(() => {
    isClosed = true
    if (reconnectTimeout) clearTimeout(reconnectTimeout)
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'leave',
        room: options.room,
      }))
      ws.close()
    }
  })

  return {
    isConnected,
    peerId,
    activePeers,
    broadcastSync,
  }
}
