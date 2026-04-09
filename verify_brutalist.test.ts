import { test, expect } from '@playwright/test';

test('verify brutalist inspector', async ({ page }) => {
  await page.goto('http://localhost:8080/Inspector');

  // Desktop view
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'verification/brutalist_desktop.png', fullPage: true });

  // Mobile view
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'verification/brutalist_mobile.png', fullPage: true });
});
