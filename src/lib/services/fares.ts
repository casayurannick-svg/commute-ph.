import { db, initDb } from '../db';
import { fareRules } from '../schema';
import { eq } from 'drizzle-orm';
import { FareRule, TransitCategory } from '../engine/types';

let cachedRules: FareRule[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory cache

export async function getActiveFareRules(forceRefresh = false): Promise<FareRule[]> {
  const now = Date.now();
  if (!forceRefresh && cachedRules && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedRules;
  }

  try {
    await initDb();
    const rows = await db
      .select()
      .from(fareRules)
      .where(eq(fareRules.isActive, true));

    const mapped: FareRule[] = rows.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category as TransitCategory,
      baseFare: r.baseFare,
      baseDistanceKm: r.baseDistanceKm,
      perKmRate: r.perKmRate,
      bookingFee: r.bookingFee ?? 0,
      minFare: r.minFare ?? undefined,
      maxFare: r.maxFare ?? undefined,
      perMinuteRate: r.perMinuteRate ?? 0,
      discountEligible: Boolean(r.discountEligible),
      discountPercentage: r.discountPercentage ?? 0.2,
      estimatedSpeedKmh: r.estimatedSpeedKmh,
      isVerified: Boolean(r.isVerified),
      source: r.source,
      assumptions: r.assumptions,
      routeType: r.routeType ?? 'city',
      isActive: Boolean(r.isActive),
    }));

    cachedRules = mapped;
    lastFetchTime = now;
    return mapped;
  } catch (error) {
    console.error('Failed to query fare rules from DB:', error);
    if (cachedRules) return cachedRules;
    throw error;
  }
}

export function invalidateRulesCache() {
  cachedRules = null;
  lastFetchTime = 0;
}
