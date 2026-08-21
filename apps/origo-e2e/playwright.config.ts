import { defineConfig, devices } from '@playwright/test';
import { workspaceRoot } from '@nx/devkit';
import { join } from 'path';

// Playwright v1.36.0 configuration for Origo E2E Integration Suite
export default defineConfig({
  testDir: join(workspaceRoot || process.cwd(), 'apps/origo-e2e/src/e2e'),
  fullyParallel: false, // Serial worker execution to prevent temp directory state collisions
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // WebServer block: Spins up local HTTP server for Playground assertions.
  // Note: Currently uses a lightweight HTTP mock server for baseline E2E verification.
  // Full Playground adapter integration is scheduled for Epic 7.
  webServer: {
    command:
      "node -e \"require('http').createServer((req, res) => { res.writeHead(200, {'Content-Type': 'text/html'}); res.end('<title>Origo Playground</title><body>UserAccount</body>'); }).listen(4200)\"",
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
    timeout: 10 * 1000,
  },
});
