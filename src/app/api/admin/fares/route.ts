import { NextRequest, NextResponse } from 'next/server';
import { db, initDb } from '@/lib/db';
import { fareRules } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { invalidateRulesCache } from '@/lib/services/fares';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

function verifyAdminAuth(req: NextRequest): boolean {
  const adminSecret = process.env.ADMIN_SECRET || 'commuteph-secret-key-2026';
  const authHeader = req.headers.get('authorization');
  const customHeader = req.headers.get('x-admin-secret');

  if (customHeader && customHeader === adminSecret) {
    return true;
  }

  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (token === adminSecret) {
      return true;
    }
  }

  // Also check cookie for convenience in admin page
  const cookieSecret = req.cookies.get('admin_secret')?.value;
  if (cookieSecret && cookieSecret === adminSecret) {
    return true;
  }

  return false;
}

export async function GET(req: NextRequest) {
  if (!verifyAdminAuth(req)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Invalid ADMIN_SECRET' },
      { status: 401 }
    );
  }

  try {
    await initDb();
    const rows = await db.select().from(fareRules);
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching admin fares:', error);
    return NextResponse.json(
      { success: false, error: 'Database error fetching fares' },
      { status: 500 }
    );
  }
}

const UpdateFareSchema = z.object({
  id: z.string(),
  name: z.string().min(2),
  category: z.string(),
  baseFare: z.number().nonnegative(),
  baseDistanceKm: z.number().nonnegative(),
  perKmRate: z.number().nonnegative(),
  bookingFee: z.number().nonnegative().optional().default(0),
  minFare: z.number().nonnegative().optional().nullable(),
  maxFare: z.number().nonnegative().optional().nullable(),
  perMinuteRate: z.number().nonnegative().optional().default(0),
  discountEligible: z.boolean(),
  discountPercentage: z.number().min(0).max(1).optional().default(0.20),
  estimatedSpeedKmh: z.number().positive(),
  isVerified: z.boolean(),
  source: z.string().min(2),
  assumptions: z.string().min(2),
  isActive: z.boolean().default(true),
});

export async function PUT(req: NextRequest) {
  if (!verifyAdminAuth(req)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Invalid ADMIN_SECRET' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const parsed = UpdateFareSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const item = parsed.data;

    await db
      .update(fareRules)
      .set({
        name: item.name,
        category: item.category,
        baseFare: item.baseFare,
        baseDistanceKm: item.baseDistanceKm,
        perKmRate: item.perKmRate,
        bookingFee: item.bookingFee ?? 0,
        minFare: item.minFare,
        maxFare: item.maxFare,
        perMinuteRate: item.perMinuteRate ?? 0,
        discountEligible: item.discountEligible,
        discountPercentage: item.discountPercentage ?? 0.20,
        estimatedSpeedKmh: item.estimatedSpeedKmh,
        isVerified: item.isVerified,
        source: item.source,
        assumptions: item.assumptions,
        isActive: item.isActive,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(fareRules.id, item.id));

    invalidateRulesCache();

    return NextResponse.json({
      success: true,
      message: `Successfully updated fare rule for ${item.name}`,
    });
  } catch (error) {
    console.error('Error updating admin fare rule:', error);
    return NextResponse.json(
      { success: false, error: 'Database error updating fare rule' },
      { status: 500 }
    );
  }
}
