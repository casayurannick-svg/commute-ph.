import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { compareModes } from '@/lib/engine/compare';
import { getActiveFareRules } from '@/lib/services/fares';
import { FareRule, PassengerProfile, TransitCategory, SortOption } from '@/lib/engine/types';

export const dynamic = 'force-dynamic';

const FareRuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(['jeepney', 'bus', 'rail', 'uv', 'ride_hail', 'tricycle']),
  baseFare: z.number().nonnegative(),
  baseDistanceKm: z.number().nonnegative(),
  perKmRate: z.number().nonnegative(),
  bookingFee: z.number().nonnegative().optional(),
  minFare: z.number().nonnegative().optional(),
  maxFare: z.number().nonnegative().optional(),
  perMinuteRate: z.number().nonnegative().optional(),
  discountEligible: z.boolean(),
  discountPercentage: z.number().min(0).max(1).optional(),
  estimatedSpeedKmh: z.number().positive(),
  isVerified: z.boolean(),
  source: z.string(),
  assumptions: z.string(),
  isActive: z.boolean().optional(),
  routeType: z.string().optional(),
});

const CompareRequestSchema = z.object({
  distanceKm: z.coerce
    .number()
    .min(0.1, 'Distance must be at least 0.1 km')
    .max(300, 'Distance must not exceed 300 km'),
  profile: z
    .enum(['regular', 'student', 'senior', 'pwd'] as const)
    .default('regular'),
  durationMinutes: z.coerce.number().positive().optional(),
  trafficMultiplier: z.coerce.number().min(0.5).max(3.5).optional().default(1.0),
  sortBy: z
    .enum(['cost_asc', 'cost_desc', 'speed_asc'] as const)
    .default('cost_asc'),
  filterCategories: z
    .array(z.enum(['jeepney', 'bus', 'rail', 'uv', 'ride_hail', 'tricycle']))
    .optional(),
  onlyVerified: z.boolean().optional(),
  rules: z.array(FareRuleSchema).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parseResult = CompareRequestSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          issues: parseResult.error.issues.map((i) => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const {
      distanceKm,
      profile,
      durationMinutes,
      trafficMultiplier,
      sortBy,
      filterCategories,
      onlyVerified,
      rules: clientRules,
    } = parseResult.data;

    // Use client provided cached rules or fetch active rules from DB (NO DB WRITES)
    const activeRules: FareRule[] =
      clientRules && clientRules.length > 0
        ? (clientRules as FareRule[])
        : await getActiveFareRules();

    const comparison = compareModes(
      activeRules,
      {
        distanceKm,
        profile: profile as PassengerProfile,
        durationMinutes,
        trafficMultiplier,
      },
      {
        sortBy: sortBy as SortOption,
        filterCategories: filterCategories as TransitCategory[] | undefined,
        onlyVerified,
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        trip: comparison.trip,
        results: comparison.results,
        cheapest: comparison.cheapest,
        fastest: comparison.fastest,
        totalModesEvaluated: comparison.results.length,
      },
      evaluatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in /api/compare:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An internal error occurred while calculating transit fares.',
      },
      { status: 500 }
    );
  }
}
