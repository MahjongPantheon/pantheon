import { test, expect } from '@playwright/test';

test('Opens assistant', async ({ page }) => {
  await page.goto(process.env.TYR_URL!);
  await expect(page).toHaveTitle(/Tyr/);
});

test('Opens rating', async ({ page }) => {
  await page.goto(process.env.SIGRUN_URL!);
  await expect(page).toHaveTitle(/Sigrun/);
});

test('Opens admin panel', async ({ page }) => {
  await page.goto(process.env.FORSETI_URL!);
  await expect(page).toHaveTitle(/Forseti/);
});
