import { defineConfig as defineViteConfig, mergeConfig } from 'vite'
import { defineConfig as defineVitestConfig } from 'vitest/config'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const viteConfig = defineViteConfig({
  plugins: [react(), tailwindcss()],
  esbuild: {
    ignoreAnnotations: true,
  },
  server: {
    open: true,
    port: 5173,
    host: 'localhost',
  },
})

export default mergeConfig(
  viteConfig,
  defineVitestConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
    },
  }),
)