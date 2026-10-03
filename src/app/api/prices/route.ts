import { NextResponse } from 'next/server';
import { getActiveFareRules } from '@/lib/services/fares';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rules = await getActiveFareRules();

    return NextResponse.json(
      {
        success: true,
        count: rules.length,
        data: rules,
        updatedAt: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching fare prices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve active fare rules.' },
      { status: 500 }
    );
  }
}
