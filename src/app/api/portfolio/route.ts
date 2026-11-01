import { NextResponse } from 'next/server';
import { getPortfolioQuotes, getLiveStockQuote } from '@/lib/yfinance';
import { PORTFOLIO_COMPANIES } from '@/data/portfolio';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get('ticker');

    if (ticker) {
      const quote = await getLiveStockQuote(ticker);
      return NextResponse.json({ success: true, data: quote });
    }

    const quotes = await getPortfolioQuotes();
    return NextResponse.json({
      success: true,
      count: quotes.length,
      data: quotes,
      summary: {
        portfolioCount: quotes.filter((q) => q.isPortfolio).length,
        adHocCount: quotes.filter((q) => !q.isPortfolio).length,
        advancers: quotes.filter((q) => q.changePercent > 0).length,
        decliners: quotes.filter((q) => q.changePercent < 0).length,
      },
    });
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_')) throw error;
    console.error('Error fetching portfolio quotes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve stock quotes' },
      { status: 500 }
    );
  }
}
