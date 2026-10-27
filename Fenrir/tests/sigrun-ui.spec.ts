import { test, expect } from '@playwright/test';
import { withScreenshotsOnTestFail } from './utils/screenshots';

withScreenshotsOnTestFail();

for (const [device, width, height] of [
  ['desktop', 1440, 1000],
  ['tablet', 900, 1000],
  ['mobile', 390, 844],
] as const) {
  test(`UI-004: Visitor can navigate Sigrun and retain display preferences on ${device}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    const mobile = width < 1024;
    const scope = mobile ? 'drawer' : 'sidebar';
    const openMenu = async () => {
      if (mobile) {
        await page
          .getByTestId(width < 768 ? 'sigrun-menu-open-mobile' : 'sigrun-menu-open-tablet')
          .click();
        await expect(page.getByTestId('sigrun-menu-drawer').getByRole('dialog')).toBeVisible();
      }
    };

    await page.goto(process.env.SIGRUN_URL!);
    await expect(page).toHaveTitle(/Event list.*Sigrun/);
    await expect(page.locator('head title')).toHaveCount(1);
    await expect(page.locator('head meta[name="description"]')).toHaveCount(1);
    await expect(page.locator('a a')).toHaveCount(0);
    await expect(page.locator('header')).toHaveCSS('background-color', 'rgb(97, 113, 147)');
    await openMenu();
    await page.getByTestId(`sigrun-menu-${scope}-color-scheme`).click();
    await expect(page.locator('html')).toHaveAttribute('data-mantine-color-scheme', 'dark');
    if (mobile)
      await expect(page.getByTestId('sigrun-menu-drawer').getByRole('dialog')).toBeHidden();

    await openMenu();
    await page.getByTestId(`sigrun-menu-${scope}-dimmed-colors`).click();
    const blue = () =>
      page
        .locator('html')
        .evaluate((element) =>
          getComputedStyle(element).getPropertyValue('--mantine-color-blue-6').trim().toLowerCase()
        );
    await expect.poll(blue).toBe('#40678c');
    await page.reload();
    await expect(page).toHaveTitle(/Event list.*Sigrun/);
    await expect(page.locator('html')).toHaveAttribute('data-mantine-color-scheme', 'dark');
    await expect.poll(blue).toBe('#40678c');

    if (mobile) {
      await openMenu();
      await page.keyboard.press('Escape');
      await expect(page.getByTestId('sigrun-menu-drawer').getByRole('dialog')).toBeHidden();
      await expect(
        page.getByTestId(width < 768 ? 'sigrun-menu-open-mobile' : 'sigrun-menu-open-tablet')
      ).toBeFocused();
    }

    await openMenu();
    await page.getByTestId(`sigrun-menu-${scope}-language`).click();
    await page.getByTestId(`sigrun-menu-${scope}-language-ru`).click();
    await expect(page).not.toHaveTitle(/Event list/);
    await openMenu();
    if (mobile) await page.getByTestId(`sigrun-menu-${scope}-language`).click();
    await page.getByTestId(`sigrun-menu-${scope}-language-en`).click();
    await expect(page).toHaveTitle(/Event list.*Sigrun/);
    await expect(page.locator('head title')).toHaveCount(1);
    expect(errors).toEqual([]);
  });
}

for (const width of [375, 900]) {
  test(`UI-005: Visitor can dismiss Sigrun navigation with a left swipe at ${width}px`, async ({
    page,
    context,
  }) => {
    await page.setViewportSize({ width, height: 812 });
    const touch = await context.newCDPSession(page);
    await touch.send('Emulation.setTouchEmulationEnabled', { enabled: true });
    await page.goto(`${process.env.SIGRUN_URL}/filter/TEST`);
    const trigger = page.getByTestId(
      width < 768 ? 'sigrun-menu-open-mobile' : 'sigrun-menu-open-tablet'
    );
    const dialog = page.getByTestId('sigrun-menu-drawer').getByRole('dialog');
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
    await expect(page).toHaveURL(/\/filter\/TEST$/);

    await trigger.click();
    const close = page.getByTestId('sigrun-menu-drawer-close');
    await expect(close).toHaveCSS('width', '44px');
    await expect(close).toHaveCSS('height', '44px');
    await close.click();
    await expect(dialog).toBeHidden();
    await trigger.click();
    await page.getByTestId('sigrun-menu-drawer-events-list').click();
    await expect(page).toHaveURL(/\/$/);
    await expect(dialog).toBeHidden();
  });
}
