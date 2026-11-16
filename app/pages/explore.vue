<script setup lang="ts">
import {
  Compass,
  Search,
  FileCode,
  Clock,
  Eye,
  Copy,
  Check,
  Terminal,
  ExternalLink,
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const searchQuery = ref('')
const debouncedSearch = ref('')
let timer: any = null

function onSearchInput() {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    debouncedSearch.value = searchQuery.value.trim()
  }, 250)
}

const { data, pending, refresh } = await useFetch<any>('/api/pastes', {
  query: {
    q: debouncedSearch,
  },
  watch: [debouncedSearch],
})

const copiedId = ref<string | null>(null)

async function copySnippet(id: string, slug: string) {
  try {
    const raw = await $fetch<string>(`/raw/${slug}`)
    await navigator.clipboard.writeText(raw)
    copiedId.value = id
    toast.success('Snippet raw content copied!')
    setTimeout(() => { copiedId.value = null }, 2000)
  } catch {
    toast.error('Failed to copy snippet')
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header & Search -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div class="flex items-center gap-2">
          <Compass class="h-6 w-6 text-primary" />
          <h1 class="text-2xl font-bold tracking-tight">Explore Public Snippets</h1>
        </div>
        <p class="text-xs text-muted-foreground mt-0.5">
          Browse publicly shared code snippets, configuration files, and pastes.
        </p>
      </div>

      <!-- Search Input -->
      <div class="relative w-full sm:w-72">
        <Search class="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <UiInput
          v-model="searchQuery"
          @input="onSearchInput"
          placeholder="Search snippets..."
          class="h-9 pl-9 text-xs"
        />
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="pending && !data" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UiSkeleton v-for="i in 6" :key="i" class="h-44 w-full rounded-xl" />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!data?.items?.length"
      class="rounded-xl border border-dashed p-12 text-center text-muted-foreground"
    >
      <FileCode class="mx-auto h-10 w-10 opacity-40 mb-3" />
      <h3 class="text-sm font-semibold">No public snippets found</h3>
      <p class="text-xs mt-1">Be the first to publish a public paste or try another search.</p>
      <NuxtLink to="/">
        <UiButton size="sm" class="mt-4 text-xs">
          Create New Snippet
        </UiButton>
      </NuxtLink>
    </div>

    <!-- Snippets Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UiCard
        v-for="item in data.items"
        :key="item.id"
        class="flex flex-col justify-between p-4 transition-all hover:border-primary/50 hover:shadow-xs group"
      >
        <div class="space-y-2">
          <div class="flex items-start justify-between gap-2">
            <NuxtLink :to="`/${item.slug}`" class="font-semibold text-sm hover:underline line-clamp-1">
              {{ item.title || item.slug }}
            </NuxtLink>
            <UiBadge variant="secondary" class="text-[10px] font-mono shrink-0">
              {{ item.filesCount }} file{{ item.filesCount > 1 ? 's' : '' }}
            </UiBadge>
          </div>

          <p v-if="item.description" class="text-xs text-muted-foreground line-clamp-2">
            {{ item.description }}
          </p>

          <!-- Files and languages preview tags -->
          <div class="flex flex-wrap gap-1.5 pt-1">
            <UiBadge
              v-for="f in item.files.slice(0, 3)"
              :key="f.id"
              variant="outline"
              class="text-[10px] font-mono px-1.5 py-0"
            >
              {{ f.syntax }}
            </UiBadge>
            <span v-if="item.files.length > 3" class="text-[10px] text-muted-foreground font-mono self-center">
              +{{ item.files.length - 3 }} more
            </span>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground font-mono">
          <div class="flex items-center gap-2 text-[11px]">
            <span class="flex items-center gap-1">
              <Clock class="h-3 w-3" />
              <span>{{ new Date(item.createdAt).toLocaleDateString() }}</span>
            </span>
            <span>&bull;</span>
            <span class="flex items-center gap-1">
              <Eye class="h-3 w-3" />
              <span>{{ item.viewCount }}</span>
            </span>
          </div>

          <div class="flex items-center gap-1">
            <UiButton
              variant="ghost"
              size="icon"
              class="h-7 w-7"
              @click.stop="copySnippet(item.id, item.slug)"
              title="Copy raw"
            >
              <Check v-if="copiedId === item.id" class="h-3.5 w-3.5 text-green-500" />
              <Copy v-else class="h-3.5 w-3.5" />
            </UiButton>

            <NuxtLink :to="`/raw/${item.slug}`" target="_blank" title="Raw view">
              <UiButton variant="ghost" size="icon" class="h-7 w-7">
                <Terminal class="h-3.5 w-3.5" />
              </UiButton>
            </NuxtLink>

            <NuxtLink :to="`/${item.slug}`">
              <UiButton variant="ghost" size="icon" class="h-7 w-7">
                <ExternalLink class="h-3.5 w-3.5" />
              </UiButton>
            </NuxtLink>
          </div>
        </div>
      </UiCard>
    </div>
  </div>
</template>
