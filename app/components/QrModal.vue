<script setup lang="ts">
import QRCode from 'qrcode'
import { QrCode, Copy, Check } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const props = defineProps<{
  open: boolean
  url: string
  title?: string
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
}>()

const qrDataUrl = ref<string>('')
const copied = ref(false)

watch(() => props.open, async (isOpen) => {
  if (isOpen && props.url) {
    try {
      qrDataUrl.value = await QRCode.toDataURL(props.url, {
        width: 280,
        margin: 2,
        color: {
          dark: '#09090b',
          light: '#ffffff',
        },
      })
    } catch (err) {
      console.error('Failed to generate QR code', err)
    }
  }
})

async function copyUrl() {
  await navigator.clipboard.writeText(props.url)
  copied.value = true
  toast.success('Link copied to clipboard!')
  setTimeout(() => { copied.value = false }, 2000)
}
</script>

<template>
  <UiDialog :open="open" @update:open="emit('update:open', $event)">
    <UiDialogContent class="sm:max-w-md">
      <UiDialogHeader>
        <UiDialogTitle class="flex items-center gap-2">
          <QrCode class="h-5 w-5 text-primary" />
          <span>Scan with Mobile</span>
        </UiDialogTitle>
        <UiDialogDescription>
          Scan this QR code with your mobile camera to instantly access or sync this clipboard.
        </UiDialogDescription>
      </UiDialogHeader>

      <div class="flex flex-col items-center justify-center p-4">
        <div class="rounded-xl border bg-white p-3 shadow-sm">
          <img v-if="qrDataUrl" :src="qrDataUrl" alt="QR Code" class="h-56 w-56" />
          <UiSkeleton v-else class="h-56 w-56 rounded-lg" />
        </div>
        <p class="mt-3 text-xs text-muted-foreground truncate max-w-full font-mono">
          {{ url }}
        </p>
      </div>

      <UiDialogFooter class="sm:justify-between">
        <UiButton variant="outline" size="sm" @click="emit('update:open', false)">
          Close
        </UiButton>
        <UiButton size="sm" class="gap-2" @click="copyUrl">
          <Check v-if="copied" class="h-4 w-4" />
          <Copy v-else class="h-4 w-4" />
          <span>{{ copied ? 'Copied!' : 'Copy Link' }}</span>
        </UiButton>
      </UiDialogFooter>
    </UiDialogContent>
  </UiDialog>
</template>
