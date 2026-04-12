from playwright.sync_api import sync_playwright
import os

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="verification/videos"
        )
        page = context.new_page()
        page.on("console", lambda msg: print(f"Browser console: {msg.text}"))

        try:
            # 1. Navigate to Somoy
            print("Navigating to /somoy...")
            page.goto("http://localhost:8080/somoy")

            page.wait_for_timeout(5000) # Wait for initial fetch

            # 2. Verify Somoy Page Content
            print("Verifying Somoy page...")
            page.screenshot(path="verification/screenshots/somoy_initial.png")

            # Click Execute_Fetch
            print("Clicking Execute_Fetch...")
            page.get_by_role("button", name="Execute_Fetch").click()
            page.wait_for_timeout(5000)

            # 3. Final Screenshot
            page.screenshot(path="verification/screenshots/somoy_final.png")
            print("Verification complete.")

        finally:
            context.close()
            browser.close()

if __name__ == "__main__":
    run_verification()
