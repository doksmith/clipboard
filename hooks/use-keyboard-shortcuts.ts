'use client'

import { useEffect } from 'react'

export interface ShortcutHandlers {
  onSave?: () => void
  onNewFile?: () => void
  onToggleSettings?: () => void
}

export function useKeyboardShortcuts({
  onSave,
  onNewFile,
  onToggleSettings,
}: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey

      if (isCmdOrCtrl && e.key.toLowerCase() === 's') {
        e.preventDefault()
        onSave?.()
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        onNewFile?.()
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        onToggleSettings?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onSave, onNewFile, onToggleSettings])
}
