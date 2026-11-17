'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { FilterBar } from '@/components/explore/filter-bar'
import { SnippetCard, type SnippetSummary } from '@/components/explore/snippet-card'
import { PreviewDrawer } from '@/components/explore/preview-drawer'
import { toast } from 'sonner'

export default function ExplorePage() {
  const [snippets, setSnippets] = useState<SnippetSummary[]>([])
  const [search, setSearch] = useState('')
  const [selectedLang, setSelectedLang] = useState('all')
  const [previewSnippet, setPreviewSnippet] = useState<SnippetSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchExplorePastes = async () => {
    try {
      setIsLoading(true)
      const query = new URLSearchParams()
      if (search.trim()) query.set('q', search.trim())

      const res = await fetch(`/api/pastes?${query.toString()}`)
      const data = await res.json()
      if (res.ok) {
        setSnippets(data.items || [])
      } else {
        toast.error('Failed to load snippets')
      }
    } catch {
      toast.error('Network error loading explore snippets')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExplorePastes()
    }, 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const filtered = snippets.filter((s) => {
    if (selectedLang === 'all') return true
    return s.files.some((f) => f.syntax.toLowerCase() === selectedLang.toLowerCase())
  })

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Explore Snippets
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Browse, search, and discover public code snippets.
            </p>
          </div>

          <FilterBar
            search={search}
            selectedLang={selectedLang}
            onSearchChange={setSearch}
            onLangChange={setSelectedLang}
          />

          {isLoading ? (
            <div className="flex h-48 items-center justify-center text-xs text-muted-foreground">
              Loading snippets...
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((snippet) => (
                <SnippetCard
                  key={snippet.id}
                  snippet={snippet}
                  onQuickPreview={setPreviewSnippet}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-48 flex-col items-center justify-center text-xs text-muted-foreground">
              <p>No snippets found matching your query.</p>
            </div>
          )}
        </div>

        <PreviewDrawer
          snippet={previewSnippet}
          isOpen={Boolean(previewSnippet)}
          onClose={() => setPreviewSnippet(null)}
        />
      </main>

      <Footer />
    </div>
  )
}
