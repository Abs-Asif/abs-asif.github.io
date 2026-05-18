import { test, expect } from '@playwright/test';

test('Banglish Converter page renders and has basic functionality', async ({ page }) => {
  await page.goto('http://localhost:8080/tools/banglish-conv');

  // Check title
  await expect(page.getByText('Banglish Converter', { exact: true })).toBeVisible();
  await expect(page.getByText('বাংলায় রূপান্তর করুন')).toBeVisible();

  // Check for input area
  const textarea = page.locator('textarea');
  await expect(textarea).toBeVisible();
  await expect(textarea).toHaveAttribute('placeholder', /Enter Banglish text here/);

  // Check for convert button
  const convertBtn = page.getByRole('button', { name: /Convert to Bangla/i });
  await expect(convertBtn).toBeVisible();
  await expect(convertBtn).toBeDisabled();

  // Type some text and check if button is enabled
  await textarea.fill('ami bhalo achi');
  await expect(convertBtn).not.toBeDisabled();
});
