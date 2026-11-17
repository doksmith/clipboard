'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RiGitCommitLine } from '@remixicon/react'

interface DiffViewerProps {
  revisionsCount: number
}

export function DiffViewer({ revisionsCount }: DiffViewerProps) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="h-8 text-xs">
            <RiGitCommitLine className="mr-1 size-3.5" />
            <span>Revisions ({revisionsCount})</span>
          </Button>
        }
      />
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Revision History & Diff</DialogTitle>
        </DialogHeader>
        <div className="py-4 text-xs text-muted-foreground">
          <p>
            This snippet has <strong>{revisionsCount}</strong> recorded revision{revisionsCount > 1 ? 's' : ''}.
          </p>
          <div className="mt-3 bg-muted/30 p-3 font-mono text-[11px]">
            <div>+ [v{revisionsCount}] Current Active Version</div>
            {revisionsCount > 1 && (
              <div className="text-muted-foreground">- [v{revisionsCount - 1}] Previous Snapshot Saved in Database</div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
