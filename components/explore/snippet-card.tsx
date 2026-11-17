'use client'

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RiFileCodeLine, RiEyeLine, RiTimeLine } from '@remixicon/react'
import Link from 'next/link'

export interface SnippetSummary {
  id: string
  title: string | null
  slug: string
  description: string | null
  isEncrypted: boolean
  hasPassword: boolean
  viewCount: number
  createdAt: string
  filesCount: number
  files: Array<{ id: string; filename: string; syntax: string; sizeBytes: number }>
}

interface SnippetCardProps {
  snippet: SnippetSummary
  onQuickPreview: (snippet: SnippetSummary) => void
}

export function SnippetCard({ snippet, onQuickPreview }: SnippetCardProps) {
  const primaryFile = snippet.files[0]

  return (
    <Card className="flex flex-col justify-between overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-semibold text-foreground line-clamp-1">
            {snippet.title || snippet.slug}
          </CardTitle>
          <Badge variant="secondary" className="text-[10px] uppercase">
            {primaryFile?.syntax || 'text'}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {snippet.description || 'No description provided.'}
        </p>
      </CardHeader>

      <CardContent className="px-4 py-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1">
            <RiFileCodeLine className="size-3.5" />
            {snippet.filesCount} file{snippet.filesCount > 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1">
            <RiEyeLine className="size-3.5" />
            {snippet.viewCount}
          </span>
          <span className="flex items-center gap-1">
            <RiTimeLine className="size-3.5" />
            {new Date(snippet.createdAt).toLocaleDateString()}
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between bg-muted/20 p-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() => onQuickPreview(snippet)}
        >
          Quick View
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          render={<Link href={`/${snippet.slug}`} />}
        >
          Open
        </Button>
      </CardFooter>
    </Card>
  )
}
