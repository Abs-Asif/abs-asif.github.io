export interface BGArchiveItem {
  ContentID: number;
  Slug: string;
  ContentHeading: string;
  ImageBgPath: string;
  create_date?: string;
}

export const BG_API_ARCHIVE_URL = "https://backoffice.daily-bangladesh.com/api/archive";
export const BG_SITEMAP_URL = "https://www.daily-bangladesh.com/news-sitemap.xml";

export const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 8000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
};

export const fetchImageWithProxy = async (url: string, forceProxy: boolean = false): Promise<string> => {
  const proxies = [
    (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
    (u: string) => `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(u)}`,
    (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
    (u: string) => `https://thingproxy.freeboard.io/fetch/${u}`,
    (u: string) => `https://cors-anywhere.herokuapp.com/${u}`
  ];
  if (!forceProxy) {
    try {
      const res = await fetchWithTimeout(url, { mode: 'cors' });
      if (res.ok) return URL.createObjectURL(await res.blob());
    } catch {
      // Fallback
    }
  }
  for (const p of proxies) {
    try {
      const res = await fetchWithTimeout(p(url));
      if (res.ok) return URL.createObjectURL(await res.blob());
    } catch {
      // Fallback
    }
  }
  throw new Error("Failed to load image");
};

export const getMetadata = async (targetUrl: string, forceProxy: boolean = false) => {
  let html = '';
  if (!forceProxy) {
    try {
      const response = await fetchWithTimeout(targetUrl);
      if (response.ok) html = await response.text();
    } catch (e) {
      // Fallback
    }
  }
  if (!html) {
    const proxies = [
      { url: (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`, type: 'text' },
      { url: (u: string) => `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(u)}`, type: 'text' },
      { url: (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`, type: 'text' },
      { url: (u: string) => `https://thingproxy.freeboard.io/fetch/${u}`, type: 'text' },
      { url: (u: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`, type: 'json' }
    ];
    for (const proxy of proxies) {
      try {
        const response = await fetchWithTimeout(proxy.url(targetUrl));
        if (response.ok) {
          html = proxy.type === 'json' ? (await response.json()).contents : await response.text();
          if (html && (html.includes('<title>') || html.includes('og:title'))) break;
        }
      } catch (e) {
        // Fallback
      }
    }
  }
  if (!html) return null;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return {
    title: doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || doc.querySelector('title')?.textContent || '',
    image: doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content') || '',
    publishDate: doc.querySelector('meta[property="article:published_time"]')?.getAttribute('content') || doc.querySelector('meta[name="publish-date"]')?.getAttribute('content') || ''
  };
};

export const getRelativeDateStr = (date: Date) => {
  const diffDays = Math.floor((new Date().setHours(0,0,0,0) - new Date(date).setHours(0,0,0,0)) / 86400000);
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  return diffDays < 7 ? `${diffDays} days ago` : diffDays === 7 ? 'A week ago' : `${Math.floor(diffDays/7)} weeks ago`;
};

export const formatSitemapTime = (isoStr: string) => {
  try {
    const date = new Date(isoStr);
    if (isNaN(date.getTime())) return isoStr;
    const h = date.getHours(), m = date.getMinutes().toString().padStart(2, '0'), ampm = h >= 12 ? 'PM' : 'AM';
    return `[${h%12||12}:${m} ${ampm}] [${getRelativeDateStr(date)}]`;
  } catch (e) { return ''; }
};

export const scrapeLatestLinks = async (fetchLimit: number = 3) => {
  try {
    const response = await fetch(BG_API_ARCHIVE_URL, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ start_date: "", end_date: "", category_name: "", limit: fetchLimit, offset: 0 })
    });
    if (!response.ok) throw new Error("API connection failed");
    const data = await response.json();
    return (data.archive_data || []).map((item: BGArchiveItem) => ({
      url: `https://www.daily-bangladesh.com/${item.Slug}/${item.ContentID}`,
      title: item.ContentHeading,
      image: item.ImageBgPath.startsWith('http') ? item.ImageBgPath : `https://backoffice.daily-bangladesh.com/media/imgAll/${item.ImageBgPath}`,
      postTime: item.create_date ? formatSitemapTime(item.create_date) : '',
      contentId: item.ContentID
    }));
  } catch (e) { return null; }
};

export const parseSitemapXml = (xmlText: string) => {
  const items: Array<{ url: string; title: string; image: string; postTime: string; contentId: number }> = [];

  try {
    if (typeof DOMParser !== 'undefined') {
      const xmlDoc = new DOMParser().parseFromString(xmlText, "text/xml");
      const urlNodes = Array.from(xmlDoc.getElementsByTagName("url"));
      for (const node of urlNodes) {
        const loc = (
          node.getElementsByTagName("loc")[0]?.textContent ||
          node.getElementsByTagNameNS("*", "loc")[0]?.textContent ||
          ""
        ).trim();

        const title = (
          node.getElementsByTagName("news:title")[0]?.textContent ||
          node.getElementsByTagName("title")[0]?.textContent ||
          node.getElementsByTagName("image:title")[0]?.textContent ||
          node.getElementsByTagNameNS("*", "title")[0]?.textContent ||
          ""
        ).trim();

        const image = (
          node.getElementsByTagName("image:loc")[0]?.textContent ||
          node.getElementsByTagNameNS("*", "loc")[1]?.textContent ||
          ""
        ).trim();

        const rawDate = (
          node.getElementsByTagName("news:publication_date")[0]?.textContent ||
          node.getElementsByTagName("lastmod")[0]?.textContent ||
          node.getElementsByTagNameNS("*", "publication_date")[0]?.textContent ||
          ""
        ).trim();

        if (loc) {
          const contentId = parseInt(loc.replace(/\/$/, '').split('/').pop() || '0', 10);
          items.push({
            url: loc,
            title,
            image,
            postTime: rawDate ? formatSitemapTime(rawDate) : '',
            contentId
          });
        }
      }
    }
  } catch (e) {
    // Fallback
  }

  if (items.length === 0) {
    const urlBlocks = xmlText.split(/<url>/i).slice(1);
    for (const block of urlBlocks) {
      const locMatch = block.match(/<loc>(.*?)<\/loc>/i);
      const titleMatch = block.match(/<news:title>(.*?)<\/news:title>/i) || block.match(/<title>(.*?)<\/title>/i) || block.match(/<image:title>(.*?)<\/image:title>/i);
      const imageMatch = block.match(/<image:loc>(.*?)<\/image:loc>/i);
      const dateMatch = block.match(/<news:publication_date>(.*?)<\/news:publication_date>/i) || block.match(/<lastmod>(.*?)<\/lastmod>/i);

      const loc = locMatch ? locMatch[1].trim() : '';
      const title = titleMatch ? titleMatch[1].trim() : '';
      const image = imageMatch ? imageMatch[1].trim() : '';
      const rawDate = dateMatch ? dateMatch[1].trim() : '';

      if (loc) {
        const contentId = parseInt(loc.replace(/\/$/, '').split('/').pop() || '0', 10);
        items.push({
          url: loc,
          title,
          image,
          postTime: rawDate ? formatSitemapTime(rawDate) : '',
          contentId
        });
      }
    }
  }

  return items.filter(i => i.url);
};

export const scrapeSitemapLinks = async () => {
  try {
    let xmlText = '';
    try {
      const res = await fetchWithTimeout(BG_SITEMAP_URL, {}, 8000);
      if (res.ok) xmlText = await res.text();
    } catch (e) {
      // Ignored
    }

    if (!xmlText) {
      const proxies = [
        (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
        (u: string) => `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(u)}`,
        (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
        (u: string) => `https://thingproxy.freeboard.io/fetch/${u}`,
        (u: string) => `https://cors-anywhere.herokuapp.com/${u}`
      ];
      for (const p of proxies) {
        try {
          const res = await fetchWithTimeout(p(BG_SITEMAP_URL), {}, 8000);
          if (res.ok) {
            xmlText = await res.text();
            if (xmlText && xmlText.includes('<url>')) break;
          }
        } catch (e) {
          // Ignored
        }
      }
    }

    if (!xmlText) {
      try {
        const res = await fetchWithTimeout(`https://api.allorigins.win/get?url=${encodeURIComponent(BG_SITEMAP_URL)}`, {}, 8000);
        if (res.ok) {
          const json = await res.json();
          xmlText = json.contents || '';
        }
      } catch (e) {
        // Ignored
      }
    }

    if (!xmlText) return null;

    const items = parseSitemapXml(xmlText);
    return items.length > 0 ? items : null;
  } catch (e) { return null; }
};
