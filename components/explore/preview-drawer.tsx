'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { RiExternalLinkLine } from '@remixicon/react'
import type { SnippetSummary } from './snippet-card'
import Link from 'next/link'

interface PreviewDrawerProps {
  snippet: SnippetSummary | null
  isOpen: boolean
  onClose: () => void
}

export function PreviewDrawer({ snippet, isOpen, onClose }: PreviewDrawerProps) {
  if (!snippet) return null

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-sm font-semibold">
            {snippet.title || snippet.slug}
          </SheetTitle>
          <div className="flex items-center gap-2 pt-2">
            <Button
              size="sm"
              className="h-8 text-xs"
              render={<Link href={`/${snippet.slug}`} />}
            >
              <RiExternalLinkLine className="mr-1 size-3.5" />
              Open Full Snippet
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-4 py-2 text-xs">
          <div>
            <span className="font-medium text-foreground">Details:</span>
            <p className="mt-1 text-muted-foreground">{snippet.description || 'No description.'}</p>
          </div>

          <div>
            <span className="font-medium text-foreground">Attached Files ({snippet.files.length}):</span>
            <div className="mt-2 space-y-1">
              {snippet.files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between bg-muted/40 px-3 py-2 text-[11px]"
                >
                  <span className="font-mono">{file.filename}</span>
                  <span className="text-muted-foreground uppercase">{file.syntax}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
