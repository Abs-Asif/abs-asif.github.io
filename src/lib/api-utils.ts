/**
 * Core utility for API fetching and CORS proxying.
 */

const ISLAMIC_API_KEY = import.meta.env.VITE_ISLAMIC_API_KEY || "J8NkVS5dXdS0IzzbXDI0mL0sAkJHo0aj44jdm0Kh4fTdg699";
const ISLAMIC_BASE_URL = "https://islamicapi.com/api/v1/prayer-time/";
const NHENTAI_BASE_URL = "https://nhentai.net/api";
const NHENTAI_IMAGE_URL = "https://i.nhentai.net/galleries";

const PROXIES = [
  "https://api.allorigins.win/raw?url=",
  "https://api.codetabs.com/v1/proxy?quest=",
  "https://corsproxy.io/?"
];

let currentProxyIndex = 0;

export async function fetchWithProxy(url: string) {
  const proxy = PROXIES[currentProxyIndex];
  try {
    const response = await fetch(`${proxy}${encodeURIComponent(url)}`);
    if (!response.ok) throw new Error("Proxy failed");
    return response;
  } catch (error) {
    // Rotate proxy on failure
    currentProxyIndex = (currentProxyIndex + 1) % PROXIES.length;
    const nextProxy = PROXIES[currentProxyIndex];
    const response = await fetch(`${nextProxy}${encodeURIComponent(url)}`);
    if (!response.ok) throw new Error("All proxies failed");
    return response;
  }
}

export async function fetchIslamicPrayerTimes(lat: number, lon: number, method: number = 3, school: number = 1) {
  const url = `${ISLAMIC_BASE_URL}?lat=${lat}&lon=${lon}&method=${method}&school=${school}&api_key=${ISLAMIC_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Islamic API failed");
  }
  return response.json();
}

export async function fetchNHentaiSearch(query: string, page: number = 1) {
  const url = `${NHENTAI_BASE_URL}/galleries/search?query=${encodeURIComponent(query)}&page=${page}`;
  const response = await fetchWithProxy(url);
  return response.json();
}

export async function fetchNHentaiGallery(id: string) {
  const url = `${NHENTAI_BASE_URL}/gallery/${id}`;
  const response = await fetchWithProxy(url);
  return response.json();
}

export function getNHentaiImageUrl(mediaId: string, page: number, ext: string = 'j') {
  const extension = ext === 'p' ? 'png' : ext === 'g' ? 'gif' : 'jpg';
  return `${NHENTAI_IMAGE_URL}/${mediaId}/${page}.${extension}`;
}
