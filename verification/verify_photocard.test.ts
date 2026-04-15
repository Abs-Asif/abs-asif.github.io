import { test, expect } from '@playwright/test';

test('photocard page loads and has required elements', async ({ page }) => {
  await page.goto('http://localhost:8080/p');

  // Check title
  await expect(page.getByText('Quote.Photocard_Generator')).toBeVisible();

  // Check form inputs
  await expect(page.locator('label:has-text("Date (Bangla)")')).toBeVisible();
  await expect(page.locator('label:has-text("Quote")')).toBeVisible();
  await expect(page.locator('label:has-text("Sayer Name")')).toBeVisible();
  await expect(page.locator('label:has-text("Sayer Description")')).toBeVisible();
  await expect(page.getByText('Upload Image')).toBeVisible();

  // Check canvas
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();

  // Take screenshot
  await page.screenshot({ path: 'verification/photocard_page.png' });
});
