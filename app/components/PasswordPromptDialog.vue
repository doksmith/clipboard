<script setup lang="ts">
import { Lock, KeyRound } from 'lucide-vue-next'

const props = defineProps<{
  open: boolean
  title?: string
  loading?: boolean
  error?: string | null
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
  (e: 'submit', password: string): void
}>()

const passwordInput = ref('')

function handleSubmit() {
  if (passwordInput.value.trim()) {
    emit('submit', passwordInput.value.trim())
  }
}
</script>

<template>
  <UiDialog :open="open" @update:open="emit('update:open', $event)">
    <UiDialogContent class="sm:max-w-md">
      <UiDialogHeader>
        <UiDialogTitle class="flex items-center gap-2">
          <Lock class="h-5 w-5 text-primary" />
          <span>Password Protected Snippet</span>
        </UiDialogTitle>
        <UiDialogDescription>
          This clip is secured with a password. Enter the password below to decrypt and view the contents.
        </UiDialogDescription>
      </UiDialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4 py-2">
        <div class="space-y-2">
          <UiLabel for="paste-password" class="text-xs">Password</UiLabel>
          <div class="relative">
            <UiInput
              id="paste-password"
              v-model="passwordInput"
              type="password"
              placeholder="Enter password..."
              autofocus
              class="pr-10"
            />
            <KeyRound class="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
          <p v-if="error" class="text-xs text-destructive">
            {{ error }}
          </p>
        </div>

        <UiDialogFooter>
          <UiButton type="submit" :disabled="!passwordInput.trim() || loading" class="w-full">
            {{ loading ? 'Unlocking...' : 'Unlock Snippet' }}
          </UiButton>
        </UiDialogFooter>
      </form>
    </UiDialogContent>
  </UiDialog>
</template>
