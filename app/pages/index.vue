<script setup lang="ts">
import {
  FileCode,
  Plus,
  Trash2,
  Lock,
  Flame,
  Clock,
  Sparkles,
  ClipboardPaste,
  Shield,
  Send,
  Eye,
  FileText,
  SlidersHorizontal,
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useWebCrypto } from '~/composables/useWebCrypto'

const router = useRouter()
const { encryptText } = useWebCrypto()

interface FileItem {
  id: string
  filename: string
  content: string
  syntax: string
}

const isSubmitting = ref(false)
const title = ref('')
const customSlug = ref('')
const description = ref('')
const visibility = ref<'public' | 'unlisted' | 'private'>('unlisted')
const expiresIn = ref<string>('never')
const burnAfterRead = ref(false)
const isPasswordProtected = ref(false)
const password = ref('')
const clientEncryption = ref(false)

const supportedLanguages = [
  { label: 'Plain Text', value: 'text' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Vue', value: 'vue' },
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
  { label: 'JSON', value: 'json' },
  { label: 'Markdown', value: 'markdown' },
  { label: 'Python', value: 'python' },
  { label: 'Rust', value: 'rust' },
  { label: 'Go', value: 'go' },
  { label: 'SQL', value: 'sql' },
  { label: 'Bash / Shell', value: 'bash' },
  { label: 'YAML', value: 'yaml' },
  { label: 'Dockerfile', value: 'dockerfile' },
]

const files = ref<FileItem[]>([
  {
    id: 'f-1',
    filename: 'snippet.ts',
    content: '',
    syntax: 'typescript',
  },
])

const activeFileIndex = ref(0)
const activeFile = computed<FileItem>(() => files.value[activeFileIndex.value] || files.value[0]!)

function addFile() {
  const index = files.value.length + 1
  files.value.push({
    id: `f-${Date.now()}`,
    filename: `file-${index}.txt`,
    content: '',
    syntax: 'text',
  })
  activeFileIndex.value = files.value.length - 1
  toast.success('New file added to snippet')
}

function removeFile(index: number) {
  if (files.value.length <= 1) {
    toast.error('At least one file is required')
    return
  }
  files.value.splice(index, 1)
  if (activeFileIndex.value >= files.value.length) {
    activeFileIndex.value = files.value.length - 1
  }
}

async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText()
    if (!text) {
      toast.error('Clipboard is empty')
      return
    }
    if (activeFile.value) {
      activeFile.value.content = text
      toast.success('Pasted content into active file!')
    }
  } catch (err) {
    toast.error('Clipboard permission denied by browser')
  }
}

// Auto detect syntax from extension
watch(
  () => activeFile.value?.filename,
  (name) => {
    if (!name || !activeFile.value) return
    const ext = name.split('.').pop()?.toLowerCase()
    const map: Record<string, string> = {
      ts: 'typescript',
      js: 'javascript',
      mjs: 'javascript',
      cjs: 'javascript',
      vue: 'vue',
      html: 'html',
      css: 'css',
      json: 'json',
      md: 'markdown',
      py: 'python',
      rs: 'rust',
      go: 'go',
      sql: 'sql',
      sh: 'bash',
      bash: 'bash',
      yml: 'yaml',
      yaml: 'yaml',
      txt: 'text',
    }
    if (ext && map[ext]) {
      activeFile.value.syntax = map[ext]
    }
  },
)

// Statistics
const totalLines = computed(() => {
  return files.value.reduce((acc, f) => acc + (f.content ? f.content.split('\n').length : 0), 0)
})
const totalCharacters = computed(() => {
  return files.value.reduce((acc, f) => acc + f.content.length, 0)
})

async function createPaste() {
  // Validate that there is content
  const hasContent = files.value.some((f) => f.content.trim().length > 0)
  if (!hasContent) {
    toast.error('Please enter content before creating a clip')
    return
  }

  isSubmitting.value = true
  try {
    let payloadFiles = files.value.map((f) => ({
      filename: f.filename,
      content: f.content,
      syntax: f.syntax,
    }))

    // Client-side zero knowledge encryption
    if (clientEncryption.value && isPasswordProtected.value && password.value) {
      for (const file of payloadFiles) {
        file.content = await encryptText(file.content, password.value)
      }
    }

    const payload: any = {
      title: title.value.trim() || undefined,
      description: description.value.trim() || undefined,
      slug: customSlug.value.trim() || undefined,
      visibility: visibility.value,
      expiresIn: expiresIn.value !== 'never' ? expiresIn.value : undefined,
      burnAfterRead: burnAfterRead.value,
      isEncrypted: clientEncryption.value && isPasswordProtected.value,
      password: !clientEncryption.value && isPasswordProtected.value ? password.value : undefined,
      files: payloadFiles,
    }

    const res = await $fetch<{ success: boolean; paste: { slug: string } }>('/api/pastes', {
      method: 'POST',
      body: payload,
    })

    if (res?.paste?.slug) {
      toast.success('Snippet created successfully!')
      router.push(`/${res.paste.slug}`)
    }
  } catch (err: any) {
    toast.error(err.data?.statusMessage || err.message || 'Failed to create snippet')
  } finally {
    isSubmitting.value = false
  }
}

