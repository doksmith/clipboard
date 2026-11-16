<script setup lang="ts">
import { Share2, Copy, Check, Terminal } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const props = defineProps<{
  open: boolean
  slug: string
  title?: string
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
}>()

const url = useRequestURL()
const fullUrl = computed(() => `${url.origin}/${props.slug}`)
const rawUrl = computed(() => `${url.origin}/raw/${props.slug}`)
const curlCommand = computed(() => `curl -sL ${rawUrl.value}`)

const copiedField = ref<string | null>(null)

async function copyText(text: string, field: string) {
  await navigator.clipboard.writeText(text)
  copiedField.value = field
  toast.success('Copied to clipboard!')
  setTimeout(() => { copiedField.value = null }, 2000)
}
</script>

<template>
  <UiDialog :open="open" @update:open="emit('update:open', $event)">
    <UiDialogContent class="sm:max-w-lg">
      <UiDialogHeader>
        <UiDialogTitle class="flex items-center gap-2">
          <Share2 class="h-5 w-5 text-primary" />
          <span>Share Snippet</span>
        </UiDialogTitle>
        <UiDialogDescription>
          Share this snippet via direct link, raw text endpoint, or terminal curl command.
        </UiDialogDescription>
      </UiDialogHeader>

      <div class="space-y-4 py-2">
        <!-- Direct URL -->
        <div class="space-y-2">
          <UiLabel class="text-xs font-medium text-muted-foreground">Direct Link</UiLabel>
          <div class="flex gap-2">
            <UiInput :model-value="fullUrl" readonly class="font-mono text-xs" />
            <UiButton size="sm" variant="outline" class="shrink-0" @click="copyText(fullUrl, 'url')">
              <Check v-if="copiedField === 'url'" class="h-4 w-4 text-green-500" />
              <Copy v-else class="h-4 w-4" />
            </UiButton>
          </div>
        </div>

        <!-- Raw URL -->
        <div class="space-y-2">
          <UiLabel class="text-xs font-medium text-muted-foreground">Raw Text URL</UiLabel>
          <div class="flex gap-2">
            <UiInput :model-value="rawUrl" readonly class="font-mono text-xs" />
            <UiButton size="sm" variant="outline" class="shrink-0" @click="copyText(rawUrl, 'raw')">
              <Check v-if="copiedField === 'raw'" class="h-4 w-4 text-green-500" />
              <Copy v-else class="h-4 w-4" />
            </UiButton>
          </div>
        </div>

        <!-- Curl Command -->
        <div class="space-y-2">
          <UiLabel class="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Terminal class="h-3.5 w-3.5" />
            <span>Terminal / Curl</span>
          </UiLabel>
          <div class="flex gap-2">
            <UiInput :model-value="curlCommand" readonly class="font-mono text-xs" />
            <UiButton size="sm" variant="outline" class="shrink-0" @click="copyText(curlCommand, 'curl')">
              <Check v-if="copiedField === 'curl'" class="h-4 w-4 text-green-500" />
              <Copy v-else class="h-4 w-4" />
            </UiButton>
          </div>
        </div>
      </div>

      <UiDialogFooter>
        <UiButton variant="outline" size="sm" @click="emit('update:open', false)">
          Done
        </UiButton>
      </UiDialogFooter>
    </UiDialogContent>
  </UiDialog>
</template>
