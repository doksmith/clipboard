<script setup lang="ts">
import {
  Radio,
  Copy,
  Check,
  QrCode,
  Share2,
  Save,
  Users,
  Zap,
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useRealtimeClip } from '~/composables/useRealtimeClip'

const route = useRoute()
const router = useRouter()
const room = computed(() => (route.params.room as string) || 'shared')

const liveContent = ref('')
const isCopied = ref(false)
const qrModalOpen = ref(false)
const isSaving = ref(false)
let debounceTimer: any = null

const { isConnected, activePeers, broadcastSync } = useRealtimeClip({
  room: `live:${room.value}`,
  onSync: (payload) => {
    if (typeof payload?.text === 'string') {
      liveContent.value = payload.text
    }
  },
  onPeerJoin: () => {
    toast.info('A new device joined this live pad')
  },
})

function handleInput() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    broadcastSync({ text: liveContent.value })
  }, 80)
}

async function copyContent() {
  await navigator.clipboard.writeText(liveContent.value)
  isCopied.value = true
  toast.success('Live content copied to clipboard!')
  setTimeout(() => { isCopied.value = false }, 2000)
}

async function saveAsPermanent() {
  if (!liveContent.value.trim()) {
    toast.error('Nothing to save: scratchpad is empty')
    return
  }

  isSaving.value = true
  try {
    const res = await $fetch<{ success: boolean; paste: { slug: string } }>('/api/pastes', {
      method: 'POST',
      body: {
        title: `Live Pad Export (${room.value})`,
        content: liveContent.value,
        syntax: 'text',
        visibility: 'unlisted',
      },
    })
    toast.success('Saved to permanent snippet!')
    router.push(`/${res.paste.slug}`)
  } catch (err: any) {
    toast.error('Failed to save snippet')
  } finally {
    isSaving.value = false
  }
}

const currentUrl = computed(() => {
  if (import.meta.server) return ''
  return window.location.href
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div class="flex items-center gap-2">
          <Zap class="h-6 w-6 text-amber-500 animate-pulse" />
          <h1 class="text-2xl font-bold tracking-tight">
            Live Scratchpad: <span class="font-mono text-primary">{{ room }}</span>
          </h1>
        </div>
        <p class="text-xs text-muted-foreground mt-1">
          Instant realtime clipboard synchronized in real-time across all your browsers and devices.
        </p>
      </div>

      <!-- Action buttons -->
      <div class="flex flex-wrap items-center gap-2">
        <!-- Live status -->
        <div class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono">
          <Radio class="h-3.5 w-3.5 animate-pulse" />
          <span>{{ isConnected ? `${activePeers} active device(s)` : 'Connecting...' }}</span>
        </div>

        <UiButton variant="outline" size="sm" class="gap-1.5 text-xs" @click="copyContent">
          <Check v-if="isCopied" class="h-3.5 w-3.5 text-green-500" />
          <Copy v-else class="h-3.5 w-3.5" />
          <span>{{ isCopied ? 'Copied' : 'Copy All' }}</span>
        </UiButton>

        <UiButton variant="outline" size="sm" class="gap-1.5 text-xs" @click="qrModalOpen = true">
          <QrCode class="h-3.5 w-3.5" />
          <span>QR Handoff</span>
        </UiButton>

        <UiButton size="sm" class="gap-1.5 text-xs shadow-xs" :disabled="isSaving" @click="saveAsPermanent">
          <Save class="h-3.5 w-3.5" />
          <span>Save as Snippet</span>
        </UiButton>
      </div>
    </div>

    <!-- Live Workspace Pad -->
    <UiCard class="overflow-hidden border shadow-sm">
      <div class="flex items-center justify-between border-b bg-muted/40 px-4 py-2 text-xs text-muted-foreground font-mono">
        <div class="flex items-center gap-2">
          <span class="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
          <span>Live Broadcast Channel: live:{{ room }}</span>
        </div>
        <div>
          <span>{{ liveContent.split('\n').length }} lines &bull; {{ liveContent.length }} characters</span>
        </div>
      </div>

      <UiTextarea
        v-model="liveContent"
        @input="handleInput"
        placeholder="// Type or paste here. Any changes immediately appear on all other screens watching this room..."
        rows="22"
        class="w-full resize-y rounded-none border-0 font-mono text-xs leading-relaxed p-4 focus-visible:ring-0 focus-visible:outline-none min-h-[480px]"
        spellcheck="false"
      />
    </UiCard>

    <QrModal
      :open="qrModalOpen"
      :url="currentUrl"
      title="Join Live Scratchpad"
      @update:open="qrModalOpen = $event"
    />
  </div>
</template>
