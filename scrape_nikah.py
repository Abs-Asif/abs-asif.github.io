import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

BASE_URL = "https://nikahguard.pages.dev/"
TARGET_DIR = "nikah_scrape"

def download_file(url, target_path):
    try:
        response = requests.get(url)
        response.raise_for_status()
        os.makedirs(os.path.dirname(target_path), exist_ok=True)
        with open(target_path, 'wb') as f:
            f.write(response.content)
        print(f"Downloaded: {url} -> {target_path}")
    except Exception as e:
        print(f"Failed to download {url}: {e}")

def scrape():
    if not os.path.exists(TARGET_DIR):
        os.makedirs(TARGET_DIR)

    response = requests.get(BASE_URL)
    response.raise_for_status()

    with open(os.path.join(TARGET_DIR, "index.html"), 'wb') as f:
        f.write(response.content)

    soup = BeautifulSoup(response.content, 'html.parser')

    # Download assets (scripts, links, images)
    for tag in soup.find_all(['script', 'link', 'img']):
        attr = 'src' if tag.name in ['script', 'img'] else 'href'
        url = tag.get(attr)
        if url:
            full_url = urljoin(BASE_URL, url)
            if urlparse(full_url).netloc == urlparse(BASE_URL).netloc:
                parsed_url = urlparse(full_url)
                local_path = os.path.join(TARGET_DIR, parsed_url.path.lstrip('/'))
                if not local_path.endswith(('/', '.html', '.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.ico')):
                    # Likely a directory or SPA route, skip for now or handle specifically
                    continue
                download_file(full_url, local_path)

if __name__ == "__main__":
    scrape()
