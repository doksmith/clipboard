'use client'

import { ApiReferenceReact } from '@scalar/api-reference-react'
import '@scalar/api-reference-react/style.css'

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <ApiReferenceReact
        configuration={{
          url: '/api/openapi.json',
          theme: 'saturn',
          darkMode: true,
          showSidebar: true,
          hideDownloadButton: false,
          searchHotKey: 'k',
          defaultHttpClient: {
            targetKey: 'shell',
            clientKey: 'curl',
          },
        }}
      />
    </div>
  )
}
