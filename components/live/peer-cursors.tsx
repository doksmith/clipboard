'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import type { PeerUser } from '@/hooks/use-realtime-room'
import { RiUser3Line } from '@remixicon/react'

interface PeerCursorsProps {
  peers: PeerUser[]
}

export function PeerCursors({ peers }: PeerCursorsProps) {
  // Sort peers: "You" first, then other peers
  const sortedPeers = [...peers].sort((a, b) => {
    if (a.isMe) return -1
    if (b.isMe) return 1
    return a.name.localeCompare(b.name)
  })

  // Dynamic threshold based on container/viewport
  const [maxVisible, setMaxVisible] = useState(3)

  useEffect(() => {
    const updateMaxVisible = () => {
      if (window.innerWidth < 640) {
        setMaxVisible(1) // mobile
      } else if (window.innerWidth < 1024) {
        setMaxVisible(2) // tablet / split-screen
      } else {
        setMaxVisible(4) // desktop
      }
    }

    updateMaxVisible()
    window.addEventListener('resize', updateMaxVisible)
    return () => window.removeEventListener('resize', updateMaxVisible)
  }, [])

  const visiblePeers = sortedPeers.slice(0, maxVisible)
  const overflowPeers = sortedPeers.slice(maxVisible)

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[11px] text-muted-foreground mr-0.5">Peers:</span>
      {visiblePeers.map((peer) => (
        <Badge
          key={peer.id}
          variant={peer.isMe ? 'default' : 'secondary'}
          className="text-[10px] px-1.5 py-0 font-medium tracking-tight"
          style={
            peer.isMe
              ? undefined
              : { borderLeftColor: peer.color, borderLeftWidth: 3 }
          }
        >
          {peer.name} {peer.isMe && '(You)'}
        </Badge>
      ))}

      {overflowPeers.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="cursor-pointer inline-flex items-center"
              />
            }
          >
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 font-semibold cursor-pointer hover:bg-accent"
            >
              +{overflowPeers.length} more
            </Badge>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-40 text-xs">
            <DropdownMenuLabel className="text-[11px]">
              Active Collaborators ({peers.length})
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {sortedPeers.map((peer) => (
              <DropdownMenuItem key={peer.id} className="gap-2 text-xs">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: peer.color }}
                />
                <span className="flex-1 font-medium">
                  {peer.name} {peer.isMe && '(You)'}
                </span>
                <RiUser3Line className="size-3 text-muted-foreground" />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
