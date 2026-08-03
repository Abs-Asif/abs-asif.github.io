import { describe, it, expect } from "vitest";
import { NEWSPAPERS, getPythonTemplate } from "./News";

describe("BD Newspaper Crawler Configs & Utils", () => {
  it("should contain exactly 46 newspapers and blogs matching KSMubasshir's crawlers", () => {
    expect(NEWSPAPERS.length).toBe(46);
  });

  it("should have valid configs with base URLs and link patterns for all 46 crawlers", () => {
    NEWSPAPERS.forEach(news => {
      expect(news.id).toBeDefined();
      expect(news.name).toBeDefined();
      expect(news.baseUrl).toContain("http");
      expect(Array.isArray(news.linkPatterns)).toBe(true);
      expect(news.linkPatterns.length).toBeGreaterThan(0);
      expect(news.pythonKey).toBeDefined();
    });
  });

  it("should dynamically generate standard python crawler template customized with newspaper metadata", () => {
    // Pick an option that uses dynamic generation (e.g. daily_bangladesh or dmpnews)
    const dailyBangla = NEWSPAPERS.find(n => n.id === "daily_bangladesh");
    expect(dailyBangla).toBeDefined();
    if (dailyBangla) {
      const pyCode = getPythonTemplate(dailyBangla);
      expect(pyCode).toContain("Daily Bangladesh");
      expect(pyCode).toContain("https://www.daily-bangladesh.com");
      expect(pyCode).toContain("BeautifulSoup");
      expect(pyCode).toContain("requests.get");
    }
  });

  it("should return the exact hardcoded python template for classic crawlers", () => {
    const prothomAlo = NEWSPAPERS.find(n => n.id === "prothomalo_bn");
    expect(prothomAlo).toBeDefined();
    if (prothomAlo) {
      const pyCode = getPythonTemplate(prothomAlo);
      expect(pyCode).toContain("newspaper_archive_base_url = 'http://www.prothom-alo.com/archive/'");
    }
  });
});
