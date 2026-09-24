import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  parseSitemapXml,
  formatSitemapTime,
  BG_API_ARCHIVE_URL,
  getTodaySitemapUrl,
  scrapeLatestLinks,
  fetchImageWithProxy,
  getMetadata
} from '../api';

describe('API & Sitemap utilities', () => {
  it('should have correct API archive URL and today sitemap URL generator', () => {
    expect(BG_API_ARCHIVE_URL).toBe('https://backoffice.channel24bd.tv/api/archive');
    const sitemapUrl = getTodaySitemapUrl();
    expect(sitemapUrl).toContain('https://www.channel24bd.tv/sitemap/sitemap-daily-');
  });

  describe('parseSitemapXml', () => {
    it('should correctly parse news-sitemap XML structure', () => {
      const xmlSample = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://www.channel24bd.tv/countries/article/349045/test-article-slug</loc>
    <image:image>
      <image:loc>https://backoffice.channel24bd.tv/media/imgAll/2026September/sample.jpg</image:loc>
      <image:caption><![CDATA[ Test Headline Title ]]></image:caption>
    </image:image>
    <lastmod>2026-09-23T18:04:15.000Z</lastmod>
  </url>
</urlset>`;

      const items = parseSitemapXml(xmlSample);
      expect(items).toHaveLength(1);
      expect(items[0].url).toBe('https://www.channel24bd.tv/countries/article/349045/test-article-slug');
      expect(items[0].title).toBe('Test Headline Title');
      expect(items[0].image).toBe('https://backoffice.channel24bd.tv/media/imgAll/2026September/sample.jpg');
      expect(items[0].contentId).toBe(349045);
    });

    it('should parse sitemap XML with regex fallback if DOMParser fails or is unavailable', () => {
      const xmlSample = `<urlset>
  <url>
    <loc>https://www.channel24bd.tv/international/article/123456/sample-title</loc>
    <image:caption>Sample Article Title</image:caption>
    <image:loc>https://backoffice.channel24bd.tv/media/imgAll/sample.jpg</image:loc>
    <lastmod>2026-09-14T20:00:00+00:00</lastmod>
  </url>
</urlset>`;

      const items = parseSitemapXml(xmlSample);
      expect(items).toHaveLength(1);
      expect(items[0].contentId).toBe(123456);
      expect(items[0].title).toBe('Sample Article Title');
      expect(items[0].image).toBe('https://backoffice.channel24bd.tv/media/imgAll/sample.jpg');
    });
  });

  describe('formatSitemapTime', () => {
    it('should format ISO timestamp into readable time string', () => {
      const formatted = formatSitemapTime('2026-09-14T20:25:00+00:00');
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });
  });

  describe('fetchImageWithProxy and getMetadata with proxies', () => {
    beforeEach(() => {
      vi.stubGlobal('fetch', vi.fn());
      if (!URL.createObjectURL) {
        URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/mock-blob');
      } else {
        vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:http://localhost/mock-blob');
      }
    });

    afterEach(() => {
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
    });

    it('should return blob or data URLs directly', async () => {
      const blobUrl = 'blob:http://localhost/123';
      const dataUrl = 'data:image/png;base64,xyz';
      expect(await fetchImageWithProxy(blobUrl)).toBe(blobUrl);
      expect(await fetchImageWithProxy(dataUrl)).toBe(dataUrl);
    });

    it('should fallback to proxy when direct image fetch fails', async () => {
      const imageUrl = 'https://backoffice.channel24bd.tv/media/imgAll/sample.jpg';
      const mockBlob = new Blob(['fake image content'], { type: 'image/jpeg' });

      (global.fetch as any)
        .mockRejectedValueOnce(new TypeError('Failed to fetch (CORS block)'))
        .mockResolvedValueOnce({
          ok: true,
          blob: async () => mockBlob
        });

      const result = await fetchImageWithProxy(imageUrl);
      expect(result).toBe('blob:http://localhost/mock-blob');
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect((global.fetch as any).mock.calls[1][0]).toContain('wsrv.nl');
    });

    it('should fallback to proxy when direct metadata fetch fails', async () => {
      const articleUrl = 'https://channel24bd.tv/national/article/100';
      const mockHtml = `<html><head><meta property="og:title" content="Proxy Title"/><meta property="og:image" content="https://img.com/a.jpg"/></head></html>`;

      (global.fetch as any)
        .mockRejectedValueOnce(new TypeError('CORS Error'))
        .mockResolvedValueOnce({
          ok: true,
          text: async () => mockHtml
        });

      const meta = await getMetadata(articleUrl);
      expect(meta).toEqual({
        title: 'Proxy Title',
        image: 'https://img.com/a.jpg',
        publishDate: ''
      });
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect((global.fetch as any).mock.calls[1][0]).toContain('allorigins.win');
    });
  });

  describe('scrapeLatestLinks', () => {
    beforeEach(() => {
      vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('should fetch and map archive API data', async () => {
      const mockApiResponse = {
        archive_data: [
          {
            ContentID: 349197,
            Slug: 'politics',
            ContentHeading: 'Sample Headline',
            ImageBgPath: '2026September/sample.jpg',
            URLAlies: 'sample-alias',
            create_date: 'Thursday, 24 September 2026, 20:30'
          }
        ]
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse
      });

      const links = await scrapeLatestLinks(1);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://backoffice.channel24bd.tv/api/archive',
        expect.objectContaining({ method: 'POST' })
      );
      expect(links).toEqual([
        {
          url: 'https://channel24bd.tv/politics/article/349197/sample-alias',
          title: 'Sample Headline',
          image: 'https://backoffice.channel24bd.tv/media/imgAll/2026September/sample.jpg',
          postTime: formatSitemapTime('Thursday, 24 September 2026, 20:30'),
          contentId: 349197
        }
      ]);
    });
  });
});
