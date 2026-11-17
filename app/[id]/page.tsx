'use client'

import { useEffect, useState, use } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { CodeViewer } from '@/components/snippet/code-viewer'
import { FileTreeTabs } from '@/components/snippet/file-tree-tabs'
import { DiffViewer } from '@/components/snippet/diff-viewer'
import { BurnCountdown } from '@/components/snippet/burn-countdown'
import { QrModal } from '@/components/snippet/qr-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useWebCrypto } from '@/hooks/use-web-crypto'
import { toast } from 'sonner'
import Link from 'next/link'
import {
  RiGitForkLine,
  RiDownload2Line,
  RiTimeLine,
  RiLockLine,
  RiEyeLine,
  RiTerminalBoxLine,
} from '@remixicon/react'

interface FileItem {
  id: string
  filename: string
  syntax: string
  content: string
  sizeBytes: number
}

interface PasteData {
  id: string
  title: string | null
  slug: string
  description: string | null
  visibility: string
  isEncrypted: boolean
  burnAfterRead: boolean
  hasPassword: boolean
  viewCount: number
  expiresAt: string | null
  createdAt: string
  files: FileItem[]
  requiresPassword?: boolean
}

export default function SnippetViewerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [paste, setPaste] = useState<PasteData | null>(null)
  const [activeFileId, setActiveFileId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [passwordInput, setPasswordInput] = useState('')
  const [showBurnWarning, setShowBurnWarning] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('')

  const { decrypt } = useWebCrypto()

  const fetchSnippet = async (pass?: string) => {
    try {
      setIsLoading(true)
      const headers: Record<string, string> = {}
      if (pass) {
        headers['x-paste-password'] = pass
      }

      const res = await fetch(`/api/pastes/${id}`, { headers })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load snippet')
      }

      // Check if encrypted and hash key is available
      if (data.isEncrypted && window.location.hash.includes('#key=')) {
        const hexKey = window.location.hash.replace('#key=', '')
        const decryptedFiles = await Promise.all(
          data.files.map(async (file: FileItem) => {
            try {
              const plain = await decrypt(file.content, hexKey)
              return { ...file, content: plain }
            } catch {
              return file
            }
          })
        )
        data.files = decryptedFiles
      }

      setPaste(data)
      if (data.files && data.files.length > 0) {
        setActiveFileId(data.files[0].id)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error fetching snippet'
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setCurrentUrl(window.location.href)
    fetchSnippet()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const activeFile = paste?.files?.find((f) => f.id === activeFileId) || paste?.files?.[0]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 px-4 py-4 sm:px-6">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center text-xs text-muted-foreground">
            Loading snippet...
          </div>
        ) : paste?.requiresPassword ? (
          <div className="mx-auto max-w-md py-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <RiLockLine className="size-4 text-primary" />
                  <span>Password Protected Snippet</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  This snippet requires a password to decrypt and view its contents.
                </p>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="Enter password..."
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="h-8 text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') fetchSnippet(passwordInput)
                    }}
                  />
                  <Button size="sm" onClick={() => fetchSnippet(passwordInput)}>
                    Unlock
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : paste ? (
          <div className="flex flex-col gap-4">
            {/* Header Metadata & Actions */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-lg font-bold text-foreground">
                  {paste.title || 'Untitled Snippet'}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="text-[10px]">
                    {paste.visibility}
                  </Badge>
                  {paste.isEncrypted && (
                    <Badge variant="outline" className="text-[10px]">
                      AES-GCM Encrypted
                    </Badge>
                  )}
                  <span className="flex items-center gap-1">
                    <RiEyeLine className="size-3.5" />
                    {paste.viewCount} views
                  </span>
                  <span className="flex items-center gap-1">
                    <RiTimeLine className="size-3.5" />
                    {new Date(paste.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <DiffViewer revisionsCount={1} />
                <QrModal url={currentUrl} />
                <Button variant="outline" size="sm" className="h-8 text-xs" nativeButton={false} render={<Link href="/" />}>
                  <RiGitForkLine className="mr-1 size-3.5" />
                  <span>Fork</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  nativeButton={false}
                  render={<a href={`/raw/${paste.slug}`} target="_blank" rel="noreferrer" />}
                >
                  <RiTerminalBoxLine className="mr-1 size-3.5" />
                  <span>Raw</span>
                </Button>
              </div>
            </div>

            {/* Multi-File Tab Bar */}
            {paste.files.length > 1 && (
              <FileTreeTabs
                files={paste.files}
                activeId={activeFileId}
                onSelect={setActiveFileId}
              />
            )}

            {/* Code Highlighting Viewer */}
            {activeFile && (
              <CodeViewer
                filename={activeFile.filename}
                content={activeFile.content}
                syntax={activeFile.syntax}
              />
            )}
          </div>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
            <p>Snippet not found or has been burned/expired.</p>
            <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/" />}>
              Create New Snippet
            </Button>
          </div>
        )}

        <BurnCountdown
          isOpen={showBurnWarning}
          onConfirm={() => {
            setShowBurnWarning(false)
            fetchSnippet()
          }}
          onCancel={() => setShowBurnWarning(false)}
        />
      </main>

      <Footer />
    </div>
  )
}
