import { defineConfig } from '@playwright/test'
import base from './playwright.config'

export default defineConfig({
  ...base,
  testMatch: '**/*.fixture.ts',
  outputDir: 'test-results/reading-fixtures',
  use: { ...base.use, video: 'on', baseURL: 'http://127.0.0.1:4177' },
  webServer: {
    command: 'npx vite --mode browser-test --host 127.0.0.1 --port 4177',
    url: 'http://127.0.0.1:4177',
    reuseExistingServer: false,
    timeout: 60_000,
  },
})
