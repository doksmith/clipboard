'use client'

import { useState, useCallback } from 'react'
import { detectLanguageFromFilename } from '@/lib/constants'

export interface EditorFile {
  id: string
  filename: string
  content: string
  syntax: string
  isDirty?: boolean
}

export function useEditorState(initialFiles?: EditorFile[]) {
  const [files, setFiles] = useState<EditorFile[]>(
    initialFiles && initialFiles.length > 0
      ? initialFiles
      : [
          {
            id: 'file-1',
            filename: 'main.ts',
            content: '// Welcome to Clipboard Studio\nconsole.log("Hello, World!");\n',
            syntax: 'typescript',
            isDirty: false,
          },
        ]
  )

  const [activeFileId, setActiveFileId] = useState<string>(files[0]?.id || 'file-1')

  const activeFile = files.find((f) => f.id === activeFileId) || files[0]

  const updateFileContent = useCallback((id: string, content: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, content, isDirty: true } : f))
    )
  }, [])

  const updateFileName = useCallback((id: string, filename: string) => {
    const syntax = detectLanguageFromFilename(filename)
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, filename, syntax, isDirty: true } : f))
    )
  }, [])

  const updateFileSyntax = useCallback((id: string, syntax: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, syntax, isDirty: true } : f))
    )
  }, [])

  const addFile = useCallback(() => {
    const newId = `file-${Date.now()}`
    const newFile: EditorFile = {
      id: newId,
      filename: `snippet-${files.length + 1}.txt`,
      content: '',
      syntax: 'text',
      isDirty: false,
    }
    setFiles((prev) => [...prev, newFile])
    setActiveFileId(newId)
  }, [files.length])

  const removeFile = useCallback(
    (id: string) => {
      if (files.length <= 1) return
      const nextFiles = files.filter((f) => f.id !== id)
      setFiles(nextFiles)
      if (activeFileId === id) {
        setActiveFileId(nextFiles[0]?.id || '')
      }
    },
    [files, activeFileId]
  )

  return {
    files,
    setFiles,
    activeFileId,
    setActiveFileId,
    activeFile,
    updateFileContent,
    updateFileName,
    updateFileSyntax,
    addFile,
    removeFile,
  }
}
