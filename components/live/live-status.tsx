'use client'

interface LiveStatusProps {
  latency: number
  isConnected: boolean
}

export function LiveStatus({ latency, isConnected }: LiveStatusProps) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span
        className={`size-2 rounded-full ${
          isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-destructive'
        }`}
      />
      <span className="text-muted-foreground text-[11px]">
        {isConnected ? `Connected (${latency}ms)` : 'Disconnected'}
      </span>
    </div>
  )
}
