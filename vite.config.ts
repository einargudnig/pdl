import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'

export default defineConfig({
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, './shared'),
      '@worker': path.resolve(__dirname, './worker'),
    },
  },
  plugins: [
    react(),
    devServer({
      entry: 'worker/index.ts',
      adapter,
      exclude: [
        /^\/@.+$/,
        /.*\.(ts|tsx|jsx|css|svg|png|ico)(\?.*)?$/,
        /^\/favicon\.ico$/,
        /^\/(public|assets|static)\/.+/,
        /^\/node_modules\/.*/,
        /^\/src\/.+/,
        /^\/$/,
        /^\/index\.html$/,
      ],
      injectClientScript: false,
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      devOptions: { enabled: false },
      workbox: {
        // Never let the SPA fallback swallow API calls.
        navigateFallbackDenylist: [/^\/api\//],
      },
      manifest: {
        name: 'pdl',
        short_name: 'pdl',
        description: 'Padel scores for the crew',
        theme_color: '#0b0b0f',
        background_color: '#0b0b0f',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
})
