import { defineConfig } from '@playwright/test'
import base from './playwright.config'

export default defineConfig({
  ...base,
  testMatch: '**/operations.owner.ts',
  outputDir: 'test-results/owner',
  use: { ...base.use, baseURL: 'http://127.0.0.1:4179' },
  webServer: {
    command:
      'npx vite --config e2e/owner/vite.config.ts --host 127.0.0.1 --port 4179',
    url: 'http://127.0.0.1:4179/e2e/owner/index.html',
    reuseExistingServer: false,
    timeout: 60_000,
  },
})
