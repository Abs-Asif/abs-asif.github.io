export const fetchWithProxy = async (target: string): Promise<string | null> => {
  const proxies = [
    // 1. AllOrigins Raw (Fastest for raw text)
    async (u: string) => {
      const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`);
      return res.ok ? await res.text() : null;
    },
    // 2. Codetabs
    async (u: string) => {
      const res = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`);
      return res.ok ? await res.text() : null;
    },
    // 3. Corsproxy.io
    async (u: string) => {
      const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(u)}`);
      return res.ok ? await res.text() : null;
    },
    // 4. AllOrigins JSON (Fallback)
    async (u: string) => {
      const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(u)}&timestamp=${Date.now()}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data?.contents || null;
    }
  ];

  for (const proxy of proxies) {
    try {
      const result = await proxy(target);
      if (result && result.length > 100) return result; // Basic sanity check for HTML content
    } catch (e) {
      console.warn(`Proxy failed for ${target}:`, e);
    }
  }

  return null;
};
