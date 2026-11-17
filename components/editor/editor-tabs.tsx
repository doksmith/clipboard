'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RiAddLine, RiCloseLine, RiFileCodeLine } from '@remixicon/react'
import type { EditorFile } from '@/hooks/use-editor-state'
import { useState } from 'react'

interface EditorTabsProps {
  files: EditorFile[]
  activeFileId: string
  onSelectTab: (id: string) => void
  onAddTab: () => void
  onRemoveTab: (id: string) => void
  onRenameTab: (id: string, newName: string) => void
}

export function EditorTabs({
  files,
  activeFileId,
  onSelectTab,
  onAddTab,
  onRemoveTab,
  onRenameTab,
}: EditorTabsProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState<string>('')

  const handleStartRename = (file: EditorFile) => {
    setEditingId(file.id)
    setEditName(file.filename)
  }

  const handleFinishRename = (id: string) => {
    if (editName.trim()) {
      onRenameTab(id, editName.trim())
    }
    setEditingId(null)
  }

  return (
    <div className="flex w-full items-center justify-between overflow-x-auto bg-muted/30 px-2 py-1">
      <Tabs value={activeFileId} onValueChange={onSelectTab} className="w-auto">
        <TabsList className="h-8 gap-1 bg-transparent p-0">
          {files.map((file) => (
            <TabsTrigger
              key={file.id}
              value={file.id}
              className="group relative flex h-7 items-center gap-1.5 px-2.5 text-xs data-[state=active]:bg-background data-[state=active]:shadow-none"
            >
              <RiFileCodeLine className="size-3.5 text-muted-foreground" />
              {editingId === file.id ? (
                <Input
                  size={10}
                  className="h-5 px-1 py-0 text-xs"
                  value={editName}
                  autoFocus
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => handleFinishRename(file.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleFinishRename(file.id)
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span
                  onDoubleClick={(e) => {
                    e.stopPropagation()
                    handleStartRename(file)
                  }}
                  title="Double click to rename"
                  className="select-none"
                >
                  {file.filename}
                </span>
              )}

              {file.isDirty && (
                <span className="size-1.5 rounded-full bg-primary" />
              )}

              {files.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-4 opacity-40 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemoveTab(file.id)
                  }}
                >
                  <RiCloseLine className="size-3" />
                </Button>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={onAddTab}
        title="New File (Cmd+N)"
      >
        <RiAddLine className="size-4" />
      </Button>
    </div>
  )
}
