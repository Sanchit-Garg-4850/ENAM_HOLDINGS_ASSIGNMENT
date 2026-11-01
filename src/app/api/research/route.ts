import { NextResponse } from 'next/server';
import { getCompanyDiligence } from '@/lib/primaryAnalyzer';
import { getLiveStockQuote } from '@/lib/yfinance';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get('ticker') || 'TRENT.NS';

    const [diligence, quote] = await Promise.all([
      getCompanyDiligence(ticker),
      getLiveStockQuote(ticker),
    ]);

    return NextResponse.json({
      success: true,
      ticker: quote.ticker,
      quote,
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
