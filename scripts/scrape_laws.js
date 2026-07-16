import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

// Target directory
const TARGET_DIR = 'public/laws';
fs.mkdirSync(TARGET_DIR, { recursive: true });

// Curated list of important law IDs to scrape details for
const IMPORTANT_LAW_IDS = [
  '11',  // The Penal Code, 1860
  '75',  // The Code of Criminal Procedure, 1898
  '367', // The Constitution of Bangladesh (1972)
  '24',  // The Evidence Act, 1872
  '26',  // The Contract Act, 1872
  '36',  // The Specific Relief Act, 1877
  '90',  // The Registration Act, 1908
  '104', // The Code of Civil Procedure, 1908
  '93',  // The Limitation Act, 1908
  '44',  // The Transfer of Property Act, 1882
  '10',  // The Police Act, 1861
  '382', // The General Clauses Act, 1897
  '130'  // The Married Women's Property Act, 1874
];

// Helper to fetch with user-agent and auto-decode UTF-16
async function fetchWithUtf16(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: Status ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  let decoder = new TextDecoder('utf-8');
  if (bytes[0] === 0xfe && bytes[1] === 0xff) {
    decoder = new TextDecoder('utf-16be');
  } else if (bytes[0] === 0xff && bytes[1] === 0xfe) {
    decoder = new TextDecoder('utf-16le');
  } else if (bytes[0] === 0x00 && bytes[1] === 0x3c) {
    decoder = new TextDecoder('utf-16be');
  } else if (bytes[1] === 0x00 && bytes[0] === 0x3c) {
    decoder = new TextDecoder('utf-16le');
  } else {
    // Guessing
    let evenZeros = 0;
    let oddZeros = 0;
    const limit = Math.min(bytes.length, 100);
    for (let i = 0; i < limit; i++) {
      if (bytes[i] === 0) {
        if (i % 2 === 0) evenZeros++;
        else oddZeros++;
      }
    }
    if (evenZeros > 10) {
      decoder = new TextDecoder('utf-16be');
    } else if (oddZeros > 10) {
      decoder = new TextDecoder('utf-16le');
    }
  }

  return decoder.decode(buffer);
}

// Scrape and parse index
async function scrapeIndex() {
  console.log('Fetching chronological index of laws...');
  const url = 'http://bdlaws.minlaw.gov.bd/laws-of-bangladesh-chronological-index.html';
  const html = await fetchWithUtf16(url);

  console.log('Parsing index html...');
  const $ = cheerio.load(html);
  const items = [];
  const seenIds = new Set();

  $('a').each((_, el) => {
    const href = $(el).attr('href') || '';
    const match = href.match(/act-(\d+)\.html/);
    if (match) {
      const id = match[1];
      if (seenIds.has(id)) return;
      seenIds.add(id);

      const title = $(el).text().trim() || 'Untitled Law';
      let actNo = '';
      let year = '';

      const parentText = $(el).parent().text() || '';
      const yearMatch = parentText.match(/\b(17\d{2}|18\d{2}|19\d{2}|20\d{2})\b/);
      if (yearMatch) {
        year = yearMatch[1];
      }

      const actMatch = parentText.match(/\b(I[VX]|V[I]{0,3}|X[IB]{0,3}|L[I]{0,3}|C[I]{0,3}|[VIXLCDM]+)\b/);
      if (actMatch) {
        actNo = actMatch[1];
      }

      if (!year) {
        const titleYearMatch = title.match(/\b(17\d{2}|18\d{2}|19\d{2}|20\d{2})\b/);
        if (titleYearMatch) {
          year = titleYearMatch[1];
        }
      }

      items.push({
        id,
        title,
        actNo: actNo || 'N/A',
        year: year || 'N/A',
        originalLink: `http://bdlaws.minlaw.gov.bd/act-${id}.html`,
        detailsLink: `http://bdlaws.minlaw.gov.bd/act-details-${id}.html`
      });
    }
  });

  console.log(`Parsed ${items.length} unique laws from the chronological index.`);

  const outputPath = path.join(TARGET_DIR, 'index.json');
  fs.writeFileSync(outputPath, JSON.stringify(items, null, 2), 'utf-8');
  console.log(`Saved index to ${outputPath}`);
  return items;
}

