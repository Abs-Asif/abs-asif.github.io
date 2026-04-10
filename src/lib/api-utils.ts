
export const PROXIES = [
  "https://api.allorigins.win/raw?url=",
  "https://api.codetabs.com/v1/proxy?quest=",
  "https://corsproxy.io/?",
  "https://win98icon.xyz/proxy?url=", // Example of a custom or another public one if exists
  "https://api.cors.lol/?url="
];

export const getProxyUrl = (url: string, index?: number) => {
  const proxyBase = index !== undefined ? PROXIES[index % PROXIES.length] : PROXIES[Math.floor(Math.random() * PROXIES.length)];
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
  const text = await response.text();
  const parser = new DOMParser();
  const xml = parser.parseFromString(text, "text/xml");
  return xml;
};
