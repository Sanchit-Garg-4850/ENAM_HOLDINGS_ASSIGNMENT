import { NextResponse } from 'next/server';
import { SEED_ANNOUNCEMENTS } from '@/data/announcements';
import { filterAnnouncements } from '@/lib/classification';
import { AnnouncementCategory } from '@/lib/types';

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

    const result = filterAnnouncements(SEED_ANNOUNCEMENTS, {
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
