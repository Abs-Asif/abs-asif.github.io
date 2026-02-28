import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        # Desktop context
        desktop_context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await desktop_context.new_page()

        # Dashboard
        await page.goto("http://localhost:8081/dashboard")

        # Check Templates Tab
        await page.click("button:has-text('Templates')")
        await asyncio.sleep(2)
        await page.screenshot(path="/home/jules/verification/templates_v2.png")

        # Check Settings Tab
        await page.click("button:has-text('Settings')")
        await asyncio.sleep(1)
        await page.screenshot(path="/home/jules/verification/settings_v2.png")

        # Mobile context
        mobile_context = await browser.new_context(viewport={'width': 375, 'height': 667})
        mobile_page = await mobile_context.new_page()
        await mobile_page.goto("http://localhost:8081/dashboard")
        await mobile_page.screenshot(path="/home/jules/verification/mobile_dashboard.png")

        # Open Hamburger
        await mobile_page.click("button:has(.lucide-menu)")
        await asyncio.sleep(1)
        await mobile_page.screenshot(path="/home/jules/verification/mobile_menu.png")

        await browser.close()

if __name__ == "__main__":
    if not os.path.exists("/home/jules/verification"):
        os.makedirs("/home/jules/verification")
    asyncio.run(main())
