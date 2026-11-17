'use client'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { PeerUser } from '@/hooks/use-realtime-room'
import { RiUser3Line } from '@remixicon/react'

interface PeerCursorsProps {
  peers: PeerUser[]
}

export function PeerCursors({ peers }: PeerCursorsProps) {
  // Sort peers: "You" first, then alphabetically
  const sortedPeers = [...peers].sort((a, b) => {
    if (a.isMe) return -1
    if (b.isMe) return 1
    return a.name.localeCompare(b.name)
  })

  // Compact avatar-like icon badges (Facebook/Slack style)
  const maxIcons = 4
  const visiblePeers = sortedPeers.slice(0, maxIcons)
  const overflowPeers = sortedPeers.slice(maxIcons)

  return (
    <TooltipProvider delay={100}>
      <div className="flex items-center gap-1">
        <span className="text-[11px] text-muted-foreground mr-1 hidden sm:inline">
          Peers:
        </span>

        {/* Overlapping / inline compact avatar badges */}
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

          {/* Overflow circle tooltip listing all remaining peers */}
          {overflowPeers.length > 0 && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    aria-label={`${overflowPeers.length} more collaborators`}
                    className="relative inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground ring-2 ring-background text-[10px] font-bold transition-transform hover:z-10 hover:scale-110 focus:outline-none"
                  >
                    +{overflowPeers.length}
                  </button>
                }
              />
              <TooltipContent side="bottom" className="p-2 text-xs">
                <p className="font-semibold mb-1 text-[11px] text-muted-foreground">
                  +{overflowPeers.length} More Collaborators:
                </p>
                <div className="flex flex-col gap-1 max-h-36 overflow-y-auto">
                  {overflowPeers.map((p) => (
                    <div key={p.id} className="flex items-center gap-1.5">
                      <span
                        className="size-2 rounded-full shrink-0"
                        style={{ backgroundColor: p.color }}
                      />
                      <span>{p.name}</span>
                    </div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
