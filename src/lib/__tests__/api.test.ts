import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  parseSitemapXml,
  formatSitemapTime,
  BG_API_ARCHIVE_URL,
  BG_SITEMAP_URL,
  scrapeLatestLinks
} from '../api';

describe('API & Sitemap utilities', () => {
  it('should have correct API and Sitemap URLs', () => {
    expect(BG_API_ARCHIVE_URL).toBe('https://backoffice.daily-bangladesh.com/api/archive');
    expect(BG_SITEMAP_URL).toBe('https://www.daily-bangladesh.com/news-sitemap.xml');
  });

  describe('parseSitemapXml', () => {
    it('should correctly parse news-sitemap XML structure', () => {
      const xmlSample = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://www.daily-bangladesh.com/campus/534706</loc>
    <news:news>
      <news:publication>
        <news:name>Daily Bangladesh</news:name>
        <news:language>bn</news:language>
      </news:publication>
      <news:publication_date>2026-09-14T20:25:00+00:00</news:publication_date>
      <news:title>Test Headline Title</news:title>
    </news:news>
    <image:image>
      <image:loc>https://dbs3.sgp1.cdn.digitaloceanspaces.com/imgAll/2026September/forhad-1789395933.jpg</image:loc>
      <image:title>Test Headline Title</image:title>
    </image:image>
  </url>
</urlset>`;

      const items = parseSitemapXml(xmlSample);
      expect(items).toHaveLength(1);
      expect(items[0].url).toBe('https://www.daily-bangladesh.com/campus/534706');
      expect(items[0].title).toBe('Test Headline Title');
      expect(items[0].image).toBe('https://dbs3.sgp1.cdn.digitaloceanspaces.com/imgAll/2026September/forhad-1789395933.jpg');
      expect(items[0].contentId).toBe(534706);
    });

    it('should parse sitemap XML with regex fallback if DOMParser fails or is unavailable', () => {
      const xmlSample = `<urlset>
  <url>
    <loc>https://www.daily-bangladesh.com/country/123456</loc>
    <news:title>Sample Article Title</news:title>
    <image:loc>https://backoffice.daily-bangladesh.com/media/imgAll/sample.jpg</image:loc>
    <news:publication_date>2026-09-14T20:00:00+00:00</news:publication_date>
  </url>
</urlset>`;

      const items = parseSitemapXml(xmlSample);
      expect(items).toHaveLength(1);
      expect(items[0].contentId).toBe(123456);
      expect(items[0].title).toBe('Sample Article Title');
      expect(items[0].image).toBe('https://backoffice.daily-bangladesh.com/media/imgAll/sample.jpg');
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
            ContentID: 534710,
            Slug: 'country',
            ContentHeading: 'Sample Headline',
            ImageBgPath: '2026September/sample.jpg',
            create_date: 'Monday, 14 September 2026, 20:30'
          }
        ]
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse
      });

      const links = await scrapeLatestLinks(1);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://backoffice.daily-bangladesh.com/api/archive',
        expect.objectContaining({ method: 'POST' })
      );
      expect(links).toEqual([
        {
          url: 'https://www.daily-bangladesh.com/country/534710',
          title: 'Sample Headline',
          image: 'https://backoffice.daily-bangladesh.com/media/imgAll/2026September/sample.jpg',
          postTime: formatSitemapTime('Monday, 14 September 2026, 20:30'),
          contentId: 534710
        }
      ]);
    });
  });
});
