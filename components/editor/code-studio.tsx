'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { EditorTabs } from './editor-tabs'
import { EditorToolbar } from './editor-toolbar'
import { EditorStatusBar } from './editor-status-bar'
import { EditorSettingsPanel } from './editor-settings-panel'
import { useEditorState } from '@/hooks/use-editor-state'
import { useWebCrypto } from '@/hooks/use-web-crypto'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { RiSettings3Line, RiSendPlaneLine } from '@remixicon/react'

const CodeEditor = dynamic(
  () => import('./code-editor').then((mod) => mod.CodeEditor),
  {
    ssr: false,
    loading: () => (
      <div className="relative min-h-[400px] flex-1 bg-muted/10 animate-pulse" />
    ),
  }
)

export function CodeStudio() {
  const router = useRouter()
  const {
    files,
    activeFileId,
    activeFile,
    setActiveFileId,
    updateFileContent,
    updateFileName,
    updateFileSyntax,
    addFile,
    removeFile,
  } = useEditorState()

  const { generateKey, encrypt } = useWebCrypto()

  const [title, setTitle] = useState('')
  const [isWordWrap, setIsWordWrap] = useState(true)
  const [isEncrypted, setIsEncrypted] = useState(false)
  const [burnAfterRead, setBurnAfterRead] = useState(false)
  const [expiresIn, setExpiresIn] = useState('never')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSettings, setShowSettings] = useState(true)
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 })

  const handleSubmit = async () => {
    if (files.some((f) => !f.content.trim())) {
      toast.error('All file tabs must contain code or content.')
      return
    }

    try {
      setIsSubmitting(true)
      let encryptionKey = ''
      let preparedFiles = files.map((f) => ({
        filename: f.filename,
        content: f.content,
        syntax: f.syntax,
      }))

      if (isEncrypted) {
        encryptionKey = await generateKey()
        preparedFiles = await Promise.all(
          preparedFiles.map(async (f) => ({
            ...f,
            content: await encrypt(f.content, encryptionKey),
          }))
        )
      }

      const res = await fetch('/api/pastes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim() || undefined,
          visibility: 'public',
          isEncrypted,
          burnAfterRead,
          expiresIn,
          password: password.trim() || undefined,
          files: preparedFiles,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create snippet')
      }

      toast.success('Paste created successfully!')
      const targetUrl = isEncrypted
        ? `/${data.paste.slug}#key=${encryptionKey}`
        : `/${data.paste.slug}`
      router.push(targetUrl)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating snippet'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  useKeyboardShortcuts({
    onSave: handleSubmit,
    onNewFile: addFile,
    onToggleSettings: () => setShowSettings((prev) => !prev),
  })

  return (
    <div className="flex flex-col gap-4">
      {/* Title & Action Strip */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Untitled Snippet..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-9 max-w-md text-sm font-medium"
        />

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings((prev) => !prev)}
            title="Toggle Settings (Cmd+B)"
          >
            <RiSettings3Line className="mr-1 size-4" />
            <span className="hidden sm:inline">Settings</span>
          </Button>

          <Button
            size="sm"
            disabled={isSubmitting}
            onClick={handleSubmit}
          >
            <RiSendPlaneLine className="mr-1 size-4" />
            <span>{isSubmitting ? 'Creating...' : 'Create Paste'}</span>
          </Button>
        </div>
      </div>

      {/* Editor & Settings Workspace */}
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-4">
        <div className={showSettings ? 'lg:col-span-3' : 'lg:col-span-4'}>
          <Card className="flex min-h-[500px] flex-col overflow-hidden">
            <div className="flex items-center justify-between bg-muted/40 pr-2">
              <EditorTabs
                files={files}
                activeFileId={activeFileId}
                onSelectTab={setActiveFileId}
                onAddTab={addFile}
                onRemoveTab={removeFile}
                onRenameTab={updateFileName}
              />
              <EditorToolbar
                content={activeFile?.content || ''}
                isWordWrap={isWordWrap}
                onToggleWordWrap={() => setIsWordWrap((prev) => !prev)}
                onClear={() => updateFileContent(activeFileId, '')}
              />
            </div>

            <CardContent className="flex flex-1 flex-col p-0">
              <CodeEditor
                value={activeFile?.content || ''}
                syntax={activeFile?.syntax || 'text'}
                isWordWrap={isWordWrap}
                onChange={(val) => updateFileContent(activeFileId, val)}
                onCursorChange={setCursorPos}
              />
              <EditorStatusBar
                cursorPosition={cursorPos}
                syntax={activeFile?.syntax || 'text'}
                isEncrypted={isEncrypted}
                onSyntaxChange={(syntax) => updateFileSyntax(activeFileId, syntax)}
              />
            </CardContent>
          </Card>
        </div>

        {showSettings && (
          <div className="lg:col-span-1">
            <EditorSettingsPanel
              isEncrypted={isEncrypted}
              burnAfterRead={burnAfterRead}
              expiresIn={expiresIn}
              password={password}
              onToggleEncrypted={setIsEncrypted}
              onToggleBurnAfterRead={setBurnAfterRead}
              onExpiresInChange={setExpiresIn}
              onPasswordChange={setPassword}
            />
          </div>
        )}
      </div>
    </div>
  )
}
