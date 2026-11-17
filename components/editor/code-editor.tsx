'use client'

import CodeMirror from '@uiw/react-codemirror'
import { EditorView } from '@codemirror/view'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import { useTheme } from 'next-themes'
import { useMemo } from 'react'

interface CodeEditorProps {
  value: string
  syntax: string
  isWordWrap: boolean
  onChange: (val: string) => void
  onCursorChange?: (pos: { line: number; col: number }) => void
}

export function CodeEditor({
  value,
  syntax,
  isWordWrap,
  onChange,
  onCursorChange,
}: CodeEditorProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const extensions = useMemo(() => {
    const exts = []
    if (syntax === 'javascript' || syntax === 'typescript') {
      exts.push(javascript({ typescript: syntax === 'typescript', jsx: true }))
    } else if (syntax === 'python') {
      exts.push(python())
    } else if (syntax === 'json') {
      exts.push(json())
    }

    if (isWordWrap) {
      exts.push(EditorView.lineWrapping)
    }

    return exts
  }, [syntax, isWordWrap])

  return (
    <div className="relative min-h-[400px] flex-1 overflow-hidden font-mono text-sm">
      <CodeMirror
        value={value}
        height="100%"
        theme={isDark ? oneDark : 'light'}
        extensions={extensions}
        onChange={onChange}
        onUpdate={(viewUpdate) => {
          if (viewUpdate.selectionSet && onCursorChange) {
            const head = viewUpdate.state.selection.main.head
            const line = viewUpdate.state.doc.lineAt(head)
            onCursorChange({
              line: line.number,
              col: head - line.from + 1,
            })
          }
        }}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightSpecialChars: true,
          history: true,
          foldGutter: true,
          drawSelection: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          syntaxHighlighting: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          closeBracketsKeymap: true,
          defaultKeymap: true,
          searchKeymap: true,
          historyKeymap: true,
          foldKeymap: true,
          completionKeymap: true,
          lintKeymap: true,
        }}
        className="h-full [&_.cm-editor]:h-full [&_.cm-scroller]:overflow-auto"
      />
    </div>
  )
}
