<script setup lang="ts">
import {
  Copy,
  Check,
  FileCode,
  Download,
  Share2,
  QrCode,
  Flame,
  Lock,
  Clock,
  Eye,
  Terminal,
  GitFork,
  Radio,
  FileText,
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useShiki } from '~/composables/useShiki'
import { useWebCrypto } from '~/composables/useWebCrypto'
import { useRealtimeClip } from '~/composables/useRealtimeClip'

const route = useRoute()
const router = useRouter()
const slug = computed(() => route.params.id as string)

const { highlightCode, activeTheme } = useShiki()
const { decryptText } = useWebCrypto()

// State
const passwordModalOpen = ref(false)
const passwordInput = ref('')
const passwordError = ref<string | null>(null)
const qrModalOpen = ref(false)
const shareModalOpen = ref(false)
const activeFileIndex = ref(0)
const highlightedHtml = ref<string>('')
const isCopied = ref(false)
const isBurnedNotice = ref(false)

// Password header state
const customHeaders = ref<Record<string, string>>({})

const { data: pasteData, pending, error, refresh } = await useFetch<any>(() => `/api/pastes/${slug.value}`, {
  headers: customHeaders,
  watch: [customHeaders],
})

watch(
  pasteData,
  async (data) => {
    if (!data) return
    if (data.requiresPassword) {
      passwordModalOpen.value = true
    } else {
      passwordModalOpen.value = false
      if (data.burnAfterRead) {
        isBurnedNotice.value = true
      }
      renderActiveFile()
    }
  },
  { immediate: true },
)

const activeFile = computed(() => {
  if (!pasteData.value?.files?.length) return null
  return pasteData.value.files[activeFileIndex.value] || pasteData.value.files[0]
})

// Re-render Shiki syntax highlight whenever active file or theme changes
watch([activeFile, activeTheme], () => {
  renderActiveFile()
})

async function renderActiveFile() {
  if (!activeFile.value) return
  highlightedHtml.value = await highlightCode(activeFile.value.content, activeFile.value.syntax)
}

// Unlock password protected paste
async function handlePasswordSubmit(enteredPassword: string) {
  passwordError.value = null

  // If server-side hashed password
  customHeaders.value = {
    'x-paste-password': enteredPassword,
  }
  await refresh()

  if (pasteData.value && !pasteData.value.requiresPassword) {
    // If client-side AES encrypted, decrypt each file in browser
    if (pasteData.value.isEncrypted) {
      try {
        for (const f of pasteData.value.files) {
          f.content = await decryptText(f.content, enteredPassword)
        }
        await renderActiveFile()
        toast.success('Snippet unlocked and decrypted!')
      } catch (err) {
        passwordError.value = 'Failed to decrypt snippet with this password'
        return
      }
    } else {
      toast.success('Snippet unlocked!')
    }
    passwordModalOpen.value = false
  } else {
    passwordError.value = 'Incorrect password'
  }
}

// Realtime sync listener
const { isConnected, activePeers } = useRealtimeClip({
  room: `paste:${slug.value}`,
  onSync: (payload) => {
    if (payload?.files && pasteData.value) {
      pasteData.value.files = payload.files
      renderActiveFile()
      toast.info('Snippet updated live by peer!')
    }
  },
})

async function copyFileContent() {
  if (!activeFile.value) return
  await navigator.clipboard.writeText(activeFile.value.content)
  isCopied.value = true
  toast.success(`Copied ${activeFile.value.filename} to clipboard!`)
  setTimeout(() => { isCopied.value = false }, 2000)
}

