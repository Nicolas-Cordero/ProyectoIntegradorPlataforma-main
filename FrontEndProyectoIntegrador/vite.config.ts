import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  esbuild: {
    ignoreAnnotations: true,
  },
  server: {
    open: true, // Esto abrirá automáticamente el navegador
    port: 5173,
    host: 'localhost'
  }
})
