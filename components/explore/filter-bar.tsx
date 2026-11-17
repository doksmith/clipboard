'use client'

import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { SUPPORTED_LANGUAGES } from '@/lib/constants'
import { RiSearchLine } from '@remixicon/react'

interface FilterBarProps {
  search: string
  selectedLang: string
  onSearchChange: (query: string) => void
  onLangChange: (lang: string) => void
}

export function FilterBar({
  search,
  selectedLang,
  onSearchChange,
  onLangChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative max-w-md">
        <RiSearchLine className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by title, description, or slug..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 pl-9 text-xs"
        />
      </div>

      <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
        <Badge
          variant={selectedLang === 'all' ? 'default' : 'secondary'}
          className="cursor-pointer text-xs"
          onClick={() => onLangChange('all')}
        >
          All
        </Badge>
        {SUPPORTED_LANGUAGES.slice(0, 8).map((lang) => (
          <Badge
            key={lang.id}
            variant={selectedLang === lang.id ? 'default' : 'secondary'}
            className="cursor-pointer text-xs"
            onClick={() => onLangChange(lang.id)}
          >
            {lang.name}
          </Badge>
        ))}
      </div>
    </div>
  )
}
