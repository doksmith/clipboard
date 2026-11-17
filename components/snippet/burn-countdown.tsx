'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RiFireLine } from '@remixicon/react'

interface BurnCountdownProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function BurnCountdown({ isOpen, onConfirm, onCancel }: BurnCountdownProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <RiFireLine className="size-5" />
            <span>Warning: Burn After Reading</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            This snippet is configured to be <strong>permanently destroyed</strong> immediately upon viewing.
            Once you confirm and read this snippet, you will never be able to access it again.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Do Not View Now
          </Button>
          <Button variant="destructive" size="sm" onClick={onConfirm}>
            Yes, Read & Burn
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
