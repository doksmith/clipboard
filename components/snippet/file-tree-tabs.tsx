'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RiFileCodeLine } from '@remixicon/react'

export interface SnippetFileTab {
  id: string
  filename: string
  syntax: string
}

interface FileTreeTabsProps {
  files: SnippetFileTab[]
  activeId: string
  onSelect: (id: string) => void
}

export function FileTreeTabs({ files, activeId, onSelect }: FileTreeTabsProps) {
  return (
    <Tabs value={activeId} onValueChange={onSelect} className="w-full">
      <TabsList className="h-9 justify-start gap-1 overflow-x-auto bg-muted/20 p-1">
        {files.map((file) => (
          <TabsTrigger
            key={file.id}
            value={file.id}
            className="flex items-center gap-1.5 px-3 text-xs data-[state=active]:bg-background"
          >
            <RiFileCodeLine className="size-3.5 text-muted-foreground" />
            <span>{file.filename}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
