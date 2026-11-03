import { NextRequest, NextResponse } from 'next/server';
import { fetchSebiRegulatoryRss } from '@/lib/rss';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryFilter = searchParams.get('category'); // e.g. 'Adjudication Order'
    const limit = parseInt(searchParams.get('limit') || '25', 10);

    const allItems = await fetchSebiRegulatoryRss();

    let filtered = allItems;
    if (categoryFilter && categoryFilter !== 'ALL') {
      filtered = allItems.filter(
        (item) => item.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    const items = filtered.slice(0, limit);

    return NextResponse.json(
      {
        success: true,
        source: 'SEBI (Securities and Exchange Board of India)',
        officialUrl: 'https://www.sebi.gov.in/sebirss.xml',
        totalAvailable: allItems.length,
        count: items.length,
        data: items,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
        },
      }
    );
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_')) throw error;
    console.error('Regulatory RSS API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch regulatory RSS feed',
      },
      { status: 500 }
    );
  }
}
