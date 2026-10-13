import { test, expect } from '@playwright/test';
import { withScreenshotsOnTestFail } from './utils/screenshots';

withScreenshotsOnTestFail();

test('SMOKE-002: Visitor can open Tyr', async ({ page }) => {
  await page.goto(process.env.TYR_URL!);
  await expect(page).toHaveTitle(/Tyr/);
});

test('SMOKE-001: Visitor can open Sigrun', async ({ page }) => {
  await page.goto(process.env.SIGRUN_URL!);
  await expect(page).toHaveTitle(/Sigrun/);
});

test('SMOKE-003: Visitor can open Forseti', async ({ page }) => {
  await page.goto(process.env.FORSETI_URL!);
  await expect(page).toHaveTitle(/Forseti/);
});
