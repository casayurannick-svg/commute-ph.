import 'dotenv/config';
import { db, initDb } from '../src/lib/db';
import { fareRules } from '../src/lib/schema';
import { sql } from 'drizzle-orm';

interface SeedFareItem {
  id: string;
  name: string;
  category: 'jeepney' | 'bus' | 'rail' | 'uv' | 'ride_hail' | 'tricycle';
  baseFare: number;
  baseDistanceKm: number;
  perKmRate: number;
  bookingFee?: number;
  minFare?: number;
  maxFare?: number;
  perMinuteRate?: number;
  discountEligible: boolean;
  discountPercentage?: number;
  estimatedSpeedKmh: number;
  isVerified: boolean;
  source: string;
  assumptions: string;
  routeType?: string;
}

const ncrFareData: SeedFareItem[] = [
  {
    id: 'puj_traditional',
    name: 'Traditional Jeepney',
    category: 'jeepney',
    baseFare: 13.0,
    baseDistanceKm: 4.0,
    perKmRate: 1.8,
    bookingFee: 0,
    minFare: 13.0,
    discountEligible: true,
    discountPercentage: 0.2,
    estimatedSpeedKmh: 14,
    isVerified: true,
    source: 'LTFRB Board Resolution No. 2023-035',
    assumptions: 'Official LTFRB NCR rate. Cash payment; open-air ventilation; stops anywhere along designated route.',
    routeType: 'city',
  },
  {
    id: 'puj_modern',
    name: 'Modern PUJ / E-Jeepney',
    category: 'jeepney',
    baseFare: 15.0,
    baseDistanceKm: 4.0,
    perKmRate: 2.2,
    bookingFee: 0,
    minFare: 15.0,
    discountEligible: true,
    discountPercentage: 0.2,
    estimatedSpeedKmh: 16,
    isVerified: true,
    source: 'LTFRB Board Resolution No. 2023-035',
    assumptions: 'Official LTFRB modern PUV rate. Air-conditioned, Beep card / Cash payment, designated stops.',
    routeType: 'city',
  },
  {
    id: 'bus_ordinary',
    name: 'Ordinary City Bus',
    category: 'bus',
    baseFare: 15.0,
    baseDistanceKm: 5.0,
    perKmRate: 2.25,
    bookingFee: 0,
    minFare: 15.0,
    discountEligible: true,
    discountPercentage: 0.2,
    estimatedSpeedKmh: 17,
    isVerified: true,
    source: 'LTFRB Approved City Bus Fare Matrix 2023',
    assumptions: 'Official LTFRB city bus non-aircon rate. Conductor-issued ticket; cash payment.',
    routeType: 'city',
  },
  {
    id: 'bus_aircon',
    name: 'Aircon City Bus',
    category: 'bus',
    baseFare: 17.0,
    baseDistanceKm: 5.0,
    perKmRate: 2.65,
    bookingFee: 0,
    minFare: 17.0,
    discountEligible: true,
    discountPercentage: 0.2,
    estimatedSpeedKmh: 19,
    isVerified: true,
    source: 'LTFRB Approved City Bus Fare Matrix 2023',
    assumptions: 'Official LTFRB air-conditioned bus rate. Beep or cash payment with bus conductor.',
    routeType: 'city',
  },
  {
    id: 'uv_express',
    name: 'UV Express (Point-to-Point Van)',
    category: 'uv',
    baseFare: 15.0,
    baseDistanceKm: 4.0,
    perKmRate: 2.0,
    bookingFee: 0,
    minFare: 15.0,
    discountEligible: true,
    discountPercentage: 0.2,
    estimatedSpeedKmh: 22,
    isVerified: true,
    source: 'LTFRB Memorandum Circular No. 2023-037',
    assumptions: 'Official base rate for UV Express services in NCR. Terminal-to-terminal point-to-point service.',
    routeType: 'city',
  },
  {
    id: 'mrt_3',
    name: 'MRT-3 (EDSA Line)',
    category: 'rail',
    baseFare: 13.0,
    baseDistanceKm: 0.0,
    perKmRate: 1.0,
    minFare: 13.0,
    maxFare: 28.0,
    discountEligible: true,
    discountPercentage: 0.2,
    estimatedSpeedKmh: 32,
    isVerified: true,
    source: 'DOTr MRT-3 Official Fare Matrix',
    assumptions: 'Official DOTr tariff: ₱13 boarding base + ₱1.00/km up to ₱28 maximum fare cap. Avoids road gridlock.',
    routeType: 'rail',
  },
  {
    id: 'lrt_1',
    name: 'LRT-1 (Cavite Extension / Roosevelt-Dr. Santos)',
    category: 'rail',
    baseFare: 15.0,
    baseDistanceKm: 0.0,
    perKmRate: 1.21,
    minFare: 15.0,
    maxFare: 35.0,
    discountEligible: true,
    discountPercentage: 0.2,
    estimatedSpeedKmh: 30,
    isVerified: true,
    source: 'DOTr & Light Rail Manila Corp (LRMC) Approved Matrix',
    assumptions: 'Official DOTr tariff: ₱15 boarding base + ₱1.21/km up to ₱35 max cap. Stored-value card rate.',
    routeType: 'rail',
  },
  {
    id: 'lrt_2',
    name: 'LRT-2 (Antipolo to Recto)',
    category: 'rail',
    baseFare: 14.0,
    baseDistanceKm: 0.0,
    perKmRate: 1.1,
    minFare: 14.0,
    maxFare: 33.0,
    discountEligible: true,
    discountPercentage: 0.2,
    estimatedSpeedKmh: 35,
    isVerified: true,
    source: 'LRTA Official Fare Matrix',
    assumptions: 'Official LRTA tariff: ₱14 boarding base + ₱1.10/km up to ₱33 max cap. High capacity east-west line.',
    routeType: 'rail',
  },
  {
    id: 'taxi_metered',
    name: 'Regular Metered Taxi',
    category: 'ride_hail',
    baseFare: 45.0,
    baseDistanceKm: 0.5,
    perKmRate: 13.5,
    bookingFee: 0,
    minFare: 45.0,
    perMinuteRate: 2.0,
    discountEligible: true,
    discountPercentage: 0.2,
    estimatedSpeedKmh: 16,
    isVerified: true,
    source: 'LTFRB Nationwide Taxi Fare Order',
    assumptions: 'Official flagdown ₱45 + ₱13.50/km + ₱2.00/min waiting charge. Street hailed.',
    routeType: 'taxi',
  },
  {
    id: 'mc_taxi_pilot',
    name: 'Motorcycle Taxi (Angkas / JoyRide / MoveIt)',
    category: 'ride_hail',
    baseFare: 50.0,
    baseDistanceKm: 1.0,
    perKmRate: 12.0,
    bookingFee: 15.0,
    minFare: 50.0,
    discountEligible: true,
    discountPercentage: 0.2,
    estimatedSpeedKmh: 24,
    isVerified: false,
    source: 'LTFRB MC Taxi Technical Working Group [Unverified Placeholder]',
    assumptions: '[UNVERIFIED PLACEHOLDER] Approximates NCR pilot guidelines: ₱50 base for 1st km + ~₱12/km. Dynamic surge and ₱15 booking fee are subject to platform algorithms.',
    routeType: 'ride_hail',
  },
  {
    id: 'grab_car_4s',
    name: 'Ride-Hailing Car (GrabCar 4-Seater)',
    category: 'ride_hail',
    baseFare: 45.0,
    baseDistanceKm: 1.0,
    perKmRate: 16.0,
    bookingFee: 45.0,
    minFare: 90.0,
    perMinuteRate: 2.0,
    discountEligible: true,
    discountPercentage: 0.2,
    estimatedSpeedKmh: 17,
    isVerified: false,
    source: 'LTFRB TNVS Fare Guideline [Unverified Dynamic Placeholder]',
    assumptions: '[UNVERIFIED PLACEHOLDER] Standard 4-seater TNVS baseline: ₱45 base + ₱16/km + ₱2/min. Platform booking fee ₱45 and surge pricing vary heavily by demand.',
    routeType: 'ride_hail',
  },
  {
    id: 'tricycle_feeder',
    name: 'Barangay Feeder Tricycle',
    category: 'tricycle',
    baseFare: 15.0,
    baseDistanceKm: 1.0,
    perKmRate: 5.0,
    bookingFee: 0,
    minFare: 15.0,
    discountEligible: true,
    discountPercentage: 0.2,
    estimatedSpeedKmh: 12,
    isVerified: false,
    source: 'Metro Manila TODA Average [Unverified Placeholder]',
    assumptions: '[UNVERIFIED PLACEHOLDER] Regulated per LGU ordinance by respective city/barangay TODA. Rates are for regular shared ride; special trips cost significantly more.',
    routeType: 'tricycle',
  },
  {
    id: 'pnr_nscr_placeholder',
    name: 'PNR / NSCR Commuter Rail',
    category: 'rail',
    baseFare: 15.0,
    baseDistanceKm: 0.0,
    perKmRate: 1.25,
    minFare: 15.0,
    maxFare: 45.0,
    discountEligible: true,
    discountPercentage: 0.2,
    estimatedSpeedKmh: 45,
    isVerified: false,
    source: 'DOTr North-South Commuter Rail Tariffs [Unverified Placeholder]',
    assumptions: '[UNVERIFIED PLACEHOLDER] Modernized commuter rail corridor currently under active construction. Rate estimates based on preliminary DOTr tariff schedule.',
    routeType: 'rail',
  },
];

