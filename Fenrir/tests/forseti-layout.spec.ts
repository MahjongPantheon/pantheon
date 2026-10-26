import { test, expect } from '@playwright/test';
import { withScreenshotsOnTestFail } from './utils/screenshots';

withScreenshotsOnTestFail();

test('UI-003: Visitor can dismiss the narrow-screen drawer with a left swipe', async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const touch = await context.newCDPSession(page);
  await touch.send('Emulation.setTouchEmulationEnabled', { enabled: true });
  await page.goto(`${process.env.FORSETI_URL}/profile/login`);
  const trigger = page.getByTestId('forseti-menu-open-mobile');
  const dialog = page.getByTestId('forseti-menu-drawer').getByRole('dialog');
  await trigger.click();
  await expect(dialog).toBeVisible();
  await expect.poll(async () => Math.round((await dialog.boundingBox())!.x)).toBe(0);

  async function swipe(fromX: number, fromY: number, toX: number, toY: number) {
    await touch.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: fromX, y: fromY }],
    });
    for (let step = 1; step <= 5; step += 1) {
      await touch.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [
          {
            x: fromX + ((toX - fromX) * step) / 5,
            y: fromY + ((toY - fromY) * step) / 5,
          },
        ],
      });
    }
    await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  }

  await swipe(250, 150, 250, 240);
  await expect(dialog).toBeVisible();
  await swipe(120, 150, 250, 150);
  await expect(dialog).toBeVisible();
  await swipe(250, 150, 220, 150);
  await expect(dialog).toBeVisible();
  await swipe(250, 150, 100, 155);
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/\/profile\/login$/);

  await trigger.click();
  await page.getByTestId('forseti-menu-drawer-sign-up').click();
  await expect(page).toHaveURL(/\/profile\/signup$/);
  await expect(dialog).toBeHidden();
});

test('UI-001: Visitor can navigate Forseti at mobile, tablet and desktop widths', async ({
  page,
}) => {
  await page.goto(`${process.env.FORSETI_URL}/profile/login`);
  for (const width of [390, 767, 768, 1023, 1024, 1440]) {
    await test.step(`Navigation at ${width}px`, async () => {
      await page.setViewportSize({ width, height: 900 });
      await expect(page.getByTestId('forseti-login-email')).toBeVisible();
      const header = page.locator('header');
      const footer = page.locator('footer');
      await expect(header).toHaveCSS('height', '44px');
      await expect(footer).toHaveCSS('height', '60px');
      if (width >= 1024) {
        await expect(page.getByTestId('forseti-menu-sidebar-sign-in')).toBeVisible();
        await expect(page.locator('nav')).toHaveCSS('width', '350px');
        await page.getByTestId('forseti-menu-sidebar-sign-up').click();
      } else {
        await expect(page.getByTestId('forseti-menu-sidebar-sign-in')).toBeHidden();
        const trigger = page.getByTestId(
          width < 768 ? 'forseti-menu-open-mobile' : 'forseti-menu-open-tablet'
        );
        await trigger.click();
        await expect(page.getByTestId('forseti-menu-drawer').getByRole('dialog')).toBeVisible();
        await page.getByTestId('forseti-menu-drawer-close').click();
        await expect(page.getByTestId('forseti-menu-drawer').getByRole('dialog')).toBeHidden();
        await trigger.click();
        await page.getByTestId('forseti-menu-drawer-sign-up').click();
        await expect(page.getByTestId('forseti-menu-drawer').getByRole('dialog')).toBeHidden();
      }
      await expect(page.getByTestId('forseti-signup-email')).toBeVisible();
      await expect(page).toHaveURL(/\/profile\/signup$/);
      const bounds = await page.getByTestId('forseti-signup-email').boundingBox();
      expect(bounds!.y).toBeGreaterThanOrEqual(44);
      expect(bounds!.x).toBeGreaterThanOrEqual(width >= 1024 ? 350 : 0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      await page.getByTestId('forseti-signup-go-to-login').click();
    });
  }
});

test('UI-002: Visitor can persist Forseti color scheme and dimmed palette', async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${process.env.FORSETI_URL}/profile/login`);
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-mantine-color-scheme', 'light');
  const blue = () =>
    html.evaluate((element) =>
      getComputedStyle(element).getPropertyValue('--mantine-color-blue-6')
    );
  const originalBlue = await blue();
  await page.getByTestId('forseti-menu-sidebar-color-scheme').click();
  await expect(html).toHaveAttribute('data-mantine-color-scheme', 'dark');
  await page.getByTestId('forseti-menu-sidebar-dimmed-colors').click();
  await expect.poll(blue).not.toBe(originalBlue);
  const dimmedBlue = await blue();
  await page.reload();
  await expect(html).toHaveAttribute('data-mantine-color-scheme', 'dark');
  await expect.poll(blue).toBe(dimmedBlue);
  expect(await context.cookies()).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ name: 'thm', value: 'night' }),
      expect.objectContaining({ name: 'dim', value: '1' }),
    ])
  );
  await page.getByTestId('forseti-menu-sidebar-color-scheme').click();
  await expect(html).toHaveAttribute('data-mantine-color-scheme', 'light');
  await page.getByTestId('forseti-menu-sidebar-dimmed-colors').click();
  await expect.poll(blue).toBe(originalBlue);
  await page.reload();
  await expect(html).toHaveAttribute('data-mantine-color-scheme', 'light');
  await expect.poll(blue).toBe(originalBlue);
  expect(await context.cookies()).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ name: 'thm', value: 'day' }),
      expect.objectContaining({ name: 'dim', value: '0' }),
    ])
  );
});
