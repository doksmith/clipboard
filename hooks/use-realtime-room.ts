'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

export interface PeerUser {
  id: string
  name: string
  color: string
  cursor?: { line: number; ch: number }
}

const PEER_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
]

interface UseRealtimeRoomOptions {
  onSync?: (content: string, peerId: string) => void
}

export function useRealtimeRoom(roomId: string, options?: UseRealtimeRoomOptions) {
  const [peers, setPeers] = useState<PeerUser[]>([])
  const [latency, setLatency] = useState<number>(0)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [myPeerId, setMyPeerId] = useState<string>('')

  const peerIdRef = useRef<string>('')
  const optionsRef = useRef(options)
  optionsRef.current = options

  useEffect(() => {
    // Generate identity
    const randomId = `peer-${Math.random().toString(36).substring(2, 8)}`
    const randomColor = PEER_COLORS[Math.floor(Math.random() * PEER_COLORS.length)]
    const randomName = `Dev-${randomId.slice(-4)}`

    peerIdRef.current = randomId
    setMyPeerId(randomId)

    const startTime = Date.now()
    const url = `/api/live/${encodeURIComponent(roomId)}?peerId=${randomId}&name=${encodeURIComponent(randomName)}&color=${encodeURIComponent(randomColor)}`

    const eventSource = new EventSource(url)

    eventSource.onopen = () => {
      setIsConnected(true)
      setLatency(Math.max(5, Date.now() - startTime))
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        const { type, peerId, payload } = data

        if (type === 'connected') {
          if (payload?.currentPeers) {
            setPeers(payload.currentPeers.filter((p: PeerUser) => p.id !== randomId))
          }
        } else if (type === 'peer:joined') {
          if (peerId !== randomId) {
            setPeers((prev) => {
              if (prev.some((p) => p.id === peerId)) return prev
              return [...prev, { id: peerId, name: payload?.name || 'Peer', color: payload?.color || '#3b82f6' }]
            })
          }
        } else if (type === 'peer:left') {
          setPeers((prev) => prev.filter((p) => p.id !== peerId))
        } else if (type === 'clip:synced') {
          if (peerId !== randomId && optionsRef.current?.onSync && payload?.content !== undefined) {
            optionsRef.current.onSync(payload.content, peerId)
          }
        }
      } catch {
        // Heartbeat or malformed
      }
    }

    eventSource.onerror = () => {
      setIsConnected(false)
    }

    // Ping / latency simulation check
    const latencyInterval = setInterval(() => {
      if (eventSource.readyState === EventSource.OPEN) {
        setIsConnected(true)
        setLatency(12 + Math.floor(Math.random() * 8))
      } else {
        setIsConnected(false)
      }
    }, 4000)

    return () => {
      clearInterval(latencyInterval)
      eventSource.close()
      setIsConnected(false)
    }
  }, [roomId])

  const broadcastChange = useCallback(
    async (content: string) => {
      if (!peerIdRef.current || !roomId) return
      try {
        await fetch(`/api/live/${encodeURIComponent(roomId)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'clip:synced',
            peerId: peerIdRef.current,
            payload: { content },
          }),
        })
      } catch {
        // ignore send error
      }
    },
    [roomId]
  )

  return {
    peers,
    latency,
    isConnected,
    myPeerId,
    broadcastChange,
  }
}
