import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    watch: false,
    include: ['**/*.pw.test.tsx'],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({
        connectOptions: {
          wsEndpoint: 'ws://host.docker.internal:6677/',
          exposeNetwork: '<loopback>',
        },
      }),
      instances: [
        {
          browser: 'chromium',
        },
      ],
    },
  },
})
