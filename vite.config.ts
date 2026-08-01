import { cloudflare } from '@cloudflare/vite-plugin'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const hmrHost = process.env.VITE_HMR_HOST
const hmrClientPort = Number.parseInt(
  process.env.VITE_HMR_CLIENT_PORT ?? '',
  10,
)

export default defineConfig({
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
    react(),
  ],
})
