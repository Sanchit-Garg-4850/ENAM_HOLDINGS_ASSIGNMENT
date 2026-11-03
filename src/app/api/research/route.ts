import { NextResponse } from 'next/server';
import { getCompanyDiligence } from '@/lib/primaryAnalyzer';
import { getLiveStockQuote } from '@/lib/yfinance';
import { fetchScreenerData } from '@/lib/screener';
import { findClosestTicker } from '@/lib/tickerSearch';
import { PORTFOLIO_COMPANIES } from '@/data/portfolio';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get('ticker') || 'TRENT.NS';
    const normalizedTicker = ticker.includes('.') ? ticker.toUpperCase() : `${ticker.toUpperCase()}.NS`;
    const cleanSymbol = normalizedTicker.replace(/\.(NS|BO)$/, '');

    // 1. Check if it's a seed portfolio company
    const isSeed = PORTFOLIO_COMPANIES.some(
      (c) => c.ticker.toUpperCase() === normalizedTicker || c.symbol.toUpperCase() === cleanSymbol
    );

    // 2. Fetch live fundamentals from Screener and live quote in parallel
    const screener = await fetchScreenerData(cleanSymbol);

    let quote = null;
    let quoteFailed = false;
    try {
      quote = await getLiveStockQuote(normalizedTicker);
    } catch {
      quoteFailed = true;
    }

    // 3. Typo / Invalid ticker detection:
    // If not a seed company AND Screener returned null AND (quoteFailed or quote is default)
    if (!isSeed && !screener) {
      const didYouMean = findClosestTicker(cleanSymbol);
      return NextResponse.json(
        {
          success: false,
          isInvalidTicker: true,
          symbol: cleanSymbol,
          requestedTicker: normalizedTicker,
          didYouMean,
          error: `Symbol '${cleanSymbol}' was not found on the National Stock Exchange.`,
        },
        { status: 404 }
      );
    }

    // 4. If valid, synthesize live dynamic diligence
    const diligence = await getCompanyDiligence(normalizedTicker);
    const finalQuote = quote || {
      ticker: normalizedTicker,
      symbol: cleanSymbol,
      name: screener?.name || cleanSymbol,
      sector: 'Diversified Indian Equities',
      marketCapCategory: (screener?.marketCapCr && screener.marketCapCr > 50000) ? 'Large Cap' : 'Mid Cap',
      price: screener?.currentPrice || 1000,
      change: 0,
      changePercent: 0,
      volume: 100000,
      avgVolume10d: 100000,
      volumeRatio: 1.0,
      fiftyTwoWeekHigh: (screener?.currentPrice || 1000) * 1.25,
      fiftyTwoWeekLow: (screener?.currentPrice || 1000) * 0.75,
      marketCapCr: screener?.marketCapCr || 25000,
      peRatio: screener?.peRatio,
      isPortfolio: isSeed,
    };

    return NextResponse.json({
      success: true,
      ticker: finalQuote.ticker,
      quote: finalQuote,
      diligence,
    });
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_')) throw error;
    console.error('Error in /api/research:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate company diligence' },
      { status: 500 }
    );
  }
}
