import { randomUUID } from 'node:crypto';
import { mkdir } from 'node:fs/promises';

import { test } from '@playwright/test';

export const withScreenshotsOnTestFail = () => {
  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      await mkdir(`playwright-report/screenshots`, { recursive: true });
      const filename = `screenshot-${testInfo.title}-${randomUUID()}.png`;
      const screenshotPath = `playwright-report/screenshots/${filename}`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      await testInfo.attach(filename, { path: screenshotPath });
    }
  });
};
