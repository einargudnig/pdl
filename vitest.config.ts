import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, './shared'),
      '@worker': path.resolve(__dirname, './worker'),
    },
  },
  test: {
    environment: 'node',
    include: ['worker/**/*.test.ts', 'shared/**/*.test.ts'],
  },
})
