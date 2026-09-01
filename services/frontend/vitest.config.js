import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  ...configDefaults,
  test: {
    globals: true,
    environment: 'jsdom',
    exclude: ['./tests/**.*'],
  },
})
