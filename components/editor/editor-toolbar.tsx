'use client'

import { Button } from '@/components/ui/button'
import {
  RiFileCopyLine,
  RiCheckLine,
  RiFormatClear,
  RiTextWrap,
  RiDeleteBin7Line,
} from '@remixicon/react'
import { useState } from 'react'
import { toast } from 'sonner'

interface EditorToolbarProps {
  content: string
  isWordWrap: boolean
  onToggleWordWrap: () => void
  onClear: () => void
}

export function EditorToolbar({
  content,
  isWordWrap,
  onToggleWordWrap,
  onClear,
}: EditorToolbarProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={onToggleWordWrap}
        title={isWordWrap ? 'Disable Word Wrap' : 'Enable Word Wrap'}
      >
        <RiTextWrap className={`size-3.5 ${isWordWrap ? 'text-primary' : 'text-muted-foreground'}`} />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={handleCopy}
        title="Copy File Content"
      >
        {copied ? (
          <RiCheckLine className="size-3.5 text-primary" />
        ) : (
          <RiFileCopyLine className="size-3.5 text-muted-foreground" />
        )}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={onClear}
        title="Clear Content"
      >
        <RiDeleteBin7Line className="size-3.5 text-muted-foreground" />
      </Button>
    </div>
  )
}
