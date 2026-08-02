import { cloudflare } from '@cloudflare/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const hmrHost = process.env.VITE_HMR_HOST
const hmrClientPort = Number.parseInt(
  process.env.VITE_HMR_CLIENT_PORT ?? '',
  10,
)

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  environments: {
    ssr: {
      define: {
        // React 19 uses this optional Node API for development stack traces,
        // but workerd currently exposes it as a throwing stub.
        'console.createTask': 'undefined',
      },
      optimizeDeps: {
        esbuildOptions: {
          define: {
            'console.createTask': 'undefined',
          },
        },
      },
    },
  },
  server: {
    allowedHosts: hmrHost ? [hmrHost] : [],
    hmr: hmrHost
      ? {
          host: hmrHost,
          ...(Number.isFinite(hmrClientPort)
            ? { clientPort: hmrClientPort }
            : {}),
          protocol: 'wss',
        }
      : undefined,
  },
  plugins: [
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tanstackStart(),
    tailwindcss(),
    react(),
  ],
})
