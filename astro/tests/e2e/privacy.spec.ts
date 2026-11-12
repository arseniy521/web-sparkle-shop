import { installApiStub } from '../fixtures/api-stub.ts';
import { expect, test } from '../fixtures/network-guard.ts';
import { PILOT } from '../fixtures/pilot.ts';

test('Privacy policy link of the cookie banner', async ({ page }) => {
  await installApiStub(page);
  await page.goto(PILOT);
  const banner = page.locator('[data-cookie-banner]');
  await expect(banner).toBeVisible();

  await banner.getByRole('link', { name: 'Privacy Policy' }).click();

  await expect(page).toHaveURL(/\/privacy\/$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Privacy Policy' })).toBeVisible();
});
