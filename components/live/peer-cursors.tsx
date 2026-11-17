'use client'

import { useState, useEffect } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import type { PeerUser } from '@/hooks/use-realtime-room'
import { RiUser3Line } from '@remixicon/react'

interface PeerCursorsProps {
  peers: PeerUser[]
}

export function PeerCursors({ peers }: PeerCursorsProps) {
  // Always keep "You" first, followed by others sorted by name
  const sortedPeers = [...peers].sort((a, b) => {
    if (a.isMe) return -1
    if (b.isMe) return 1
    return a.name.localeCompare(b.name)
  })

  // Dynamic max avatars based on viewport width to never exceed one line
  const [maxAvatars, setMaxAvatars] = useState(3)

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 640) {
        // Mobile screen: 1 avatar (You) + More button
        setMaxAvatars(1)
      } else if (width < 960) {
        // Small/medium screen / split-screen: 2 avatars + More button
        setMaxAvatars(2)
      } else if (width < 1280) {
        // Standard laptop: 3 avatars + More button
        setMaxAvatars(3)
      } else {
        // Wide desktop: up to 5 avatars + More button
        setMaxAvatars(5)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const visiblePeers = sortedPeers.slice(0, maxAvatars)
  const overflowPeers = sortedPeers.slice(maxAvatars)

  return (
    <TooltipProvider delay={100}>
      <div className="flex items-center gap-1">
        <span className="text-[11px] text-muted-foreground mr-1 hidden sm:inline">
          Peers:
        </span>

        {/* Stacked compact avatar circles */}
        <div className="flex items-center -space-x-1.5 hover:space-x-1 transition-all">
          {visiblePeers.map((peer) => (
            <Tooltip key={peer.id}>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    aria-label={peer.name}
                    className="relative inline-flex size-6 shrink-0 items-center justify-center rounded-full ring-2 ring-background transition-transform hover:z-10 hover:scale-110 focus:outline-none"
                    style={{ backgroundColor: peer.color }}
                  >
                    <span className="text-[10px] font-bold text-white uppercase select-none">
                      {peer.isMe ? 'U' : peer.name.slice(-2)}
                    </span>
                    {peer.isMe && (
                      <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-500 ring-1 ring-background" />
                    )}
                  </button>
                }
              />
              <TooltipContent side="bottom" className="text-xs">
                <span className="font-medium">
                  {peer.name} {peer.isMe ? '(You)' : ''}
                </span>
              </TooltipContent>
            </Tooltip>
          ))}

          {/* Dynamic Interactive MORE Button when collaborators exceed limit */}
          {overflowPeers.length > 0 && (
            <Popover>
              <Tooltip>
                <PopoverTrigger
                  render={
                    <TooltipTrigger
                      render={
                        <button
                          type="button"
                          aria-label={`${overflowPeers.length} more collaborators`}
                          className="relative inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full bg-muted text-muted-foreground ring-2 ring-background text-[10px] font-bold transition-transform hover:z-10 hover:scale-110 focus:outline-none hover:bg-accent hover:text-foreground"
                        >
                          +{overflowPeers.length}
                        </button>
                      }
                    />
                  }
                />
                <TooltipContent side="bottom" className="text-xs">
                  <span>Click to view all {peers.length} collaborators</span>
                </TooltipContent>
              </Tooltip>

              <PopoverContent align="end" className="w-56 p-3 text-xs">
                <PopoverHeader className="pb-1.5 border-b mb-2">
                  <PopoverTitle className="text-xs font-semibold flex items-center justify-between">
                    <span>Collaborators</span>
                    <span className="text-[10px] text-muted-foreground font-normal">
                      {peers.length} active
                    </span>
                  </PopoverTitle>
                </PopoverHeader>

                <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {sortedPeers.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-2 rounded px-1.5 py-1 hover:bg-muted/50"
                    >
                      <span
                        className="size-2 rounded-full shrink-0"
                        style={{ backgroundColor: p.color }}
                      />
                      <span className="flex-1 truncate font-medium text-foreground">
                        {p.name} {p.isMe ? '(You)' : ''}
                      </span>
                      {p.isMe ? (
                        <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                      ) : (
                        <RiUser3Line className="size-3 text-muted-foreground shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
