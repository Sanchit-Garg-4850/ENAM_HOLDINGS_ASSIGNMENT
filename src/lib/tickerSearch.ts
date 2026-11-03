// Intelligent NSE Equity Search & Typo-Correction Engine
import { PORTFOLIO_COMPANIES } from '@/data/portfolio';

export interface SearchResultItem {
  ticker: string;
  symbol: string;
  name: string;
  sector: string;
  isPortfolio: boolean;
  isVerified: boolean;
}

export interface SearchResponse {
  success: boolean;
  query: string;
  results: SearchResultItem[];
  didYouMean?: SearchResultItem;
  hasExactMatch: boolean;
}

// Comprehensive Curated Indian Equities Universe (Nifty 50, Next 50, Midcaps, Key Sectors)
export const POPULAR_NSE_STOCKS: Array<{ symbol: string; name: string; sector: string; aliases?: string[] }> = [
  // Portfolio Stocks
  { symbol: 'TRENT', name: 'Trent Limited', sector: 'Retail & Consumer Discretionary', aliases: ['WESTSIDE', 'ZUDIO'] },
  { symbol: 'BEL', name: 'Bharat Electronics Limited', sector: 'Defense & Aerospace Electronics', aliases: ['BHARAT ELEC', 'DEFENSE'] },
  { symbol: 'DIXON', name: 'Dixon Technologies (India) Limited', sector: 'Electronics Manufacturing & EMS', aliases: ['EMS', 'DIXON TECH'] },
  { symbol: 'KAYNES', name: 'Kaynes Technology India Limited', sector: 'Electronics Manufacturing Services', aliases: ['KAYNES TECH'] },
  { symbol: 'HAL', name: 'Hindustan Aeronautics Limited', sector: 'Defense & Aerospace Manufacturing', aliases: ['HINDUSTAN AERO', 'TEJAS'] },
  { symbol: 'TITAN', name: 'Titan Company Limited', sector: 'Consumer Goods & Luxury Jewelry', aliases: ['TANISHQ', 'TITAN WATCHES', 'FASTTRACK'] },
  { symbol: 'SUZLON', name: 'Suzlon Energy Limited', sector: 'Renewable & Clean Energy', aliases: ['WIND ENERGY', 'SUZLON WIND'] },
  { symbol: 'ZOMATO', name: 'Eternal Limited (Zomato / Blinkit)', sector: 'Consumer Internet & Quick Commerce', aliases: ['BLINKIT', 'ZOMATO'] },
  { symbol: 'PREMIERENE', name: 'Premier Energies Limited', sector: 'Solar PV Cells & Modules', aliases: ['SOLAR', 'PREMIER'] },
  { symbol: 'SOLARINDS', name: 'Solar Industries India Limited', sector: 'Industrial Explosives & Defense', aliases: ['SOLAR IND'] },
  { symbol: 'KPITTECH', name: 'KPIT Technologies Limited', sector: 'Automotive Software & Mobility', aliases: ['KPIT'] },

  // Nifty 50 Large Caps
  { symbol: 'RELIANCE', name: 'Reliance Industries Limited', sector: 'Oil, Retail & Telecom Conglomerate', aliases: ['RIL', 'JIO', 'MUKESH AMBANI'] },
  { symbol: 'TCS', name: 'Tata Consultancy Services Limited', sector: 'Information Technology Services', aliases: ['TATA CONSULTANCY'] },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', sector: 'Banking & Financial Services', aliases: ['HDFC', 'HOUSING DEVELOPMENT'] },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Limited', sector: 'Banking & Financial Services', aliases: ['ICICI'] },
  { symbol: 'INFY', name: 'Infosys Limited', sector: 'Information Technology Services', aliases: ['INFOSYS', 'INFOSIS', 'NARAYANA MURTHY'] },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Limited', sector: 'Telecommunications', aliases: ['AIRTEL', 'BHARTI'] },
  { symbol: 'ITC', name: 'ITC Limited', sector: 'FMCG, Cigarettes, Hotels & Agribusiness', aliases: ['IMPERIAL TOBACCO', 'ITC HOTELS'] },
  { symbol: 'SBIN', name: 'State Bank of India', sector: 'Public Sector Banking', aliases: ['STATE BANK', 'SBI'] },
  { symbol: 'LT', name: 'Larsen & Toubro Limited', sector: 'Engineering, Procurement & Construction', aliases: ['LARSEN', 'L&T'] },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Limited', sector: 'Fast Moving Consumer Goods (FMCG)', aliases: ['HUL', 'UNILEVER'] },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Limited', sector: 'Non-Banking Financial Companies (NBFC)', aliases: ['BAJAJ FIN'] },
  { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv Limited', sector: 'Financial Services & Insurance', aliases: ['BAJAJ FINSERV'] },
  { symbol: 'HCLTECH', name: 'HCL Technologies Limited', sector: 'Information Technology Services', aliases: ['HCL'] },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India Limited', sector: 'Automotive & Passenger Vehicles', aliases: ['MARUTI SUZUKI', 'SUZUKI'] },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Limited', sector: 'Pharmaceuticals & Generics', aliases: ['SUN PHARMA'] },
  { symbol: 'TMPV', name: 'Tata Motors Passenger Vehicles Ltd', sector: 'Automotive & Commercial Vehicles', aliases: ['TATA MOTORS', 'TATAMOTORS', 'JLR', 'TMCV'] },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Limited', sector: 'Automotive & Commercial Vehicles', aliases: ['TATA MOTORS', 'JLR'] },
  { symbol: 'TATASTEEL', name: 'Tata Steel Limited', sector: 'Metals & Steel Manufacturing', aliases: ['TATA STEEL', 'TISCO'] },
  { symbol: 'TATAPOWER', name: 'Tata Power Company Limited', sector: 'Power Generation & Renewable Utilities', aliases: ['TATA POWER'] },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Limited', sector: 'Private Sector Banking', aliases: ['KOTAK', 'UDAY KOTAK'] },
  { symbol: 'AXISBANK', name: 'Axis Bank Limited', sector: 'Private Sector Banking', aliases: ['AXIS', 'UTI BANK'] },
  { symbol: 'ASIANPAINT', name: 'Asian Paints Limited', sector: 'Decorative Paints & Home Decor', aliases: ['ASIAN PAINTS', 'PAINT'] },
  { symbol: 'NTPC', name: 'NTPC Limited', sector: 'Thermal & Renewable Power Generation', aliases: ['NATIONAL THERMAL POWER'] },
  { symbol: 'POWERGRID', name: 'Power Grid Corporation of India Limited', sector: 'Power Transmission Utilities', aliases: ['POWERGRID', 'PGCIL'] },
  { symbol: 'ONGC', name: 'Oil and Natural Gas Corporation Limited', sector: 'Oil & Gas Exploration & Production', aliases: ['OIL AND NATURAL GAS'] },
  { symbol: 'COALINDIA', name: 'Coal India Limited', sector: 'Mining & Coal Extraction', aliases: ['COAL INDIA', 'CIL'] },
  { symbol: 'M&M', name: 'Mahindra & Mahindra Limited', sector: 'Automotive, SUVs & Farm Equipment', aliases: ['MAHINDRA', 'MAHINDRA & MAHINDRA'] },
  { symbol: 'ADANIENT', name: 'Adani Enterprises Limited', sector: 'Diversified Conglomerate & Incubation', aliases: ['ADANI'] },
  { symbol: 'ADANIPORTS', name: 'Adani Ports and Special Economic Zone Limited', sector: 'Ports & Logistics Infrastructure', aliases: ['ADANI PORTS', 'APSEZ'] },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Limited', sector: 'Cement & Building Materials', aliases: ['ULTRATECH', 'ADITYA BIRLA CEMENT'] },
  { symbol: 'WIPRO', name: 'Wipro Limited', sector: 'Information Technology Services', aliases: ['WIPRO', 'AZIM PREMJI'] },
  { symbol: 'NESTLEIND', name: 'Nestle India Limited', sector: 'FMCG & Food Products', aliases: ['NESTLE', 'MAGGI'] },
  { symbol: 'JSWSTEEL', name: 'JSW Steel Limited', sector: 'Steel & Metallurgy', aliases: ['JSW', 'JINDAL'] },
  { symbol: 'GRASIM', name: 'Grasim Industries Limited', sector: 'Chemicals, Textiles & Paints', aliases: ['GRASIM', 'BIRLA OPUS'] },
  { symbol: 'TECHM', name: 'Tech Mahindra Limited', sector: 'Information Technology & Telecom Software', aliases: ['TECH MAHINDRA'] },
  { symbol: 'CIPLA', name: 'Cipla Limited', sector: 'Pharmaceuticals & Respiratory Care', aliases: ['CIPLA'] },
  { symbol: 'DRREDDY', name: 'Dr. Reddy’s Laboratories Limited', sector: 'Pharmaceuticals & Biotechnology', aliases: ['DR REDDY', 'REDDYS'] },
  { symbol: 'INDUSINDBK', name: 'IndusInd Bank Limited', sector: 'Private Sector Banking', aliases: ['INDUSIND'] },
  { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals Enterprise Limited', sector: 'Healthcare, Hospitals & Pharmacies', aliases: ['APOLLO', 'APOLLO 247'] },
  { symbol: 'EICHERMOT', name: 'Eicher Motors Limited', sector: 'Automotive & Motorcycles', aliases: ['ROYAL ENFIELD', 'EICHER'] },
  { symbol: 'DIVISLAB', name: 'Divi’s Laboratories Limited', sector: 'Active Pharmaceutical Ingredients (API)', aliases: ['DIVIS', 'DIVI LABS'] },
  { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto Limited', sector: 'Two-Wheelers & Three-Wheelers', aliases: ['BAJAJ AUTO', 'CHETAK'] },
  { symbol: 'BRITANNIA', name: 'Britannia Industries Limited', sector: 'FMCG & Bakery Goods', aliases: ['BRITANNIA', 'GOOD DAY'] },
  { symbol: 'SHRIRAMFIN', name: 'Shriram Finance Limited', sector: 'Commercial Vehicle & Retail NBFC', aliases: ['SHRIRAM'] },
  { symbol: 'HDFCLIFE', name: 'HDFC Life Insurance Company Limited', sector: 'Life Insurance', aliases: ['HDFC LIFE'] },
  { symbol: 'SBILIFE', name: 'SBI Life Insurance Company Limited', sector: 'Life Insurance', aliases: ['SBI LIFE'] },
  { symbol: 'BPCL', name: 'Bharat Petroleum Corporation Limited', sector: 'Oil Refining & Marketing', aliases: ['BHARAT PETROLEUM'] },
  { symbol: 'IOC', name: 'Indian Oil Corporation Limited', sector: 'Oil Refining & Pipelines', aliases: ['INDIAN OIL'] },
  { symbol: 'VEDL', name: 'Vedanta Limited', sector: 'Metals, Mining & Aluminum', aliases: ['VEDANTA', 'ANIL AGARWAL'] },
  { symbol: 'HINDALCO', name: 'Hindalco Industries Limited', sector: 'Aluminum & Copper Fabrication', aliases: ['HINDALCO', 'NOVELIS'] },

  // Key High-Growth Tech, Defense, Financial & Consumer Midcaps
  { symbol: 'MAZDOCK', name: 'Mazagon Dock Shipbuilders Limited', sector: 'Defense Shipbuilding & Submarines', aliases: ['MAZAGON', 'SHIPBUILDERS'] },
  { symbol: 'COCHINSHIP', name: 'Cochin Shipyard Limited', sector: 'Defense Shipbuilding & Ship Repair', aliases: ['COCHIN SHIPYARD'] },
  { symbol: 'BDL', name: 'Bharat Dynamics Limited', sector: 'Defense Missiles & Torpedoes', aliases: ['BHARAT DYNAMICS'] },
  { symbol: 'PARAS', name: 'Paras Defence and Space Technologies', sector: 'Defense Optics & Space Electronics', aliases: ['PARAS DEFENCE'] },
  { symbol: 'DATAPATTNS', name: 'Data Patterns (India) Limited', sector: 'Defense & Aerospace Electronics', aliases: ['DATA PATTERNS'] },
  { symbol: 'IDEA', name: 'Vodafone Idea Limited', sector: 'Telecommunications', aliases: ['VI', 'VODAFONE'] },
  { symbol: 'POLICYBZR', name: 'PB Fintech Limited (Policybazaar)', sector: 'Fintech & Digital Insurance', aliases: ['POLICYBAZAAR', 'PB FINTECH'] },
  { symbol: 'PAYTM', name: 'One97 Communications Limited (Paytm)', sector: 'Digital Payments & Fintech', aliases: ['PAYTM', 'ONE97'] },
  { symbol: 'NYKAA', name: 'FSN E-Commerce Ventures Limited (Nykaa)', sector: 'Beauty, Wellness & Fashion E-Commerce', aliases: ['NYKAA'] },
  { symbol: 'DELHIVERY', name: 'Delhivery Limited', sector: 'Express Logistics & Supply Chain', aliases: ['DELHIVERY'] },
  { symbol: 'POLYCAB', name: 'Polycab India Limited', sector: 'Wires, Cables & Fast Moving Electrical Goods', aliases: ['POLYCAB', 'WIRES'] },
  { symbol: 'KEI', name: 'KEI Industries Limited', sector: 'Cables & Heavy Electricals', aliases: ['KEI'] },
  { symbol: 'HAVELLS', name: 'Havells India Limited', sector: 'Consumer Electricals & Appliances', aliases: ['HAVELLS', 'LLOYD'] },
  { symbol: 'VOLTAS', name: 'Voltas Limited', sector: 'Air Conditioning & Cooling Products', aliases: ['VOLTAS'] },
  { symbol: 'PERSISTENT', name: 'Persistent Systems Limited', sector: 'Digital Engineering & Cloud IT', aliases: ['PERSISTENT'] },
  { symbol: 'COFORGE', name: 'Coforge Limited', sector: 'Information Technology & Cloud Solutions', aliases: ['COFORGE', 'NIIT TECH'] },
  { symbol: 'LTIM', name: 'LTIMindtree Limited', sector: 'IT Services & Digital Transformation', aliases: ['MINDTREE', 'LTI'] },
  { symbol: 'TATAELXSI', name: 'Tata Elxsi Limited', sector: 'Design & Software Engineering', aliases: ['TATA ELXSI'] },
  { symbol: 'VARUN', name: 'Varun Beverages Limited', sector: 'Beverages & Pepsi Bottler', aliases: ['VBL', 'PEPSI BOTTLER'] },
  { symbol: 'DEVYANI', name: 'Devyani International Limited', sector: 'QSR Franchises (KFC, Pizza Hut)', aliases: ['DEVYANI', 'KFC INDIA'] },
  { symbol: 'JUBLFOOD', name: 'Jubilant FoodWorks Limited', sector: 'Quick Service Restaurants (Domino’s)', aliases: ['DOMINOS INDIA', 'JUBILANT'] },
  { symbol: 'IRCTC', name: 'Indian Railway Catering and Tourism Corp', sector: 'Railway Ticketing & Tourism', aliases: ['IRCTC', 'RAILWAYS'] },
  { symbol: 'RVNL', name: 'Rail Vikas Nigam Limited', sector: 'Railway Infrastructure Construction', aliases: ['RAIL VIKAS', 'RVNL'] },
  { symbol: 'IRFC', name: 'Indian Railway Finance Corporation', sector: 'Railway Asset Financing', aliases: ['IRFC'] },
  { symbol: 'BSE', name: 'BSE Limited', sector: 'Stock Exchange & Financial Markets', aliases: ['BOMBAY STOCK EXCHANGE', 'BSE'] },
  { symbol: 'CDSL', name: 'Central Depository Services (India) Limited', sector: 'Securities Depository Services', aliases: ['CDSL', 'DEPOSITORY'] },
  { symbol: 'ANGELONE', name: 'Angel One Limited', sector: 'Digital Retail Stock Broking', aliases: ['ANGEL ONE', 'ANGEL BROKING'] },
  { symbol: 'MOTILALOFS', name: 'Motilal Oswal Financial Services', sector: 'Wealth Management & Capital Markets', aliases: ['MOTILAL OSWAL'] },
  { symbol: 'JIOFIN', name: 'Jio Financial Services Limited', sector: 'Digital Lending, AMC & Payments', aliases: ['JFSL', 'JIO FINANCE'] },
  { symbol: 'IREDA', name: 'Indian Renewable Energy Development Agency', sector: 'Clean Energy Infrastructure Financing', aliases: ['IREDA'] },
  { symbol: 'PFC', name: 'Power Finance Corporation Limited', sector: 'Power Infrastructure Lending', aliases: ['PFC'] },
  { symbol: 'RECLTD', name: 'REC Limited', sector: 'Rural Electrification & Power Lending', aliases: ['REC'] },
  { symbol: 'BHEL', name: 'Bharat Heavy Electricals Limited', sector: 'Heavy Engineering & Power Equipment', aliases: ['BHEL'] },
  { symbol: 'ABB', name: 'ABB India Limited', sector: 'Electrification, Automation & Robotics', aliases: ['ABB'] },
  { symbol: 'SIEMENS', name: 'Siemens Limited', sector: 'Industrial Automation & Energy Tech', aliases: ['SIEMENS'] },
  { symbol: 'CUMMINSIND', name: 'Cummins India Limited', sector: 'Diesel Engines & Power Generation', aliases: ['CUMMINS'] },
  { symbol: 'THERMAX', name: 'Thermax Limited', sector: 'Clean Energy & Boiler Engineering', aliases: ['THERMAX'] },
  { symbol: 'APLAPOLLO', name: 'APL Apollo Tubes Limited', sector: 'Structural Steel Tubes', aliases: ['APL APOLLO'] },
  { symbol: 'ASTRAL', name: 'Astral Limited', sector: 'Pipes & Building Materials', aliases: ['ASTRAL PIPES'] },
  { symbol: 'SUPREMEIND', name: 'Supreme Industries Limited', sector: 'Plastic Products & Piping', aliases: ['SUPREME IND'] },
];

// Damerau-Levenshtein distance calculation (handles insertions, deletions, substitutions, and transpositions)
export function damerauLevenshtein(a: string, b: string): number {
  const an = a.length;
  const bn = b.length;
  if (an === 0) return bn;
  if (bn === 0) return an;

  const matrix: number[][] = Array.from({ length: an + 1 }, () => new Array(bn + 1).fill(0));

  for (let i = 0; i <= an; i++) matrix[i][0] = i;
  for (let j = 0; j <= bn; j++) matrix[0][j] = j;

  for (let i = 1; i <= an; i++) {
    for (let j = 1; j <= bn; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );

      // Transposition
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + cost);
      }
    }
  }

  return matrix[an][bn];
}

