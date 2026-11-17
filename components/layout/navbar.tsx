'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from './theme-toggle'
import { RiTerminalBoxLine, RiCompassLine, RiBroadcastLine, RiBookOpenLine } from '@remixicon/react'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
            <RiTerminalBoxLine className="size-5 text-primary" />
            <span>Clipboard</span>
          </Link>

          <nav className="hidden items-center gap-2 sm:flex">
            <Button variant="ghost" size="sm" render={<Link href="/" />}>
              Studio
            </Button>
            <Button variant="ghost" size="sm" render={<Link href="/explore" />}>
              <RiCompassLine className="mr-1 size-4" />
              Explore
            </Button>
            <Button variant="ghost" size="sm" render={<Link href="/live/demo" />}>
              <RiBroadcastLine className="mr-1 size-4" />
              Live Room
            </Button>
            <Button variant="ghost" size="sm" render={<Link href="/api" />}>
              <RiBookOpenLine className="mr-1 size-4" />
              API Docs
            </Button>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
