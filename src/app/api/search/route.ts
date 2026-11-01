import { NextResponse } from 'next/server';
import { PORTFOLIO_COMPANIES } from '@/data/portfolio';
import { getLiveStockQuote } from '@/lib/yfinance';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('q') || '').trim().toUpperCase();

    if (!query) {
      return NextResponse.json({ success: true, results: [] });
    }

    // Match against seed companies first
    const matches = PORTFOLIO_COMPANIES.filter(
      (c) =>
        c.symbol.includes(query) ||
        c.name.toUpperCase().includes(query) ||
        c.ticker.includes(query)
    ).map((c) => ({
      ticker: c.ticker,
      symbol: c.symbol,
      name: c.name,
      sector: c.sector,
      isPortfolio: c.isPortfolio,
      isCustom: false,
    }));

    // If query is 2+ chars and not an exact match, offer dynamic NSE lookup
    const exactMatch = matches.find((m) => m.symbol === query || m.ticker === `${query}.NS`);
    if (!exactMatch && query.length >= 2) {
      const liveCandidate = `${query}.NS`;
      matches.unshift({
        ticker: liveCandidate,
        symbol: query,
        name: `${query} (NSE Listed Equity)`,
        sector: 'On-Demand Dynamic Analysis',
        isPortfolio: false,
        isCustom: true,
      });
    }

    return NextResponse.json({ success: true, results: matches.slice(0, 8) });
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_')) throw error;
    console.error('Error in /api/search:', error);
    return NextResponse.json(
      { success: false, error: 'Search failed' },
      { status: 500 }
    );
  }
}
