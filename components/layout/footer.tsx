import { RiCommandLine } from '@remixicon/react'

export function Footer() {
  return (
    <footer className="w-full bg-background px-4 py-3 text-xs text-muted-foreground sm:px-6">
      <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <RiCommandLine className="size-3.5" />
            <span>Shortcuts: <strong>Cmd+S</strong> (Save) &middot; <strong>Cmd+N</strong> (New File) &middot; <strong>Cmd+B</strong> (Settings)</span>
          </span>
        </div>
        <div>
          <span>Clipboard &copy; {new Date().getFullYear()} &middot; Self-Hosted Realtime Code Hub</span>
        </div>
      </div>
    </footer>
  )
}
