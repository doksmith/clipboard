'use client'

import { LanguageSelect } from './language-select'
import { RiLockLine } from '@remixicon/react'

interface EditorStatusBarProps {
  cursorPosition: { line: number; col: number }
  syntax: string
  isEncrypted: boolean
  onSyntaxChange: (syntax: string) => void
}

export function EditorStatusBar({
  cursorPosition,
  syntax,
  isEncrypted,
  onSyntaxChange,
}: EditorStatusBarProps) {
  return (
    <div className="flex h-8 items-center justify-between bg-muted/20 px-3 text-xs text-muted-foreground">
      <div className="flex items-center gap-4">
        <span>
          Ln {cursorPosition.line}, Col {cursorPosition.col}
        </span>
        <span className="hidden sm:inline">Spaces: 2</span>
        <span className="hidden sm:inline">UTF-8</span>
        {isEncrypted && (
          <span className="flex items-center gap-1 text-primary">
            <RiLockLine className="size-3" />
            <span>Encrypted (AES-GCM)</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <LanguageSelect value={syntax} onSelect={onSyntaxChange} />
      </div>
    </div>
  )
}