// Global keyboard shortcuts
onMounted(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      createPaste()
    }
  }
  window.addEventListener('keydown', handler)
  onUnmounted(() => window.removeEventListener('keydown', handler))
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header & Action Row -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Create Realtime Snippet</h1>
        <p class="text-xs text-muted-foreground mt-0.5">
          Paste text, share multi-file gists, or synchronize live across devices.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <UiButton variant="outline" size="sm" class="gap-1.5 text-xs" @click="pasteFromClipboard">
          <ClipboardPaste class="h-3.5 w-3.5" />
          <span>Paste from Clipboard</span>
        </UiButton>

        <UiButton
          size="sm"
          class="gap-1.5 font-semibold text-xs shadow-sm"
          :disabled="isSubmitting"
          @click="createPaste"
        >
          <Send class="h-3.5 w-3.5" />
          <span>{{ isSubmitting ? 'Publishing...' : 'Create Snippet' }}</span>
          <UiBadge variant="secondary" class="ml-1 px-1 py-0 text-[10px] hidden sm:inline-block">Ctrl+S</UiBadge>
        </UiButton>
      </div>
    </div>

    <!-- Metadata & Settings Bar -->
    <UiCard class="p-4 shadow-xs">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-12">
        <!-- Title Input -->
        <div class="md:col-span-5 space-y-1.5">
          <UiLabel for="paste-title" class="text-xs font-medium">Snippet Title (Optional)</UiLabel>
          <UiInput
            id="paste-title"
            v-model="title"
            placeholder="e.g. Distributed Lock implementation in TypeScript"
            class="h-9 text-xs"
          />
        </div>

        <!-- Custom URL Slug -->
        <div class="md:col-span-3 space-y-1.5">
          <UiLabel for="custom-slug" class="text-xs font-medium">Custom Vanity Slug</UiLabel>
          <UiInput
            id="custom-slug"
            v-model="customSlug"
            placeholder="auto-generated"
            class="h-9 text-xs font-mono"
          />
        </div>

        <!-- Visibility Selector -->
        <div class="md:col-span-2 space-y-1.5">
          <UiLabel class="text-xs font-medium">Visibility</UiLabel>
          <UiSelect v-model="visibility">
            <UiSelectTrigger class="h-9 text-xs">
              <UiSelectValue placeholder="Select visibility" />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem value="unlisted">Unlisted (Secret Link)</UiSelectItem>
              <UiSelectItem value="public">Public (Explore Feed)</UiSelectItem>
              <UiSelectItem value="private">Private</UiSelectItem>
            </UiSelectContent>
          </UiSelect>
        </div>

        <!-- Expiry Selector -->
        <div class="md:col-span-2 space-y-1.5">
          <UiLabel class="text-xs font-medium">Expiration</UiLabel>
          <UiSelect v-model="expiresIn">
            <UiSelectTrigger class="h-9 text-xs">
              <UiSelectValue placeholder="Select expiration" />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem value="never">Never</UiSelectItem>
              <UiSelectItem value="10m">10 Minutes</UiSelectItem>
              <UiSelectItem value="1h">1 Hour</UiSelectItem>
              <UiSelectItem value="1d">1 Day</UiSelectItem>
              <UiSelectItem value="7d">7 Days</UiSelectItem>
              <UiSelectItem value="30d">30 Days</UiSelectItem>
            </UiSelectContent>
          </UiSelect>
        </div>
      </div>

      <!-- Advanced Toggles Collapsible -->
      <UiCollapsible class="mt-4 border-t pt-3">
        <div class="flex items-center justify-between">
          <div class="flex flex-wrap items-center gap-6 text-xs">
            <!-- Burn after read -->
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <UiSwitch v-model:checked="burnAfterRead" />
              <span class="flex items-center gap-1 font-medium">
                <Flame class="h-3.5 w-3.5 text-orange-500" />
                Burn after read
              </span>
            </label>

            <!-- Password Protection -->
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <UiSwitch v-model:checked="isPasswordProtected" />
              <span class="flex items-center gap-1 font-medium">
                <Lock class="h-3.5 w-3.5 text-amber-500" />
                Password Protection
              </span>
            </label>

            <!-- Zero knowledge toggle -->
            <label v-if="isPasswordProtected" class="flex items-center gap-2 cursor-pointer select-none">
              <UiSwitch v-model:checked="clientEncryption" />
              <span class="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                <Shield class="h-3.5 w-3.5" />
                Client-Side AES-GCM-256
              </span>
            </label>
          </div>

          <div class="text-[11px] text-muted-foreground font-mono">
            <span>{{ files.length }} file(s) &bull; {{ totalLines }} lines &bull; {{ totalCharacters }} chars</span>
          </div>
        </div>

        <!-- Password input field if enabled -->
        <div v-if="isPasswordProtected" class="mt-3 max-w-sm space-y-1">
          <UiInput
            v-model="password"
            type="password"
            placeholder="Set snippet decryption password..."
            class="h-8 text-xs font-mono"
          />
          <p class="text-[11px] text-muted-foreground">
            {{ clientEncryption ? 'Zero-knowledge: Encrypted in your browser before upload.' : 'Verified securely by the server.' }}
          </p>
        </div>
      </UiCollapsible>
    </UiCard>

    <!-- Multi-File Editor Workspace -->
    <UiCard class="overflow-hidden border shadow-sm">
      <!-- File Tabs Header -->
      <div class="flex items-center justify-between border-b bg-muted/40 px-2 pt-2">
        <!-- Tabs List -->
        <div class="flex items-center gap-1 overflow-x-auto scrollbar-none pb-2">
          <button
            v-for="(file, idx) in files"
            :key="file.id"
            type="button"
            @click="activeFileIndex = idx"
            :class="[
              'group flex items-center gap-2 rounded-t-lg border-t border-x px-3 py-1.5 text-xs font-medium transition-all shrink-0',
              activeFileIndex === idx
                ? 'bg-card text-foreground border-border shadow-xs'
                : 'bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/70'
            ]"
          >
            <FileCode class="h-3.5 w-3.5 text-primary" />
            <span>{{ file.filename || `file-${idx + 1}.txt` }}</span>
            <button
              v-if="files.length > 1"
              type="button"
              class="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity ml-1"
              @click.stop="removeFile(idx)"
            >
              <Trash2 class="h-3 w-3" />
            </button>
          </button>

          <!-- Add File Button -->
          <UiButton variant="ghost" size="sm" class="h-8 px-2 gap-1 text-xs text-muted-foreground shrink-0" @click="addFile">
            <Plus class="h-3.5 w-3.5" />
            <span>Add File</span>
          </UiButton>
        </div>
      </div>

      <!-- Active File Configuration Bar -->
      <div v-if="activeFile" class="flex flex-wrap items-center justify-between gap-3 border-b bg-card px-4 py-2 text-xs">
        <div class="flex flex-1 items-center gap-3 min-w-[240px]">
          <UiInput
            v-model="activeFile.filename"
            placeholder="Filename (e.g. handler.ts)"
            class="h-8 max-w-[240px] text-xs font-mono"
          />
          <UiSelect v-model="activeFile.syntax">
            <UiSelectTrigger class="h-8 w-36 text-xs">
              <UiSelectValue placeholder="Syntax" />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem
                v-for="lang in supportedLanguages"
                :key="lang.value"
                :value="lang.value"
              >
                {{ lang.label }}
              </UiSelectItem>
            </UiSelectContent>
          </UiSelect>
        </div>

        <div class="flex items-center gap-3 text-muted-foreground text-[11px] font-mono">
          <span>{{ (activeFile.content || '').split('\n').length }} lines</span>
          <span>&bull;</span>
          <span>{{ (activeFile.content || '').length }} chars</span>
        </div>
      </div>

      <!-- Editor Textarea Area -->
      <div v-if="activeFile" class="relative bg-background">
        <UiTextarea
          v-model="activeFile.content"
          placeholder="// Paste or write your code, notes, or configuration here..."
          rows="18"
          class="w-full resize-y rounded-none border-0 font-mono text-xs leading-relaxed p-4 focus-visible:ring-0 focus-visible:outline-none min-h-[360px]"
          spellcheck="false"
        />
      </div>
    </UiCard>
  </div>
</template>
