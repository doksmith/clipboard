<script setup lang="ts">
import {
  Clipboard,
  Compass,
  PlusCircle,
  Menu,
  Terminal,
  ShieldCheck,
  Zap,
} from 'lucide-vue-next'

const route = useRoute()
const mobileMenuOpen = ref(false)

const navLinks = [
  { name: 'New Paste', path: '/', icon: PlusCircle },
  { name: 'Live Pad', path: '/live/shared', icon: Zap },
  { name: 'Explore', path: '/explore', icon: Compass },
]
</script>

<template>
  <div class="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-primary/20">
    <!-- Top Header -->
    <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="mx-auto flex h-16 max-w-7xl 2xl:max-w-[1700px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <!-- Brand -->
        <div class="flex items-center gap-6">
          <NuxtLink to="/" class="flex items-center gap-3 font-semibold text-base tracking-tight transition-opacity hover:opacity-90">
            <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Clipboard class="h-4 w-4" />
            </div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-lg">SyncClip</span>
              <UiBadge variant="secondary" class="font-mono text-xs">v1.0</UiBadge>
            </div>
          </NuxtLink>

          <!-- Desktop Navigation -->
          <nav class="hidden md:flex items-center gap-1">
            <NuxtLink
              v-for="link in navLinks"
              :key="link.path"
              :to="link.path"
              :class="[
                'flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium',
                route.path === link.path
                  ? 'bg-secondary text-secondary-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
              ]"
            >
              <component :is="link.icon" class="h-4 w-4" />
              <span>{{ link.name }}</span>
            </NuxtLink>
          </nav>
        </div>

        <!-- Right Actions -->
        <div class="flex items-center gap-3">
          <!-- Realtime Status Indicator (ClientOnly to prevent SSR mismatch) -->
          <ClientOnly>
            <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/60 border text-xs text-muted-foreground font-mono">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Realtime Hub</span>
            </div>
          </ClientOnly>

          <ThemeToggle />

          <!-- Mobile Menu Trigger -->
          <UiSheet v-model:open="mobileMenuOpen">
            <UiSheetTrigger as-child>
              <UiButton variant="outline" size="icon" class="md:hidden">
                <Menu class="h-4 w-4" />
                <span class="sr-only">Toggle navigation menu</span>
              </UiButton>
            </UiSheetTrigger>
            <UiSheetContent side="right" class="w-72">
              <UiSheetHeader>
                <UiSheetTitle class="flex items-center gap-2">
                  <div class="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <Clipboard class="h-4 w-4" />
                  </div>
                  <span>SyncClip Navigation</span>
                </UiSheetTitle>
              </UiSheetHeader>
              <div class="mt-6 flex flex-col gap-2">
                <NuxtLink
                  v-for="link in navLinks"
                  :key="link.path"
                  :to="link.path"
                  @click="mobileMenuOpen = false"
                  :class="[
                    'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                    route.path === link.path
                      ? 'bg-secondary text-secondary-foreground font-semibold'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  ]"
                >
                  <component :is="link.icon" class="h-4 w-4" />
                  <span>{{ link.name }}</span>
                </NuxtLink>
              </div>

              <div class="mt-8 border-t pt-4 space-y-3">
                <div class="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck class="h-4 w-4 text-emerald-500" />
                  <span>SQLite + Drizzle Engine</span>
                </div>
                <div class="flex items-center gap-2 text-xs text-muted-foreground">
                  <Terminal class="h-4 w-4 text-blue-500" />
                  <span>curl / raw endpoints enabled</span>
                </div>
              </div>
            </UiSheetContent>
          </UiSheet>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-1 w-full mx-auto max-w-7xl 2xl:max-w-[1700px] px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="border-t py-6 text-center text-xs text-muted-foreground">
      <div class="mx-auto max-w-7xl 2xl:max-w-[1700px] px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>SyncClip &copy; {{ new Date().getFullYear() }} &bull; Fast, Self-Hosted Realtime Clipboard</p>
        <p class="font-mono text-xs">Zero CDN &bull; Nuxt 4 &bull; shadcn-vue &bull; SQLite &bull; Nitro WS</p>
      </div>
    </footer>

    <!-- Global Sonner Toasts wrapped in ClientOnly -->
    <ClientOnly>
      <UiSonner position="bottom-right" />
    </ClientOnly>
  </div>
</template>