// Find closest typo match for an unrecognized query
export function findClosestTicker(query: string): SearchResultItem | undefined {
  const clean = query.trim().toUpperCase().replace(/\.(NS|BO)$/, '');
  if (clean.length < 2) return undefined;

  let bestMatch: (typeof POPULAR_NSE_STOCKS)[0] | null = null;
  let bestScore = Infinity;

  for (const stock of POPULAR_NSE_STOCKS) {
    // 1. Direct symbol distance
    const symDist = damerauLevenshtein(clean, stock.symbol);

    // 2. Token match against company name
    const nameTokens = stock.name.toUpperCase().split(/[\s,()\-]+/);
    let minTokenDist = Infinity;
    for (const tok of nameTokens) {
      if (tok.length >= 3) {
        minTokenDist = Math.min(minTokenDist, damerauLevenshtein(clean, tok));
      }
    }

    // 3. Alias distance
    let minAliasDist = Infinity;
    if (stock.aliases) {
      for (const al of stock.aliases) {
        minAliasDist = Math.min(minAliasDist, damerauLevenshtein(clean, al));
      }
    }

    const compositeScore = Math.min(symDist, minTokenDist + 0.6, minAliasDist + 0.4);

    if (compositeScore < bestScore) {
      bestScore = compositeScore;
      bestMatch = stock;
    }
  }

  // Accept suggestions within reasonable edit tolerance (e.g. up to 2.2 edits or 35% string length)
  const maxAllowedEdits = Math.max(2, Math.floor(clean.length * 0.45));
  if (bestMatch && bestScore <= maxAllowedEdits) {
    const isPort = PORTFOLIO_COMPANIES.some((p) => p.symbol === bestMatch!.symbol);
    return {
      ticker: `${bestMatch.symbol}.NS`,
      symbol: bestMatch.symbol,
      name: bestMatch.name,
      sector: bestMatch.sector,
      isPortfolio: isPort,
      isVerified: true,
    };
  }

  return undefined;
}

