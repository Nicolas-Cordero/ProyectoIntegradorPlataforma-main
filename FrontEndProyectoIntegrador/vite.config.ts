import { defineConfig as defineViteConfig, mergeConfig, loadEnv } from 'vite'
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

const vitestConfig = defineVitestConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})

export default defineViteConfig(({ command, mode }) => {
  // Vite incrusta VITE_API_URL en el bundle en tiempo de compilación. Compilar
  // sin ella genera un frontend que apunta a localhost: falla en el navegador
  // del usuario y no deja ninguna huella en los logs del servidor. Romper el
  // build aquí es preferible a descubrirlo en producción.
  if (command === 'build') {
    const env = loadEnv(mode, '.', 'VITE_')
    if (!env.VITE_API_URL) {
      throw new Error(
        'VITE_API_URL no está definida. Configúrala en el entorno de build ' +
          '(.env, .env.production o las variables del proveedor de despliegue) ' +
          'antes de compilar.',
      )
    }
  }

  return mergeConfig(viteConfig, vitestConfig)
})