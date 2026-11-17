export interface LanguageOption {
  id: string
  name: string
  extension: string
  aliases?: string[]
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { id: 'typescript', name: 'TypeScript', extension: 'ts', aliases: ['tsx'] },
  { id: 'javascript', name: 'JavaScript', extension: 'js', aliases: ['jsx', 'mjs', 'cjs'] },
  { id: 'python', name: 'Python', extension: 'py', aliases: ['pyw'] },
  { id: 'json', name: 'JSON', extension: 'json' },
  { id: 'html', name: 'HTML', extension: 'html', aliases: ['htm'] },
  { id: 'css', name: 'CSS', extension: 'css' },
  { id: 'markdown', name: 'Markdown', extension: 'md', aliases: ['markdown'] },
  { id: 'rust', name: 'Rust', extension: 'rs' },
  { id: 'go', name: 'Go', extension: 'go' },
  { id: 'sql', name: 'SQL', extension: 'sql' },
  { id: 'shell', name: 'Shell / Bash', extension: 'sh', aliases: ['bash', 'zsh'] },
  { id: 'yaml', name: 'YAML', extension: 'yaml', aliases: ['yml'] },
  { id: 'xml', name: 'XML', extension: 'xml', aliases: ['svg'] },
  { id: 'text', name: 'Plain Text', extension: 'txt' },
]

export const TTL_OPTIONS = [
  { value: 'never', label: 'Never (Permanent)' },
  { value: '10m', label: '10 Minutes' },
  { value: '1h', label: '1 Hour' },
  { value: '1d', label: '1 Day' },
  { value: '7d', label: '1 Week' },
  { value: '30d', label: '1 Month' },
]

export function detectLanguageFromFilename(filename: string): string {
  const parts = filename.split('.')
  if (parts.length <= 1) return 'text'
  const ext = parts.pop()?.toLowerCase() || ''

  for (const lang of SUPPORTED_LANGUAGES) {
    if (lang.extension === ext || lang.aliases?.includes(ext)) {
      return lang.id
    }
  }
  return 'text'
}
