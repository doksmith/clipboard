<script setup lang="ts">
import { Moon, Sun, Monitor } from 'lucide-vue-next'

const colorMode = useColorMode()

function setTheme(theme: 'light' | 'dark' | 'system') {
  colorMode.preference = theme
}
</script>

<template>
  <UiDropdownMenu>
    <UiDropdownMenuTrigger as-child>
      <UiButton variant="outline" size="icon" class="relative h-9 w-9">
        <Sun class="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon class="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span class="sr-only">Toggle theme</span>
      </UiButton>
    </UiDropdownMenuTrigger>
    <UiDropdownMenuContent align="end">
      <UiDropdownMenuItem @click="setTheme('light')" class="cursor-pointer gap-2">
        <Sun class="h-4 w-4" />
        <span>Light</span>
      </UiDropdownMenuItem>
      <UiDropdownMenuItem @click="setTheme('dark')" class="cursor-pointer gap-2">
        <Moon class="h-4 w-4" />
        <span>Dark</span>
      </UiDropdownMenuItem>
      <UiDropdownMenuItem @click="setTheme('system')" class="cursor-pointer gap-2">
        <Monitor class="h-4 w-4" />
        <span>System</span>
      </UiDropdownMenuItem>
    </UiDropdownMenuContent>
  </UiDropdownMenu>
</template>
