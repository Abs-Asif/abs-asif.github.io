
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

export const fetchWithProxy = async (url: string, proxyIndex?: number) => {
  const proxiedUrl = getProxyUrl(url, proxyIndex);
  const response = await fetch(proxiedUrl);
  if (!response.ok) throw new Error(`Failed to fetch from proxy: ${response.statusText}`);
  return response;
};

export const fetchXmlWithProxy = async (url: string, proxyIndex?: number) => {
  const response = await fetchWithProxy(url, proxyIndex);
  const contentType = response.headers.get("content-type") || "";
  let text = "";

  if (contentType.includes("json")) {
      const data = await response.json();
      // Handle NEWSOrigin or AllOrigins JSON wrappers
      text = data.contents || data.title || "";
  } else {
      text = await response.text();
  }

  const parser = new DOMParser();
  const xml = parser.parseFromString(text, "text/xml");
  return xml;
};
