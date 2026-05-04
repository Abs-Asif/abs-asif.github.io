
import { test, expect } from '@playwright/test';

test('letter page encryption and font size', async ({ page }) => {
  await page.goto('http://localhost:8080/letter');

  // 1. Verify font size class
  const editor = page.locator('.tiptap div[contenteditable="true"]');
  await expect(editor).toHaveClass(/prose-xl/);
  await expect(editor).toHaveClass(/md:prose-2xl/);

  // 2. Verify container size
  const container = page.locator('div.max-w-5xl.tiptap');
  await expect(container).toBeVisible();

  // 3. Verify encryption prefix
  await editor.fill('Test encryption logic');
  await page.waitForTimeout(2000);

  const url = page.url();
  console.log('Current URL:', url);
  expect(url).toContain('?001');

  // 4. Verify roundtrip (reload and see if text persists)
  await page.reload();
  await expect(editor).toHaveText('Test encryption logic');
});