async function seed() {
  console.log('🌱 Initializing database and ensuring tables exist...');
  await initDb();

  console.log(`📦 Seeding ${ncrFareData.length} NCR transit fare rules into Turso/SQLite...`);

  for (const item of ncrFareData) {
    await db
      .insert(fareRules)
      .values({
        id: item.id,
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
        discountPercentage: item.discountPercentage ?? 0.2,
        estimatedSpeedKmh: item.estimatedSpeedKmh,
        isVerified: item.isVerified,
        source: item.source,
        assumptions: item.assumptions,
        routeType: item.routeType ?? 'city',
        isActive: true,
        updatedAt: new Date().toISOString(),
      })
      .onConflictDoUpdate({
        target: fareRules.id,
        set: {
          name: sql`excluded.name`,
          category: sql`excluded.category`,
          baseFare: sql`excluded.base_fare`,
          baseDistanceKm: sql`excluded.base_distance_km`,
          perKmRate: sql`excluded.per_km_rate`,
          bookingFee: sql`excluded.booking_fee`,
          minFare: sql`excluded.min_fare`,
          maxFare: sql`excluded.max_fare`,
          perMinuteRate: sql`excluded.per_minute_rate`,
          discountEligible: sql`excluded.discount_eligible`,
          discountPercentage: sql`excluded.discount_percentage`,
          estimatedSpeedKmh: sql`excluded.estimated_speed_kmh`,
          isVerified: sql`excluded.is_verified`,
          source: sql`excluded.source`,
          assumptions: sql`excluded.assumptions`,
          routeType: sql`excluded.route_type`,
          isActive: sql`excluded.is_active`,
          updatedAt: sql`excluded.updated_at`,
        },
      });

    console.log(
      `  - ${item.isVerified ? '✅ [VERIFIED]' : '⚠️ [PLACEHOLDER]'} ${item.name} (${item.category}): Base ₱${item.baseFare.toFixed(2)}, +₱${item.perKmRate.toFixed(2)}/km`
    );
  }

  console.log('✨ Seed complete! All fares are stored in the database.');
}

seed().catch((err) => {
  console.error('❌ Error during seeding:', err);
  process.exit(1);
});
