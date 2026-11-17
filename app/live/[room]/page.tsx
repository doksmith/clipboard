'use client'

import { use, useState } from 'react'
import dynamic from 'next/dynamic'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { PeerCursors } from '@/components/live/peer-cursors'
import { LiveStatus } from '@/components/live/live-status'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRealtimeRoom } from '@/hooks/use-realtime-room'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { RiBroadcastLine, RiCameraLine } from '@remixicon/react'

const CodeEditor = dynamic(
  () => import('@/components/editor/code-editor').then((mod) => mod.CodeEditor),
  {
    ssr: false,
    loading: () => (
      <div className="relative min-h-[500px] flex-1 bg-muted/10 animate-pulse" />
    ),
  }
)

export default function LiveRoomPage({
  params,
}: {
  params: Promise<{ room: string }>
}) {
  const { room } = use(params)
  const { peers, latency, isConnected } = useRealtimeRoom(room)
  const router = useRouter()

  const [code, setCode] = useState(
    `// Collaborative Live Scratchpad: #${room}\n// Changes synchronize in realtime across connected peers\n\nfunction helloWorld() {\n  console.log("Live collaborative coding");\n}\n`
  )
  const [syntax] = useState('typescript')
  const [isWordWrap] = useState(true)

  const handleSnapshot = async () => {
    try {
      const res = await fetch('/api/pastes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Snapshot from Room #${room}`,
          visibility: 'public',
          files: [
            {
              filename: 'scratchpad.ts',
              content: code,
              syntax,
            },
          ],
        }),
      })

      const data = await res.json()
      if (res.ok) {
        toast.success('Snapshot created as a permanent paste!')
        router.push(`/${data.paste.slug}`)
      } else {
        toast.error('Failed to create snapshot')
      }
    } catch {
      toast.error('Error saving snapshot')
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4">
          {/* Room Header */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <RiBroadcastLine className="size-5 text-primary" />
                <span>Room: #{room}</span>
              </div>
              <Badge variant="outline" className="text-[10px]">
                Collaborative
              </Badge>
              <LiveStatus latency={latency} isConnected={isConnected} />
            </div>

            <div className="flex items-center gap-3">
              <PeerCursors peers={peers} />
              <Button size="sm" onClick={handleSnapshot}>
                <RiCameraLine className="mr-1 size-3.5" />
                <span>Snapshot Paste</span>
              </Button>
            </div>
          </div>

          {/* Collaborative Editor Panel */}
          <Card className="flex min-h-[550px] flex-col overflow-hidden">
            <CardContent className="flex flex-1 flex-col p-0">
              <CodeEditor
                value={code}
                syntax={syntax}
                isWordWrap={isWordWrap}
                onChange={setCode}
              />
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
