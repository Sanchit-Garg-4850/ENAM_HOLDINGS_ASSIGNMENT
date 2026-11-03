// Live Screener.in Primary Scraper & Connector (Zero Cost)
export interface ScreenerQuarterData {
  quarter: string;
  sales: number; // ₹ Cr
  operatingProfit: number; // ₹ Cr (EBITDA)
  opmPercent: number; // %
  netProfit: number; // ₹ Cr (PAT)
  salesQoQ?: number;
  salesYoY?: number;
  ebitdaQoQ?: number;
  ebitdaYoY?: number;
  patQoQ?: number;
  patYoY?: number;
}

export interface ScreenerDocumentLink {
  title: string;
  date?: string;
  type: 'Annual Report' | 'Concall' | 'Concall Transcript' | 'Presentation' | 'Exchange Filing' | 'Credit Rating';
  url: string;
}

export interface ScreenerCompanyData {
  symbol: string;
  name?: string;
  currentPrice?: number;
  marketCapCr?: number;
  peRatio?: number;
  overview?: string;
  segmentsDescription?: string;
  pros?: string[];
  cons?: string[];
  salesCagr3Y?: number;
  profitCagr3Y?: number;
  roe3Y?: number;
  stockPriceCagr3Y?: number;
  roce?: number;
  roe?: number;
  bookValue?: number;
  debtCr?: number;
  reservesCr?: number;
  workingCapitalDays?: number;
  debtorDays?: number;
  inventoryDays?: number;
  payableDays?: number;
  cashConversionCycle?: number;
  operatingCashFlowCr?: number;
  freeCashFlowCr?: number;
  quarters: ScreenerQuarterData[];
  annualReports: ScreenerDocumentLink[];
  filings: ScreenerDocumentLink[];
  presentations: ScreenerDocumentLink[];
  creditRatings: ScreenerDocumentLink[];
  concalls?: ScreenerDocumentLink[];
}

