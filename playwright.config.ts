import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  use: {
    baseURL: 'http://127.0.0.1:4318',
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    trace: 'retain-on-failure',
  },
  webServer: [
    { command: 'node tests/fixtures/api-server.mjs', port: 4319 },
    {
      command: 'node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 4318',
      url: 'http://127.0.0.1:4318/login',
      env: { API_BASE_URL: 'http://127.0.0.1:4319/api' },
      timeout: 120_000,
    },
  ],
})