// Scrape and parse details of a single law
async function scrapeDetails(lawItem) {
  const { id, detailsLink, title } = lawItem;
  console.log(`Fetching details for law ${id}: "${title}"...`);

  try {
    const html = await fetchWithUtf16(detailsLink);
    const $ = cheerio.load(html);

    // Clean up nodes that break inline layout, matching frontend implementation
    $('.clbr, .na').remove();

    const docTitle = $('h3').first().text().trim() || title;
    const actNo = $('h4').first().text().replace(/[\(\)]/g, '').trim() || lawItem.actNo;
    const publishDate = $('.publish-date').first().text().replace(/[\[\]]/g, '').trim() || '';

    let preambleTitle = 'Preamble';
    let preambleBody = $('.act-role-style').first().text().trim() || '';

    // If no preamble body is found yet, scan rows for text containing "preamble"
    if (!preambleBody) {
      $('div.row').each((_, el) => {
        const text = $(el).text() || '';
        if (text.toLowerCase().includes('preamble')) {
          preambleBody = text.replace(/preamble/gi, '').trim();
        }
      });
    }

    const chapters = [];
    const unGroupedSections = [];
    const footnotes = [];

    $('.footnote, span[class*="footnote"]').each((idx, el) => {
      const fnText = $(el).attr('title') || '';
      const fnNumEl = $(el).find('sup');
      const fnNum = fnNumEl.text().trim() || String(idx + 1);
      if (fnText) {
        footnotes.push({ num: fnNum, text: fnText });
      }
    });

    const parentContainer = $('.lineremoves').parent().first().length ? $('.lineremoves').parent().first() : $('body');

    parentContainer.children().each((_, childEl) => {
      const child = $(childEl);
      const isChapter = child.find('.act-chapter-group').length > 0 || child.hasClass('act-chapter-group');
      if (isChapter) {
        const chapterNoEl = child.find('.act-chapter-no');
        const chapterNameEl = child.find('.act-chapter-name');
        const numStr = chapterNoEl.text().trim();
        const nameStr = chapterNameEl.text().trim();

        chapters.push({
          number: numStr,
          name: nameStr,
          sections: []
        });
        return;
      }

      const txtHead = child.find('.txt-head');
      const txtDetails = child.find('.txt-details');
      if (txtHead.length && txtDetails.length) {
        const head = txtHead.text().trim();
        const details = txtDetails.text().trim();
        const section = { head, details };

        if (chapters.length > 0) {
          chapters[chapters.length - 1].sections.push(section);
        } else {
          unGroupedSections.push(section);
        }
      }
    });

    // Fallback if no hierarchical container was traversed
    if (chapters.length === 0 && unGroupedSections.length === 0) {
      const secHeads = $('.col-sm-3.txt-head, td.txt-head');
      const secDetails = $('.col-sm-9.txt-details, td.txt-details');
      for (let i = 0; i < Math.min(secHeads.length, secDetails.length); i++) {
        const head = $(secHeads[i]).text().trim();
        const details = $(secDetails[i]).text().trim();
        unGroupedSections.push({ head, details });
      }
    }

    const details = {
      id,
      title: docTitle,
      actNo,
      publishDate,
      preambleTitle,
      preambleBody,
      chapters,
      unGroupedSections,
      footnotes
    };

    const outputPath = path.join(TARGET_DIR, `${id}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(details, null, 2), 'utf-8');
    console.log(`Successfully saved details for law ${id} to ${outputPath}`);

    // Also save as HTML for backup/reference if needed, or TXT
    const mdPath = path.join(TARGET_DIR, `${id}.md`);
    let markdown = `# ${docTitle}\n\n`;
    if (actNo) markdown += `**${actNo}**\n\n`;
    if (publishDate) markdown += `*Published: ${publishDate}*\n\n`;
    if (preambleBody) markdown += `### Preamble\n${preambleBody}\n\n`;

    if (unGroupedSections.length > 0) {
      unGroupedSections.forEach(sec => {
        markdown += `### ${sec.head}\n${sec.details}\n\n`;
      });
    }

    chapters.forEach(ch => {
      markdown += `## ${ch.number}: ${ch.name}\n\n`;
      ch.sections.forEach(sec => {
        markdown += `### ${sec.head}\n${sec.details}\n\n`;
      });
    });

    if (footnotes.length > 0) {
      markdown += `## Footnotes & Amendments\n\n`;
      footnotes.forEach(fn => {
        markdown += `[${fn.num}] ${fn.text}\n`;
      });
    }

    fs.writeFileSync(mdPath, markdown, 'utf-8');
    console.log(`Successfully saved MD format to ${mdPath}`);

  } catch (error) {
    console.error(`Error scraping law ${id}:`, error);
  }
}

// Main execution function
async function main() {
  try {
    const index = await scrapeIndex();

    console.log('\n--- Scraping Detailed Pages for Core Laws ---');
    for (const id of IMPORTANT_LAW_IDS) {
      const lawItem = index.find(item => item.id === id);
      if (lawItem) {
        await scrapeDetails(lawItem);
        // Sleep for 500ms to be polite to the server
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        console.warn(`Could not find index entry for important law ID: ${id}`);
      }
    }
    console.log('\nAll scraping operations completed successfully!');
  } catch (error) {
    console.error('Scraping main task failed:', error);
    process.exit(1);
  }
}

main();