const screenerCache = new Map<string, { data: ScreenerCompanyData; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

const SYMBOL_SLUG_MAP: Record<string, string> = {
  ZOMATO: 'ETERNAL',
};

export async function fetchScreenerData(symbol: string, companyName?: string): Promise<ScreenerCompanyData | null> {
  const cleanSymbol = symbol.toUpperCase().replace(/\.(NS|BO)$/, '');
  const now = Date.now();

  const cached = screenerCache.get(cleanSymbol);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    let slug = SYMBOL_SLUG_MAP[cleanSymbol] || cleanSymbol;
    let url = `https://www.screener.in/company/${slug}/`;

    const headers = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    };

    let res: Response;
    try {
      res = await fetch(url, { headers, signal: AbortSignal.timeout(10000) });
    } catch {
      await new Promise((r) => setTimeout(r, 350));
      res = await fetch(url, { headers, signal: AbortSignal.timeout(12000) });
    }

    // If 404, resolve slug dynamically via Screener search API
    if (res.status === 404) {
      try {
        let searchRes = await fetch(`https://www.screener.in/api/company/search/?q=${encodeURIComponent(cleanSymbol)}`, {
          headers,
          signal: AbortSignal.timeout(6000),
        });
        let results = searchRes.status === 200 ? await searchRes.json() : [];
        if ((!results || results.length === 0) && companyName) {
          const cleanName = companyName.replace(/Limited|Ltd\.|Ltd|\(India\)|\.NS|\.BO/gi, '').trim();
          if (cleanName.length > 2) {
            searchRes = await fetch(`https://www.screener.in/api/company/search/?q=${encodeURIComponent(cleanName)}`, {
              headers,
              signal: AbortSignal.timeout(6000),
            });
            results = searchRes.status === 200 ? await searchRes.json() : [];
          }
        }
        if (results && results.length > 0 && results[0].url) {
          url = `https://www.screener.in${results[0].url}`;
          res = await fetch(url, { headers, signal: AbortSignal.timeout(10000) });
        }
      } catch {}
    }

    if (res.status !== 200) {
      console.warn(`[Screener] HTTP ${res.status} for ${cleanSymbol}`);
      return null;
    }

    const html = await res.text();

    // 1. Parse Key Header Stats & Ratios
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    const parsedCompanyName = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : undefined;

    const priceMatch = html.match(/Current Price[\s\S]*?<span class="number">([\d,.]+)<\/span>/);
    const mcapMatch = html.match(/Market Cap[\s\S]*?<span class="number">([\d,.]+)<\/span>/);
    const peMatch = html.match(/Stock P\/E[\s\S]*?<span class="number">([\d,.]+)<\/span>/);

    const currentPrice = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : undefined;
    const marketCapCr = mcapMatch ? parseFloat(mcapMatch[1].replace(/,/g, '')) : undefined;
    const peRatio = peMatch ? parseFloat(peMatch[1].replace(/,/g, '')) : undefined;

    const roceMatch = html.match(/ROCE[\s\S]*?<span class="number">([\d\.]+)<\/span>/);
    const roeMatch = html.match(/ROE[\s\S]*?<span class="number">([\d\.]+)<\/span>/);
    const bvMatch = html.match(/Book Value[\s\S]*?<span class="number">([\d\.]+)<\/span>/);

    const roce = roceMatch ? parseFloat(roceMatch[1]) : undefined;
    const roe = roeMatch ? parseFloat(roeMatch[1]) : undefined;
    const bookValue = bvMatch ? parseFloat(bvMatch[1]) : undefined;

    // 2. Parse Quarters Section
    const quarters: ScreenerQuarterData[] = [];
    const quartersSection = html.match(/<section id="quarters"[\s\S]*?<\/section>/);

    if (quartersSection) {
      const tableMatch = quartersSection[0].match(/<table[\s\S]*?<\/table>/);
      if (tableMatch) {
        // Headers (Quarter names)
        const thMatches = [...tableMatch[0].matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)];
        const quarterNames = thMatches
          .map((m) => m[1].replace(/<[^>]+>/g, '').trim())
          .filter((t) => t.match(/[A-Za-z]{3}\s*\d{4}/));

        // Row Parsing via <tr> and <td>
        const rows = [...tableMatch[0].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)];
        const rowMap: Record<string, number[]> = {};

        for (const r of rows) {
          const cells = [...r[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) =>
            m[1].replace(/<[^>]+>/g, '').trim()
          );
          if (cells.length > 1) {
            const label = cells[0].toLowerCase();
            const values = cells.slice(1).map((raw) => {
              const cleaned = raw.replace(/,/g, '').replace(/%/g, '').trim();
              const num = parseFloat(cleaned);
              return isNaN(num) ? 0 : num;
            });

            if (label.startsWith('sales')) rowMap['sales'] = values;
            else if (label.startsWith('operating profit')) rowMap['op'] = values;
            else if (label.startsWith('opm')) rowMap['opm'] = values;
            else if (label.startsWith('net profit')) rowMap['pat'] = values;
          }
        }

        const sales = rowMap['sales'] || [];
        const op = rowMap['op'] || [];
        const opm = rowMap['opm'] || [];
        const netProfit = rowMap['pat'] || [];

        const count = Math.min(quarterNames.length, sales.length, op.length, netProfit.length);

        for (let i = 0; i < count; i++) {
          const item: ScreenerQuarterData = {
            quarter: quarterNames[i],
            sales: sales[i],
            operatingProfit: op[i],
            opmPercent: opm[i] || 0,
            netProfit: netProfit[i],
          };

          // Calculate QoQ if previous index exists
          if (i > 0) {
            const prev = quarters[i - 1];
            if (prev.sales > 0) item.salesQoQ = Number((((item.sales - prev.sales) / prev.sales) * 100).toFixed(1));
            if (prev.operatingProfit > 0) item.ebitdaQoQ = Number((((item.operatingProfit - prev.operatingProfit) / prev.operatingProfit) * 100).toFixed(1));
            if (prev.netProfit !== 0) item.patQoQ = Number((((item.netProfit - prev.netProfit) / Math.abs(prev.netProfit)) * 100).toFixed(1));
          }

          // Calculate YoY if i >= 4
          if (i >= 4) {
            const yoyPrev = quarters[i - 4];
            if (yoyPrev.sales > 0) item.salesYoY = Number((((item.sales - yoyPrev.sales) / yoyPrev.sales) * 100).toFixed(1));
            if (yoyPrev.operatingProfit > 0) item.ebitdaYoY = Number((((item.operatingProfit - yoyPrev.operatingProfit) / yoyPrev.operatingProfit) * 100).toFixed(1));
            if (yoyPrev.netProfit !== 0) item.patYoY = Number((((item.netProfit - yoyPrev.netProfit) / Math.abs(yoyPrev.netProfit)) * 100).toFixed(1));
          }

          quarters.push(item);
        }
      }
    }

    // 3. Parse Documents Section
    const annualReports: ScreenerDocumentLink[] = [];
    const filings: ScreenerDocumentLink[] = [];
    const presentations: ScreenerDocumentLink[] = [];
    const creditRatings: ScreenerDocumentLink[] = [];

    const docSection = html.match(/<section id="documents"[\s\S]*?<\/section>/);
    if (docSection) {
      const linkMatches = [...docSection[0].matchAll(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)];
      for (const m of linkMatches) {
        const url = m[1];
        const rawText = m[2].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');

        if (rawText.toLowerCase().includes('annual report')) {
          annualReports.push({ title: rawText, type: 'Annual Report', url });
        } else if (rawText.toLowerCase().includes('rating update') || url.includes('careratings') || url.includes('icra.in')) {
          creditRatings.push({ title: rawText, type: 'Credit Rating', url });
        } else if (rawText.toLowerCase().includes('investor presentation') || rawText.includes('PPT') || url.toLowerCase().includes('presentation')) {
          presentations.push({ title: rawText, type: 'Presentation', url });
        } else if (url.includes('bseindia.com') || url.includes('nseindia.com')) {
          filings.push({ title: rawText, type: 'Exchange Filing', url });
        }
      }
    }

    // Parse Real Concall Transcripts & Audio / Presentations
    const concalls: ScreenerDocumentLink[] = [];
    const concallsSection = html.match(/concalls flex-column[\s\S]*?<\/ul>/);
    if (concallsSection) {
      const lis = [...concallsSection[0].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)];
      for (const li of lis) {
        const dateMatch = li[1].match(/<div[^>]*>([\s\S]*?)<\/div>/);
        const dateStr = dateMatch ? dateMatch[1].replace(/<[^>]+>/g, '').trim() : '';
        const links = [...li[1].matchAll(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)];
        for (const a of links) {
          const typeText = a[2].replace(/<[^>]+>/g, '').trim();
          const href = a[1];
          if (typeText.toLowerCase().includes('transcript') || href.endsWith('.pdf')) {
            concalls.push({
              title: `${dateStr} Earnings Call ${typeText}`,
              type: 'Concall Transcript',
              url: href,
            });
          }
        }
      }
    }

    // 4. Parse Real Company Profile & Segments Description
    const paras = [...html.matchAll(/<div class="company-profile"[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/g)]
      .map((m) => m[1].replace(/<[^>]+>/g, '').replace(/\[\d+\]/g, '').trim())
      .filter((t) => t.length > 30);
    const overview = paras[0] || undefined;
    const segmentsDescription = paras[1] || undefined;

    // 5. Parse Real Pros and Cons
    const pros = [...html.matchAll(/<div class="pros"[\s\S]*?<ul>([\s\S]*?)<\/ul>/g)]
      .flatMap((m) => [...m[1].matchAll(/<li>([\s\S]*?)<\/li>/g)].map((li) => li[1].replace(/<[^>]+>/g, '').trim()));
    const cons = [...html.matchAll(/<div class="cons"[\s\S]*?<ul>([\s\S]*?)<\/ul>/g)]
      .flatMap((m) => [...m[1].matchAll(/<li>([\s\S]*?)<\/li>/g)].map((li) => li[1].replace(/<[^>]+>/g, '').trim()));

    // 6. Parse Real CAGRs
    const salesCagrMatch = html.match(/Compounded Sales Growth[\s\S]*?3 Years:\s*<\/td>\s*<td[^>]*>([-\d\.]+)%/);
    const profitCagrMatch = html.match(/Compounded Profit Growth[\s\S]*?3 Years:\s*<\/td>\s*<td[^>]*>([-\d\.]+)%/);
    const roe3YMatch = html.match(/Return on Equity[\s\S]*?3 Years:\s*<\/td>\s*<td[^>]*>([-\d\.]+)%/);
    const stockCagrMatch = html.match(/Stock Price CAGR[\s\S]*?3 Years:\s*<\/td>\s*<td[^>]*>([-\d\.]+)%/);

    const salesCagr3Y = salesCagrMatch ? parseFloat(salesCagrMatch[1]) : undefined;
    const profitCagr3Y = profitCagrMatch ? parseFloat(profitCagrMatch[1]) : undefined;
    const roe3Y = roe3YMatch ? parseFloat(roe3YMatch[1]) : undefined;
    const stockPriceCagr3Y = stockCagrMatch ? parseFloat(stockCagrMatch[1]) : undefined;

    // 7. Helper: Extract Latest Numeric Cell from a Specific Table Section
    function getLatestRowNumber(sectionId: string, rowNameRegex: RegExp): number | undefined {
      const sec = html.match(new RegExp(`<section id="${sectionId}"[\\s\\S]*?</section>`));
      if (!sec) return undefined;
      const rows = [...sec[0].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)];
      for (const r of rows) {
        const cells = [...r[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)].map((c) =>
          c[1].replace(/<[^>]+>/g, '').trim()
        );
        if (cells.length > 1 && rowNameRegex.test(cells[0])) {
          const valStr = cells[cells.length - 1].replace(/,/g, '').replace(/%/g, '');
          const parsed = parseFloat(valStr);
          if (!isNaN(parsed)) return parsed;
        }
      }
      return undefined;
    }

    const debtorDays = getLatestRowNumber('ratios', /debtor days/i);
    const inventoryDays = getLatestRowNumber('ratios', /inventory days/i);
    const payableDays = getLatestRowNumber('ratios', /days payable|payable days/i);
    const workingCapitalDays = getLatestRowNumber('ratios', /working capital days/i);
    const cashConversionCycle = getLatestRowNumber('ratios', /cash conversion cycle/i);

    const operatingCashFlowCr = getLatestRowNumber('cash-flow', /cash from operating/i);
    const freeCashFlowCr = getLatestRowNumber('cash-flow', /free cash flow/i);
    const debtCr = getLatestRowNumber('balance-sheet', /borrowings/i);
    const reservesCr = getLatestRowNumber('balance-sheet', /reserves/i);

    const companyData: ScreenerCompanyData = {
      symbol: cleanSymbol,
      name: parsedCompanyName || companyName,
      currentPrice,
      marketCapCr,
      peRatio,
      overview,
      segmentsDescription,
      pros: pros.length > 0 ? pros : undefined,
      cons: cons.length > 0 ? cons : undefined,
      salesCagr3Y,
      profitCagr3Y,
      roe3Y,
      stockPriceCagr3Y,
      roce,
      roe,
      bookValue,
      debtCr,
      reservesCr,
      workingCapitalDays,
      debtorDays,
      inventoryDays,
      payableDays,
      cashConversionCycle,
      operatingCashFlowCr,
      freeCashFlowCr,
      quarters,
      annualReports: annualReports.slice(0, 6),
      filings: filings.slice(0, 10),
      presentations: presentations.slice(0, 6),
      creditRatings: creditRatings.slice(0, 4),
      concalls: concalls.slice(0, 10),
    };

    screenerCache.set(cleanSymbol, { data: companyData, timestamp: now });
    return companyData;
  } catch (error) {
    console.warn(`[Screener] Error parsing ${cleanSymbol}:`, (error as Error).message);
    return null;
  }
}
