import { test, expect } from '@playwright/test';

test('verify brutalist inspector page and experimental mode', async ({ page }) => {
  await page.goto('http://localhost:8080/Inspector');

  // Wait for the page to load
  await page.waitForSelector('h1:has-text("Archive_Inspector")');

  // Check if Brutalist elements are present
  const header = page.locator('div.border-4.border-black').first();
  await expect(header).toBeVisible();

  // Activate Experimental Mode
  const experimentalBtn = page.locator('button:has-text("Mode: Experimental")');
  await experimentalBtn.click();

  // Check if experimental inputs appear
  const searchInput = page.locator('input[placeholder="Keyword..."]');
  await expect(searchInput).toBeVisible();

  // Take screenshot of desktop with experimental mode on
  await page.setViewportSize({ width: 1280, height: 1600 });
  await page.screenshot({ path: 'verification/brutalist_experimental.png' });

  // Check formulas
  const formulaBtn = page.locator('button:has-text("Formula: Last 24H")');
  await formulaBtn.click();

  // Verify date inputs updated (approximate check)
  const startDate = await page.inputValue('input[type="date"] >> nth=0');
  expect(startDate).not.toBe('');
});
