import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '*.spec.mjs',
  timeout: 90_000,
  workers: 2,
  use: { browserName: 'chromium', trace: 'retain-on-failure' },
  webServer: [
    {
      command: 'node tests/static-server.mjs --port 4177',
      url: 'http://127.0.0.1:4177/',
    },
    {
      command: 'node tests/static-server.mjs --dir .pages-test --base /PWABuilder/ --port 4176',
      url: 'http://127.0.0.1:4176/PWABuilder/',
    },
  ],
});
