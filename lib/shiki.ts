import { createHighlighter, type Highlighter } from 'shiki'

let highlighterPromise: Promise<Highlighter> | null = null

export async function getHighlighterInstance(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-dark', 'github-light'],
      langs: [
        'typescript',
        'javascript',
        'python',
        'json',
        'html',
        'css',
        'markdown',
        'rust',
        'go',
        'sql',
        'shellscript',
        'yaml',
        'xml',
      ],
    })
  }
  return highlighterPromise
}

export async function highlightCode(
  code: string,
  lang: string,
  theme: 'github-dark' | 'github-light' = 'github-dark'
): Promise<string> {
  try {
    const highlighter = await getHighlighterInstance()
    const validLang = highlighter.getLoadedLanguages().includes(lang) ? lang : 'text'
    return highlighter.codeToHtml(code, {
      lang: validLang,
      theme,
    })
  } catch {
    return `<pre><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`
  }
}
