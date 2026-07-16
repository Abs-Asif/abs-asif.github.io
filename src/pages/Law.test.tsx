import { describe, it, expect } from "vitest";
import { parseChronologicalIndex, parseLawDetails } from "./Law";

describe("Law Scraper & Parser", () => {
  it("correctly parses chronological index HTML to LawItems", () => {
    const mockHtml = `
      <html>
        <body>
          <a href="act-130.html">The Married Women's Property Act, 1874</a>
          <span>Act No: III of 1874</span>
          <a href="act-131.html">The Foreign Recruiting Act, 1874</a>
          <span>Act No: IV of 1874</span>
        </body>
      </html>
    `;
    const parsed = parseChronologicalIndex(mockHtml);
    expect(parsed.length).toBe(2);
    expect(parsed[0].id).toBe("130");
    expect(parsed[0].title).toBe("The Married Women's Property Act, 1874");
    expect(parsed[0].detailsLink).toBe("http://bdlaws.minlaw.gov.bd/act-details-130.html");
    expect(parsed[1].id).toBe("131");
    expect(parsed[1].title).toBe("The Foreign Recruiting Act, 1874");
  });

  it("correctly parses full single-page detailed law content", () => {
    const mockHtml = `
      <html>
        <body>
          <h3>The Married Women's Property Act, 1874</h3>
          <h4>( ACT NO. III OF 1874 )</h4>
          <span class="publish-date">[ 24th February, 1874 ]</span>
          <div class="act-role-style">An Act to explain and amend the law relating to certain married women.</div>

          <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 lineremove">
            <div class="row lineremoves">
              <div class="act-chapter-group">
                <p class="act-chapter-no">Chapter I</p>
                <p class="act-chapter-name">PRELIMINARY</p>
              </div>
            </div>
            <div class="row lineremoves">
              <div class="col-sm-3 txt-head">Short title</div>
              <div class="col-sm-9 txt-details">1. This Act may be called the Married Women's Property Act, 1874.</div>
            </div>
            <div class="row lineremoves">
              <div class="col-sm-3 txt-head">Extent and commencement</div>
              <div class="col-sm-9 txt-details">2. It extends to the whole of Bangladesh.</div>
            </div>
          </div>
        </body>
      </html>
    `;
    const parsed = parseLawDetails("130", mockHtml);
    expect(parsed.id).toBe("130");
    expect(parsed.title).toBe("The Married Women's Property Act, 1874");
    expect(parsed.actNo).toBe("ACT NO. III OF 1874");
    expect(parsed.publishDate).toBe("24th February, 1874");
    expect(parsed.preambleBody).toBe("An Act to explain and amend the law relating to certain married women.");
    expect(parsed.chapters.length).toBe(1);
    expect(parsed.chapters[0].number).toBe("Chapter I");
    expect(parsed.chapters[0].name).toBe("PRELIMINARY");
    expect(parsed.chapters[0].sections.length).toBe(2);
    expect(parsed.chapters[0].sections[0].head).toBe("Short title");
    expect(parsed.chapters[0].sections[0].details).toBe("1. This Act may be called the Married Women's Property Act, 1874.");
  });
});
