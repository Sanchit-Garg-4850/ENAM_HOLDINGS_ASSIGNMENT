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
  type: 'Annual Report' | 'Concall' | 'Presentation' | 'Exchange Filing' | 'Credit Rating';
  url: string;
}

export interface ScreenerCompanyData {
  symbol: string;
  roce?: number;
  roe?: number;
  bookValue?: number;
  quarters: ScreenerQuarterData[];
  annualReports: ScreenerDocumentLink[];
  filings: ScreenerDocumentLink[];
  presentations: ScreenerDocumentLink[];
  creditRatings: ScreenerDocumentLink[];
}

const screenerCache = new Map<string, { data: ScreenerCompanyData; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

const SYMBOL_SLUG_MAP: Record<string, string> = {
  ZOMATO: 'ETERNAL',
};

export async function fetchScreenerData(symbol: string): Promise<ScreenerCompanyData | null> {
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

    let res = await fetch(url, { headers });

    // If 404, resolve slug dynamically via Screener search API
    if (res.status === 404) {
      const searchRes = await fetch(`https://www.screener.in/api/company/search/?q=${cleanSymbol}`, { headers });
      if (searchRes.status === 200) {
        const results = await searchRes.json();
        if (results && results.length > 0 && results[0].url) {
          url = `https://www.screener.in${results[0].url}`;
          res = await fetch(url, { headers });
        }
      }
    }

    if (res.status !== 200) {
      console.warn(`[Screener] HTTP ${res.status} for ${cleanSymbol}`);
      return null;
    }

    const html = await res.text();

    // 1. Parse Key Ratios
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

    const companyData: ScreenerCompanyData = {
      symbol: cleanSymbol,
      roce,
      roe,
      bookValue,
      quarters,
      annualReports: annualReports.slice(0, 6),
      filings: filings.slice(0, 10),
      presentations: presentations.slice(0, 6),
      creditRatings: creditRatings.slice(0, 4),
    };

    screenerCache.set(cleanSymbol, { data: companyData, timestamp: now });
    return companyData;
  } catch (error) {
    console.warn(`[Screener] Error parsing ${cleanSymbol}:`, (error as Error).message);
    return null;
  }
}
