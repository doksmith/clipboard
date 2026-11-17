'use client'

import { Badge } from '@/components/ui/badge'
import type { PeerUser } from '@/hooks/use-realtime-room'

interface PeerCursorsProps {
  peers: PeerUser[]
}

export function PeerCursors({ peers }: PeerCursorsProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[11px] text-muted-foreground mr-1">Peers:</span>
      {peers.map((peer) => (
        <Badge
          key={peer.id}
          variant="secondary"
          className="text-[10px] px-1.5 py-0 font-medium"
          style={{ borderLeftColor: peer.color, borderLeftWidth: 3 }}
        >
          {peer.name}
        </Badge>
      ))}
    </div>
  )
}
