import { NextResponse } from 'next/server';
import { searchNSEUniverse } from '@/lib/tickerSearch';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    const searchResult = await searchNSEUniverse(query);

    return NextResponse.json(searchResult);
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_')) throw error;
    console.error('Error in /api/search:', error);
    return NextResponse.json(
      { success: false, error: 'Search failed' },
      { status: 500 }
    );
  }
}
