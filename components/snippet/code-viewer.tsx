'use client'

import { useShiki } from '@/hooks/use-shiki'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { RiFileCopyLine, RiCheckLine, RiFileCodeLine } from '@remixicon/react'
import { useState } from 'react'
import { toast } from 'sonner'

interface CodeViewerProps {
  filename: string
  content: string
  syntax: string
}

export function CodeViewer({ filename, content, syntax }: CodeViewerProps) {
  const { resolvedTheme } = useTheme()
  const theme = resolvedTheme === 'dark' ? 'github-dark' : 'github-light'
  const { highlightedHtml, isLoading } = useShiki(content, syntax, theme)
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

  const lineCount = content.split('\n').length

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between bg-muted/30 px-4 py-2">
        <div className="flex items-center gap-2 text-xs font-medium text-foreground">
          <RiFileCodeLine className="size-4 text-primary" />
          <span>{filename}</span>
          <span className="text-muted-foreground text-[11px]">
            ({lineCount} {lineCount === 1 ? 'line' : 'lines'} &middot; {syntax})
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={handleCopy}
        >
          {copied ? (
            <RiCheckLine className="mr-1 size-3.5 text-primary" />
          ) : (
            <RiFileCopyLine className="mr-1 size-3.5" />
          )}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </Button>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto font-mono text-xs">
        {isLoading ? (
          <pre className="p-4 text-muted-foreground">
            <code>{content}</code>
          </pre>
        ) : (
          <div
            className="p-4 [&_pre]:!bg-transparent [&_code]:!bg-transparent"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        )}
      </CardContent>
    </Card>
  )
}
