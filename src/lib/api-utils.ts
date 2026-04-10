
export const PROXIES = [
  "https://every-origin-ecru.vercel.app/get?url=",
  "https://api.allorigins.win/raw?url=",
  "https://api.codetabs.com/v1/proxy?quest=",
  "https://corsproxy.io/?",
  "https://api.cors.lol/?url="
];

export const getProxyUrl = (url: string, index?: number) => {
  const proxyBase = index !== undefined ? PROXIES[index % PROXIES.length] : PROXIES[0];
  return `${proxyBase}${encodeURIComponent(url)}`;
};

export const fetchWithProxyFallback = async (url: string, preferredIndices?: number[]) => {
    const indices = preferredIndices || [0, 1, 2, 4];

    for (const i of indices) {
        try {
            const proxiedUrl = getProxyUrl(url, i);
            const response = await fetch(proxiedUrl);
            if (response.ok) {
                const contentType = response.headers.get("content-type") || "";
                let text = "";
                if (contentType.includes("json")) {
                    const data = await response.json();
                    text = data.contents || data.title || "";

                    // Validate if we got actual content or just metadata
                    if (i === 0) {
                        const isXmlUrl = url.includes("feed") || url.includes("xml") || url.includes("sitemap");
                        const looksLikeXml = text.includes("<?xml") || text.includes("<rss") || text.includes("<urlset");
                        if (isXmlUrl && !looksLikeXml) continue; // Skip NEWSOrigin metadata for XML urls
                    }
                } else {
                    text = await response.text();
                }

                if (text && text.length > 50) {
                    return { text, proxyIndex: i };
                }
            }
        } catch (e) {
            // silent fail
        }
    }
    throw new Error(`All proxies failed for ${url}`);
};

export const fetchXmlWithProxy = async (url: string, proxyIndex?: number) => {
  let text = "";
  if (proxyIndex !== undefined) {
      const response = await fetch(getProxyUrl(url, proxyIndex));
      if (response.ok) {
          const contentType = response.headers.get("content-type") || "";
          if (contentType.includes("json")) {
              const data = await response.json();
              text = data.contents || data.title || "";
          } else {
              text = await response.text();
          }
      }
  } else {
      const result = await fetchWithProxyFallback(url);
      text = result.text;
  }

  const parser = new DOMParser();
  const xml = parser.parseFromString(text, "text/xml");
  return xml;
};
