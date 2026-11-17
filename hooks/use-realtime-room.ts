'use client'

import { useState, useEffect } from 'react'

export interface PeerUser {
  id: string
  name: string
  color: string
  cursor?: { line: number; ch: number }
}

export function useRealtimeRoom(roomId: string) {
  const [peers, setPeers] = useState<PeerUser[]>([])
  const [latency, setLatency] = useState<number>(18)
  const [isConnected, setIsConnected] = useState<boolean>(true)

  useEffect(() => {
    // Generate initial presence simulation for collaborative scratchpad
    const simulatedPeers: PeerUser[] = [
      { id: 'peer-1', name: 'Alex S.', color: '#3b82f6', cursor: { line: 4, ch: 12 } },
      { id: 'peer-2', name: 'John Doe', color: '#10b981', cursor: { line: 7, ch: 1 } },
    ]
    setPeers(simulatedPeers)

    const interval = setInterval(() => {
      // Small jitter for realistic latency monitoring
      setLatency(15 + Math.floor(Math.random() * 8))
    }, 3000)

    return () => clearInterval(interval)
  }, [roomId])

  return {
    peers,
    latency,
    isConnected,
    setIsConnected,
  }
}