// Search across Portfolio + Popular Stocks + Live Screener Search API
export async function searchNSEUniverse(query: string): Promise<SearchResponse> {
  const q = query.trim();
  if (!q) {
    return {
      success: true,
      query,
      results: PORTFOLIO_COMPANIES.map((c) => ({
        ticker: c.ticker,
        symbol: c.symbol,
        name: c.name,
        sector: c.sector,
        isPortfolio: true,
        isVerified: true,
      })),
      hasExactMatch: false,
    };
  }

  const qUpper = q.toUpperCase().replace(/\.(NS|BO)$/, '');
  const resultMap = new Map<string, SearchResultItem>();

  // 1. Check Portfolio Companies
  for (const c of PORTFOLIO_COMPANIES) {
    if (
      c.symbol.includes(qUpper) ||
      c.name.toUpperCase().includes(qUpper) ||
      c.ticker.toUpperCase().includes(qUpper)
    ) {
      resultMap.set(c.symbol, {
        ticker: c.ticker,
        symbol: c.symbol,
        name: c.name,
        sector: c.sector,
        isPortfolio: true,
        isVerified: true,
      });
    }
  }

  // 2. Check Curated Universe
  for (const stock of POPULAR_NSE_STOCKS) {
    const symbolMatches = stock.symbol.includes(qUpper);
    const nameMatches = stock.name.toUpperCase().includes(qUpper);
    const aliasMatches = stock.aliases?.some((al) => al.includes(qUpper));

    if (symbolMatches || nameMatches || aliasMatches) {
      if (!resultMap.has(stock.symbol)) {
        resultMap.set(stock.symbol, {
          ticker: `${stock.symbol}.NS`,
          symbol: stock.symbol,
          name: stock.name,
          sector: stock.sector,
          isPortfolio: PORTFOLIO_COMPANIES.some((p) => p.symbol === stock.symbol),
          isVerified: true,
        });
      }
    }
  }

  // 3. Fallback: Query live Screener search API for comprehensive 4,500+ Indian stock coverage
  try {
    const screenerSearchRes = await fetch(
      `https://www.screener.in/api/company/search/?q=${encodeURIComponent(q)}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
        },
        signal: AbortSignal.timeout(2800),
      }
    );

    if (screenerSearchRes.status === 200) {
      const screenerData = await screenerSearchRes.json();
      if (Array.isArray(screenerData)) {
        for (const item of screenerData.slice(0, 8)) {
          if (item.url) {
            // URL format: /company/HAL/consolidated/ or /company/530929/
            const parts = item.url.split('/').filter(Boolean);
            const extractedSymbol = parts[1] || '';
            // Only add if alphanumeric and not purely numeric BSE code if possible
            if (extractedSymbol && !resultMap.has(extractedSymbol.toUpperCase())) {
              resultMap.set(extractedSymbol.toUpperCase(), {
                ticker: `${extractedSymbol.toUpperCase()}.NS`,
                symbol: extractedSymbol.toUpperCase(),
                name: item.name,
                sector: 'NSE / BSE Listed Equity',
                isPortfolio: PORTFOLIO_COMPANIES.some((p) => p.symbol === extractedSymbol.toUpperCase()),
                isVerified: true,
              });
            }
          }
        }
      }
    }
  } catch (err) {
    // Network or timeout graceful fallback
  }

  const results = Array.from(resultMap.values());

  // Check if there is an exact match for the typed query
  const hasExactMatch = results.some((r) => r.symbol === qUpper || r.ticker === `${qUpper}.NS`);

  // If no exact match and results are few or empty, find a typo correction ("Did you mean?")
  let didYouMean: SearchResultItem | undefined;
  if (!hasExactMatch) {
    const suggestion = findClosestTicker(q);
    if (suggestion && suggestion.symbol !== qUpper) {
      didYouMean = suggestion;
    }
  }

  // Prioritize results: exact symbol first, then portfolio, then prefix matches, then substring
  results.sort((a, b) => {
    if (a.symbol === qUpper) return -1;
    if (b.symbol === qUpper) return 1;
    if (a.isPortfolio && !b.isPortfolio) return -1;
    if (!a.isPortfolio && b.isPortfolio) return 1;
    if (a.symbol.startsWith(qUpper) && !b.symbol.startsWith(qUpper)) return -1;
    if (!a.symbol.startsWith(qUpper) && b.symbol.startsWith(qUpper)) return 1;
    return a.symbol.localeCompare(b.symbol);
  });

  return {
    success: true,
    query: q,
    results: results.slice(0, 10),
    didYouMean,
    hasExactMatch,
  };
}
