import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import stylex from '@stylexswc/unplugin/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'

const rootDir = import.meta.dirname

// The Cloudflare plugin is injected by `Cloudflare.Website.Vite` in
// alchemy.run.ts — do not add it here. `alchemy dev` runs this config
// against the real workerd runtime with a local D1.
export default defineConfig({
  resolve: {
    alias: {
      '@shared': path.resolve(rootDir, './shared'),
      '@worker': path.resolve(rootDir, './worker'),
    },
  },
  plugins: [
    react(),
    stylex({
      rsOptions: {
        dev: process.env.NODE_ENV !== 'production',
        unstable_moduleResolution: { type: 'commonJS', rootDir },
        include: ['src/**/*.{ts,tsx}'],
      },
      // Emits into the `@stylex;` marker in src/index.css instead of a
      // virtual module, so StyleX output goes through Vite's CSS pipeline.
      useCssPlaceholder: true,
      useCSSLayers: true,
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
