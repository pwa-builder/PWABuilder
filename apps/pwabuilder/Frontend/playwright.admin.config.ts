import { defineConfig, devices } from '@playwright/test';

// A local-only server and mocked MSAL/API boundary: never signs into Entra.
export default defineConfig({
  testDir: './tests',
  testMatch: 'support-admin.spec.ts',
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:5178', trace: 'off' },
  projects: [{
    name: 'chromium',
    use: { ...devices['Desktop Chrome'], channel: process.env.PLAYWRIGHT_CHANNEL },
  }],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5178 --strictPort',
    url: 'http://127.0.0.1:5178/admin.html',
    reuseExistingServer: false,
  },
});
