import { test, expect } from '@playwright/test';

test('portfolio page updates', async ({ page }) => {
  await page.goto('http://localhost:8080');
  await page.screenshot({ path: 'screenshot_before_reveal.png' });

  // 1. Verify profile image size
  const profileImgContainer = page.locator('div.w-64.h-64');
  await expect(profileImgContainer).toBeVisible();

  // 2. Verify sub-header removal
  const subHeader = page.locator('text="Software & Medical Student"');
  await expect(subHeader).not.toBeVisible();

  // 3. Verify contact details
  await expect(page.locator('text="01738745285"')).toBeVisible(); // Primary Contact
  await expect(page.locator('text="01538310838"')).toBeVisible(); // WhatsApp / Call
  await expect(page.locator('text="09638250306"')).toBeVisible(); // IP Call (Backup)

  // 4. Verify email reveal functionality
  const emailButton = page.locator('a:has-text("Email Me")');
  await expect(emailButton).toContainText('Click to reveal address');
  await expect(emailButton).not.toContainText('contact@abdullah.ami.bd');

  await page.waitForTimeout(2000);
  await emailButton.click();
  await page.waitForTimeout(2000);
  await expect(emailButton).toContainText('contact@abdullah.ami.bd');
  await page.screenshot({ path: 'screenshot_after_reveal.png', fullPage: true });
  await expect(emailButton).not.toContainText('Click to reveal address');

  // 5. Verify the redundant WhatsApp button is gone
  // The new WhatsApp button is inside the loop and has text "01538310838"
  // The old one had text "Send WhatsApp Message"
  const oldWhatsAppButton = page.locator('text="Send WhatsApp Message"');
  await expect(oldWhatsAppButton).not.toBeVisible();
});
