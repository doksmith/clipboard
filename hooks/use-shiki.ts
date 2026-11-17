'use client'

import { useState, useEffect } from 'react'
import { highlightCode } from '@/lib/shiki'

export function useShiki(code: string, lang: string, theme: 'github-dark' | 'github-light' = 'github-dark') {
  const [highlightedHtml, setHighlightedHtml] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    let isCancelled = false
    setIsLoading(true)

    highlightCode(code, lang, theme).then((html) => {
      if (!isCancelled) {
        setHighlightedHtml(html)
        setIsLoading(false)
      }
    })

    return () => {
      isCancelled = true
    }
  }, [code, lang, theme])

  return { highlightedHtml, isLoading }
}
