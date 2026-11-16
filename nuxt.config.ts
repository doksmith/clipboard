import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  future: {
    compatibilityVersion: 4,
  },
  css: ['~/assets/css/tailwind.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  modules: [
    '@nuxtjs/color-mode',
    'shadcn-nuxt',
  ],
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'dark',
  },
  shadcn: {
    prefix: 'Ui',
    componentDir: '@/components/ui',
  },
  nitro: {
    experimental: {
      websocket: true,
      tasks: true,
    },
  },
})
