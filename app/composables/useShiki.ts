import { createHighlighter, type Highlighter } from 'shiki'

let highlighterPromise: Promise<Highlighter> | null = null

export function getHighlighterInstance() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-dark', 'github-light', 'nord'],
      langs: [
        'javascript',
        'typescript',
        'vue',
        'html',
        'css',
        'json',
        'markdown',
        'python',
        'rust',
        'go',
        'sql',
        'bash',
        'yaml',
        'dockerfile',
      ],
    })
  }
  return highlighterPromise
}

export function useShiki() {
  const colorMode = useColorMode()

  const activeTheme = computed(() => {
    return colorMode.value === 'dark' ? 'github-dark' : 'github-light'
  })

  async function highlightCode(code: string, lang: string = 'text') {
    try {
      const highlighter = await getHighlighterInstance()
      const loadedLangs = highlighter.getLoadedLanguages()
      const targetLang = loadedLangs.includes(lang.toLowerCase()) ? lang.toLowerCase() : 'text'

      return highlighter.codeToHtml(code, {
        lang: targetLang,
        theme: activeTheme.value,
      })
    } catch {
      // Fallback to escaped plain text
      return `<pre><code>${escapeHtml(code)}</code></pre>`
    }
  }

  return {
    highlightCode,
    activeTheme,
  }
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
