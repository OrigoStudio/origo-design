import { test, expect } from '@playwright/test';
import { CLIWrapper } from '../utils/cli-wrapper';
import {
  setupTestEnvironment,
  teardownTestEnvironment,
  TMP_PROJECT_DIR,
} from '../utils/setup-teardown';
import { existsSync } from 'fs';
import { join } from 'path';

test.describe('End-to-End CLI to Playground Workflow', () => {
  let cli: CLIWrapper;

  test.beforeAll(async () => {
    // Scaffold test environment
    await setupTestEnvironment(TMP_PROJECT_DIR);
    cli = new CLIWrapper(TMP_PROJECT_DIR);
  });

  test.afterAll(async () => {
    await teardownTestEnvironment(TMP_PROJECT_DIR);
  });

  test('should complete the full origo quickstart workflow', async ({ page }) => {
    // Step 1: Initialize the project
    await test.step('Initialize Project', async () => {
      const initOutput = cli.init('my-project');
      expect(initOutput).toContain('Successfully initialized');
      // Assert origo.config.json configuration file is created as specified in docs
      expect(existsSync(join(TMP_PROJECT_DIR, 'my-project', 'origo.config.json'))).toBeTruthy();
    });

    // Step 2: Generate an entity
    await test.step('Generate Entity', async () => {
      const generateOutput = cli.generateEntity('UserAccount');
      expect(generateOutput).toContain('UserAccount');
      // Assert entity schema file was created
      expect(existsSync(join(TMP_PROJECT_DIR, 'entities', 'user-account.json'))).toBeTruthy();
    });

    // Step 3: Validate the configuration
    await test.step('Validate Configuration', async () => {
      const validateOutput = cli.validate();
      expect(validateOutput).toContain('Validation successful');
    });

    // Step 4: Web Assertion - Browser Playground Verification
    await test.step('Verify Playground Rendering', async () => {
      // The Playground is served at localhost:4200 (configured in playwright.config.ts)
      await page.goto('/');

      // Assert that the playground loaded
      await expect(page).toHaveTitle(/Origo Playground/);

      // Check that the generated 'UserAccount' entity is visible in the UI
      const entityItem = page.locator('text=UserAccount');
      await expect(entityItem).toBeVisible();
    });
  });
});
