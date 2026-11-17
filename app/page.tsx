import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { CodeStudio } from '@/components/editor/code-studio'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 px-4 py-4 sm:px-6">
        <CodeStudio />
      </main>
      <Footer />
    </div>
  )
}
