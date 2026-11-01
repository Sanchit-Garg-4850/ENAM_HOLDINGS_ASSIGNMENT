// API Route: /api/announcements (Push Feed with Live Screener Primary Filings)
import { NextResponse } from 'next/server';
import { SEED_ANNOUNCEMENTS } from '@/data/announcements';
import { filterAnnouncements, classifyFilingHeadline } from '@/lib/classification';
import { AnnouncementCategory, Announcement } from '@/lib/types';
import { fetchScreenerData } from '@/lib/screener';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const windowHours = Number(searchParams.get('windowHours') || '24');
    const onlyMaterial = searchParams.get('onlyMaterial') !== 'false'; // default true
    const category = (searchParams.get('category') as AnnouncementCategory) || undefined;
    const ticker = searchParams.get('ticker') || undefined;
    const minVolumeMultiplier = searchParams.get('minVolumeMultiplier')
      ? Number(searchParams.get('minVolumeMultiplier'))
      : undefined;
    const minPriceMovePercent = searchParams.get('minPriceMovePercent')
      ? Number(searchParams.get('minPriceMovePercent'))
      : undefined;

    let allAnnouncements = [...SEED_ANNOUNCEMENTS];

    // If a specific ticker was requested, also try fetching real live filings from Screener
    if (ticker) {
      const cleanSymbol = ticker.replace(/\.(NS|BO)$/, '').toUpperCase();
      try {
        const screener = await fetchScreenerData(cleanSymbol);
        if (screener && screener.filings && screener.filings.length > 0) {
          const liveAnnouncements: Announcement[] = screener.filings.map((f, idx) => {
            const { category: cat, tier } = classifyFilingHeadline(f.title);
            return {
              id: `live-bse-${cleanSymbol}-${idx}`,
              ticker: `${cleanSymbol}.NS`,
              companyName: `${cleanSymbol} Ltd`,
              timestamp: new Date(Date.now() - (idx + 1) * 3 * 3600 * 1000).toISOString(),
              publishedAt: `${(idx + 1) * 3}h ago`,
              hoursAgo: (idx + 1) * 3,
              category: cat,
              tier: tier,
              headline: f.title,
              oneLineTakeaway: `Regulatory filing submitted to exchange with direct primary disclosure.`,
              sourceFilingUrl: f.url,
            };
          });

          // Prepend live filings
          allAnnouncements = [...liveAnnouncements, ...allAnnouncements];
        }
      } catch (e) {
        console.warn('[Announcements] Live fetch fallback:', (e as Error).message);
      }
    }

    const result = filterAnnouncements(allAnnouncements, {
      windowHours,
      onlyMaterial,
      category,
      ticker,
      volumeThreshold: minVolumeMultiplier,
      priceThreshold: minPriceMovePercent,
    });

    return NextResponse.json({
      success: true,
      windowHours,
      onlyMaterial,
      totalCount: result.displayed.length,
      collapsedRoutineCount: result.collapsedRoutineCount,
      data: result.displayed,
    });
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_')) throw error;
    console.error('Error in /api/announcements:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process announcements' },
      { status: 500 }
    );
  }
}
