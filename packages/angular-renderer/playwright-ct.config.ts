import { resolve } from 'path';
import angular from '@analogjs/vite-plugin-angular';
import { defineConfig, devices } from '@playwright/experimental-ct-angular';

const tsconfigPath = resolve(__dirname, 'tsconfig.pw.json');
if (!require('fs').existsSync(tsconfigPath)) {
  throw new Error('tsconfig.pw.json not found at ' + tsconfigPath);
}

export default defineConfig({
  testDir: './src',
  testMatch: /.*\.pw\.ts/,
  snapshotDir: './__snapshots__',
  timeout: 30 * 1000,
  fullyParallel: !process.env['CI'],
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: 'html',
  use: {
    ctViteConfig: {
      plugins: [angular({ tsconfig: tsconfigPath })],
    },
    trace: 'on-first-retry',
    ctPort: 3100,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
