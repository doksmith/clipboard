// In-memory hub for HTTP-based realtime communication (SSE streaming)
// Provides pub/sub and presence across clients per room over standard HTTP/HTTPS

export interface RealtimeMessage {
  type: 'connected' | 'joined' | 'peer:joined' | 'peer:left' | 'clip:synced' | 'cursor:moved'
  peerId?: string
  room?: string
  payload?: any
  timestamp: number
}

type ClientCallback = (msg: RealtimeMessage) => void

interface RoomState {
  clients: Map<string, { callback: ClientCallback; name: string; color: string }>
}

class LiveRoomHub {
  private rooms: Map<string, RoomState> = new Map()

  private getRoom(roomId: string): RoomState {
    let room = this.rooms.get(roomId)
    if (!room) {
      room = { clients: new Map() }
      this.rooms.set(roomId, room)
    }
    return room
  }

  join(roomId: string, peerId: string, name: string, color: string, callback: ClientCallback) {
    const room = this.getRoom(roomId)
    room.clients.set(peerId, { callback, name, color })

    // Broadcast peer:joined to existing clients
    this.broadcast(roomId, {
      type: 'peer:joined',
      peerId,
      payload: { name, color },
      timestamp: Date.now(),
    }, peerId)
  }

  leave(roomId: string, peerId: string) {
    const room = this.rooms.get(roomId)
    if (!room) return

    room.clients.delete(peerId)
    this.broadcast(roomId, {
      type: 'peer:left',
      peerId,
      timestamp: Date.now(),
    })

    if (room.clients.size === 0) {
      this.rooms.delete(roomId)
    }
  }

  getPeers(roomId: string) {
    const room = this.rooms.get(roomId)
    if (!room) return []
    return Array.from(room.clients.entries()).map(([id, client]) => ({
      id,
      name: client.name,
      color: client.color,
    }))
  }

  broadcast(roomId: string, message: RealtimeMessage, excludePeerId?: string) {
    const room = this.rooms.get(roomId)
    if (!room) return

    for (const [id, client] of room.clients.entries()) {
      if (excludePeerId && id === excludePeerId) continue
      try {
        client.callback(message)
      } catch {
        // Callback failed, safe to ignore
      }
    }
  }
}

// Global singleton safe across HMR in dev
const globalForHub = globalThis as unknown as { liveHub?: LiveRoomHub }
export const liveHub = globalForHub.liveHub || new LiveRoomHub()
if (process.env.NODE_ENV !== 'production') {
  globalForHub.liveHub = liveHub
}
