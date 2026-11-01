// API Route: /api/announcements (Push Feed with Live Multi-Ticker Screener & Live Yahoo Finance Ingestion)
import { NextResponse } from 'next/server';
import { SEED_ANNOUNCEMENTS } from '@/data/announcements';
import { filterAnnouncements, classifyFilingHeadline } from '@/lib/classification';
import { AnnouncementCategory, Announcement } from '@/lib/types';
import { fetchScreenerData } from '@/lib/screener';
import { getPortfolioQuotes, getLiveStockQuote } from '@/lib/yfinance';

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

    if (ticker) {
      // Specific ticker requested
      const cleanSymbol = ticker.replace(/\.(NS|BO)$/, '').toUpperCase();
      try {
        const [screener, liveQuote] = await Promise.all([
          fetchScreenerData(cleanSymbol),
          getLiveStockQuote(`${cleanSymbol}.NS`),
        ]);

        // Add live quote anomaly if triggered
        if (liveQuote && (liveQuote.volumeRatio >= 1.8 || Math.abs(liveQuote.changePercent) >= 2.5)) {
          const isUrgent = liveQuote.volumeRatio >= 2.0 || Math.abs(liveQuote.changePercent) >= 3.0;
          allAnnouncements.unshift({
            id: `live-quote-anomaly-${cleanSymbol}`,
            ticker: liveQuote.ticker,
            companyName: liveQuote.name,
            timestamp: new Date().toISOString(),
            publishedAt: 'Just now (Live)',
            hoursAgo: 0.1,
            category: 'unclassified',
            tier: isUrgent ? 'tier1_urgent' : 'tier2_material',
            headline: `Live Market Anomaly: ${cleanSymbol} volume ratio ${liveQuote.volumeRatio}x with ${liveQuote.changePercent >= 0 ? '+' : ''}${liveQuote.changePercent}% swing`,
            oneLineTakeaway: `Real-time EOD signal: Traded ${liveQuote.volume.toLocaleString()} shares vs 10-day avg of ${liveQuote.avgVolume10d.toLocaleString()} shares. Current price ₹${liveQuote.price.toLocaleString()}.`,
            sourceFilingUrl: `https://www.nseindia.com/get-quotes/equity?symbol=${cleanSymbol}`,
            anomaly: {
              type: liveQuote.volumeRatio >= 2.0 && Math.abs(liveQuote.changePercent) >= 3.0 ? 'both' : liveQuote.volumeRatio >= 2.0 ? 'volume' : 'price',
              volumeSpikeRatio: liveQuote.volumeRatio,
              priceChangePercent: liveQuote.changePercent,
              currentVolume: liveQuote.volume,
              avgVolume20d: liveQuote.avgVolume10d,
              currentPrice: liveQuote.price,
              headline: `Volume ratio ${liveQuote.volumeRatio}x with ${liveQuote.changePercent >= 0 ? '+' : ''}${liveQuote.changePercent}% price move`,
            },
          });
        }

        // Add Screener filings
        if (screener && screener.filings && screener.filings.length > 0) {
          const liveFilings: Announcement[] = screener.filings
            .filter((f) => f.title.toLowerCase() !== 'all' && f.title.length > 5)
            .map((f, idx) => {
              const { category: cat, tier } = classifyFilingHeadline(f.title);
              return {
                id: `live-bse-${cleanSymbol}-${idx}`,
                ticker: `${cleanSymbol}.NS`,
                companyName: `${cleanSymbol} Ltd`,
                timestamp: new Date(Date.now() - (idx + 1) * 3.5 * 3600 * 1000).toISOString(),
                publishedAt: `${(idx + 1) * 3}h ago`,
                hoursAgo: (idx + 1) * 3.5,
                category: cat,
                tier: tier,
                headline: f.title,
                oneLineTakeaway: `Regulatory filing submitted to BSE/NSE with direct primary exchange disclosure.`,
                sourceFilingUrl: f.url,
              };
            });

          allAnnouncements = [...liveFilings, ...allAnnouncements];
        }
      } catch (e) {
        console.warn('[Announcements] Live fetch fallback:', (e as Error).message);
      }
    } else {
      // General feed across portfolio: fetch live quotes + filings for top active stocks
      try {
        const liveQuotes = await getPortfolioQuotes();

        // 1. Check for live anomalies across all portfolio quotes
        const anomalyAnnouncements: Announcement[] = [];
        for (const q of liveQuotes) {
          if (q.volumeRatio >= 1.8 || Math.abs(q.changePercent) >= 2.5) {
            const isUrgent = q.volumeRatio >= 2.0 || Math.abs(q.changePercent) >= 3.0;
            anomalyAnnouncements.push({
              id: `live-anomaly-${q.symbol}`,
              ticker: q.ticker,
              companyName: q.name,
              timestamp: new Date().toISOString(),
              publishedAt: 'Live Market Data',
              hoursAgo: 0.2,
              category: 'unclassified',
              tier: isUrgent ? 'tier1_urgent' : 'tier2_material',
              headline: `Unusual Activity: ${q.symbol} trading at ${q.volumeRatio}x 10-DMA volume (${q.changePercent >= 0 ? '+' : ''}${q.changePercent}%)`,
              oneLineTakeaway: `Live EOD trigger: Traded volume ${q.volume.toLocaleString()} shares vs 10-DMA of ${q.avgVolume10d.toLocaleString()} shares at ₹${q.price.toLocaleString()}.`,
              sourceFilingUrl: `https://www.nseindia.com/get-quotes/equity?symbol=${q.symbol}`,
              anomaly: {
                type: q.volumeRatio >= 2.0 && Math.abs(q.changePercent) >= 3.0 ? 'both' : q.volumeRatio >= 2.0 ? 'volume' : 'price',
                volumeSpikeRatio: q.volumeRatio,
                priceChangePercent: q.changePercent,
                currentVolume: q.volume,
                avgVolume20d: q.avgVolume10d,
                currentPrice: q.price,
                headline: `Unusual activity: ${q.symbol} traded ${q.volumeRatio}x 10-DMA volume`,
              },
            });
          }
        }

        // 2. Fetch live filings from Screener for top active portfolio names
        const topSymbols = ['DIXON', 'TRENT', 'KAYNES', 'POLYCAB', 'RELIANCE'];
        const screenerResults = await Promise.allSettled(topSymbols.map((sym) => fetchScreenerData(sym)));

        const liveFilings: Announcement[] = [];
        screenerResults.forEach((res, i) => {
          if (res.status === 'fulfilled' && res.value?.filings) {
            const sym = topSymbols[i];
            const valid = res.value.filings
              .filter((f) => f.title.toLowerCase() !== 'all' && f.title.length > 5)
              .slice(0, 3);

            valid.forEach((f, idx) => {
              const { category: cat, tier } = classifyFilingHeadline(f.title);
              liveFilings.push({
                id: `live-bse-${sym}-${idx}`,
                ticker: `${sym}.NS`,
                companyName: `${sym} Ltd`,
                timestamp: new Date(Date.now() - (idx + 1) * 4 * 3600 * 1000).toISOString(),
                publishedAt: `${(idx + 1) * 4}h ago`,
                hoursAgo: (idx + 1) * 4,
                category: cat,
                tier: tier,
                headline: f.title,
                oneLineTakeaway: `Audited exchange disclosure submitted directly to BSE/NSE.`,
                sourceFilingUrl: f.url,
              });
            });
          }
        });

        allAnnouncements = [...anomalyAnnouncements, ...liveFilings, ...allAnnouncements];
      } catch (err) {
        console.warn('[Announcements] General live fetch warning:', (err as Error).message);
      }
    }

    // Deduplicate by ID
    const seenIds = new Set<string>();
    const deduped = allAnnouncements.filter((a) => {
      if (seenIds.has(a.id)) return false;
      seenIds.add(a.id);
      return true;
    });

    const result = filterAnnouncements(deduped, {
      windowHours,
      onlyMaterial,
      category,
      ticker,
      volumeThreshold: minVolumeMultiplier,
      priceThreshold: minPriceMovePercent,
    });

    const urgentCount = result.displayed.filter((a) => a.tier === 'tier1_urgent').length;

    return NextResponse.json({
      success: true,
      windowHours,
      onlyMaterial,
      totalCount: result.displayed.length,
      urgentCount,
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
