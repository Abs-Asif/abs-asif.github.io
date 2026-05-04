
import { test, expect } from '@playwright/test';

test('letter raw inspection page', async ({ page }) => {
  await page.goto('http://localhost:8080/letter/raw');

  // 1. Verify UI elements
  await expect(page.locator('h1')).toHaveText('Letter Inspector');
  const textarea = page.locator('textarea');
  await expect(textarea).toBeVisible();

  // 2. Test decryption logic
  const testContent = "This is a raw inspection test.";

  await page.goto('http://localhost:8080/letter');
  const editor = page.locator('.tiptap div[contenteditable="true"]');
  await editor.fill(testContent);
  await page.waitForTimeout(1000);
  const encryptedUrl = page.url();

  await page.goto('http://localhost:8080/letter/raw');
  await textarea.fill(encryptedUrl);
  await page.click('text=Check Content');

  // 3. Verify layers and result
  await expect(page.locator('text=Decryption Layers')).toBeVisible();
  // Use a more specific locator to avoid strict mode violation
  await expect(page.locator('div:text("001")').first()).toBeVisible();

  const result = page.locator('.prose');
  await expect(result).toContainText(testContent);

  // 4. Test Clear button
  await page.click('button[title="Clear"]');
  await expect(textarea).toHaveValue('');
  await expect(page.locator('text=Decryption Layers')).not.toBeVisible();
});