function downloadFile() {
  if (!activeFile.value) return
  const blob = new Blob([activeFile.value.content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = activeFile.value.filename
  a.click()
  URL.revokeObjectURL(url)
  toast.success(`Downloaded ${activeFile.value.filename}`)
}

function forkPaste() {
  if (!pasteData.value) return
  router.push({
    path: '/',
    query: {
      fork: pasteData.value.slug,
    },
  })
}

const currentUrl = computed(() => {
  if (import.meta.server) return ''
  return window.location.href
})
</script>

<template>
  <div class="space-y-6">
    <!-- Loading skeleton -->
    <div v-if="pending && !pasteData" class="space-y-4">
      <UiSkeleton class="h-10 w-2/3" />
      <UiSkeleton class="h-20 w-full" />
      <UiSkeleton class="h-96 w-full" />
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
      <h2 class="text-lg font-semibold text-destructive">Snippet Unavailable</h2>
      <p class="mt-1 text-xs text-muted-foreground">
        {{ (error as any)?.data?.statusMessage || 'This snippet may have expired, reached its burn-after-read limit, or does not exist.' }}
      </p>
      <UiButton class="mt-4" size="sm" @click="router.push('/')">
        Create New Snippet
      </UiButton>
    </div>

    <!-- Burn after read alert -->
    <UiAlert v-if="isBurnedNotice" variant="destructive" class="border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400">
      <Flame class="h-4 w-4" />
      <UiAlertTitle class="font-semibold text-xs">Burn-after-read Activated</UiAlertTitle>
      <UiAlertDescription class="text-xs">
        This snippet has now self-destructed. If you reload or close this page, it will no longer be accessible.
      </UiAlertDescription>
    </UiAlert>

    <!-- Content View -->
    <div v-if="pasteData && !pasteData.requiresPassword" class="space-y-6">
      <!-- Snippet Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-bold tracking-tight">
              {{ pasteData.title || pasteData.slug }}
            </h1>
            <UiBadge v-if="pasteData.visibility === 'public'" variant="outline" class="text-[10px] uppercase font-mono">
              Public
            </UiBadge>
            <UiBadge v-if="pasteData.isEncrypted" variant="secondary" class="gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
              <Lock class="h-3 w-3" />
              <span>E2E Encrypted</span>
            </UiBadge>
            <UiBadge v-if="pasteData.burnAfterRead" variant="destructive" class="gap-1 text-[10px]">
              <Flame class="h-3 w-3" />
              <span>Burned</span>
            </UiBadge>
          </div>

          <!-- Metadata row -->
          <div class="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-mono">
            <span class="flex items-center gap-1">
              <Clock class="h-3.5 w-3.5" />
              <span>{{ new Date(pasteData.createdAt).toLocaleDateString() }}</span>
            </span>
            <span>&bull;</span>
            <span class="flex items-center gap-1">
              <Eye class="h-3.5 w-3.5" />
              <span>{{ pasteData.viewCount }} views</span>
            </span>
            <span>&bull;</span>
            <span>{{ pasteData.files?.length || 1 }} file(s)</span>

            <!-- Realtime active peers badge -->
            <span v-if="isConnected" class="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px]">
              <Radio class="h-3 w-3 animate-pulse" />
              <span>{{ activePeers }} live peer(s)</span>
            </span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap items-center gap-2">
          <UiButton variant="outline" size="sm" class="gap-1.5 text-xs" @click="copyFileContent">
            <Check v-if="isCopied" class="h-3.5 w-3.5 text-green-500" />
            <Copy v-else class="h-3.5 w-3.5" />
            <span>{{ isCopied ? 'Copied!' : 'Copy Raw' }}</span>
          </UiButton>

          <UiButton variant="outline" size="sm" class="gap-1.5 text-xs" @click="downloadFile">
            <Download class="h-3.5 w-3.5" />
            <span class="hidden sm:inline">Download</span>
          </UiButton>

          <NuxtLink :to="`/raw/${pasteData.slug}`" target="_blank">
            <UiButton variant="outline" size="sm" class="gap-1.5 text-xs">
              <Terminal class="h-3.5 w-3.5" />
              <span>Raw</span>
            </UiButton>
          </NuxtLink>

          <UiButton variant="outline" size="sm" class="gap-1.5 text-xs" @click="qrModalOpen = true">
            <QrCode class="h-3.5 w-3.5" />
            <span class="hidden sm:inline">QR Code</span>
          </UiButton>

          <UiButton variant="outline" size="sm" class="gap-1.5 text-xs" @click="shareModalOpen = true">
            <Share2 class="h-3.5 w-3.5" />
            <span>Share</span>
          </UiButton>
        </div>
      </div>

      <!-- Multi-File Viewer Window -->
      <UiCard class="overflow-hidden border shadow-sm">
        <!-- Files Tabs Navigation -->
        <div class="flex items-center justify-between border-b bg-muted/40 px-3 pt-2">
          <div class="flex items-center gap-1 overflow-x-auto scrollbar-none pb-2">
            <button
              v-for="(file, idx) in pasteData.files"
              :key="file.id"
              type="button"
              @click="activeFileIndex = Number(idx)"
              :class="[
                'flex items-center gap-2 rounded-t-lg border-t border-x px-3.5 py-1.5 text-xs font-medium transition-all shrink-0',
                activeFileIndex === idx
                  ? 'bg-card text-foreground border-border shadow-xs'
                  : 'bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/70'
              ]"
            >
              <FileCode class="h-3.5 w-3.5 text-primary" />
              <span>{{ file.filename }}</span>
              <UiBadge variant="secondary" class="text-[10px] font-mono px-1 py-0">
                {{ file.syntax }}
              </UiBadge>
            </button>
          </div>

          <div class="text-[11px] text-muted-foreground font-mono hidden sm:block pb-2">
            {{ (activeFile?.content || '').split('\n').length }} lines &bull; {{ activeFile?.sizeBytes || 0 }} bytes
          </div>
        </div>

        <!-- Rendered Code Container -->
        <div class="relative overflow-x-auto bg-card p-4">
          <div
            v-if="highlightedHtml"
            class="shiki-container text-xs font-mono leading-relaxed"
            v-html="highlightedHtml"
          />
          <pre v-else class="text-xs font-mono p-2"><code>{{ activeFile?.content }}</code></pre>
        </div>
      </UiCard>
    </div>

    <!-- Modals -->
    <PasswordPromptDialog
      :open="passwordModalOpen"
      :error="passwordError"
      @update:open="passwordModalOpen = $event"
      @submit="handlePasswordSubmit"
    />

    <QrModal
      :open="qrModalOpen"
      :url="currentUrl"
      :title="pasteData?.title || pasteData?.slug"
      @update:open="qrModalOpen = $event"
    />

    <ShareModal
      v-if="pasteData"
      :open="shareModalOpen"
      :slug="pasteData.slug"
      :title="pasteData.title"
      @update:open="shareModalOpen = $event"
    />
  </div>
</template>

<style>
.shiki-container pre {
  margin: 0;
  padding: 0;
  background-color: transparent !important;
  font-family: inherit;
}
.shiki-container code {
  font-family: inherit;
}
</style>
