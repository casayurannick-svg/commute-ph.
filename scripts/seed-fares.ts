import 'dotenv/config';
import { db, initDb } from '../src/lib/db';
import { fareRules } from '../src/lib/schema';

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

const ncrFareData2026: SeedFareItem[] = [
  {
    id: 'puj_traditional',
    name: 'Traditional Jeepney',
    category: 'jeepney',
    baseFare: 14.0,
    baseDistanceKm: 4.0,
    perKmRate: 2.0,
    bookingFee: 0,
    minFare: 14.0,
    discountEligible: true,
    discountPercentage: 0.2,
    estimatedSpeedKmh: 14,
    isVerified: true,
    source: 'LTFRB 2026 Official Fare Matrix',
    assumptions: 'Official LTFRB NCR 2026 fare matrix: ₱14 base fare for first 4 km, ₱2.00 per succeeding km.',
    routeType: 'city',
  },
  {
    id: 'puj_modern',
    name: 'Modern PUJ / E-Jeepney',
    category: 'jeepney',
    baseFare: 17.0,
    baseDistanceKm: 4.0,
    perKmRate: 2.4,
    bookingFee: 0,
    minFare: 17.0,
    discountEligible: true,
    discountPercentage: 0.2,
    estimatedSpeedKmh: 16,
    isVerified: true,
    source: 'LTFRB 2026 Official Fare Matrix',
    assumptions: 'Official LTFRB NCR 2026 fare matrix: ₱17 base fare for first 4 km, ₱2.40 per succeeding km.',
    routeType: 'city',
  },
  {
    id: 'bus_aircon',
    name: 'Aircon City Bus',
    category: 'bus',
    baseFare: 18.0,
    baseDistanceKm: 5.0,
    perKmRate: 2.98,
    bookingFee: 0,
    minFare: 18.0,
    discountEligible: true,
    discountPercentage: 0.2,
    estimatedSpeedKmh: 19,
    isVerified: true,
    source: 'LTFRB 2026 Official Fare Matrix',
    assumptions: 'Official LTFRB NCR 2026 fare matrix: ₱18 base fare for first 5 km, ₱2.98 per succeeding km.',
    routeType: 'city',
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
    source: 'LTFRB 2026 Official Fare Matrix',
    assumptions: 'Official LTFRB 2026 nationwide taxi rate: ₱45 flagdown, ₱13.50 per km, plus ₱2.00 per minute waiting charge.',
    routeType: 'taxi',
  },
  {
    id: 'grab_car',
    name: 'GrabCar / 4-Wheel Ride-Hail',
    category: 'ride_hail',
    baseFare: 65.0,
    baseDistanceKm: 1.0,
    perKmRate: 12.0,
    bookingFee: 0,
    minFare: 65.0,
    perMinuteRate: 2.0,
    discountEligible: true,
    discountPercentage: 0.2,
    estimatedSpeedKmh: 17,
    isVerified: true,
    source: '2026 TNVS Platform Rate Structure',
    assumptions: '2026 TNVS baseline rate: ₱65 base fare for 1st km, ₱12 per km.',
    routeType: 'ride_hail',
  },
  {
    id: 'moto_taxi',
    name: 'Motorcycle Taxi (Angkas / JoyRide / MoveIt)',
    category: 'ride_hail',
    baseFare: 40.0,
    baseDistanceKm: 1.0,
    perKmRate: 18.0,
    bookingFee: 0,
    minFare: 40.0,
    discountEligible: true,
    discountPercentage: 0.2,
    estimatedSpeedKmh: 24,
    isVerified: true,
    source: '2026 MC Taxi Official Guidelines',
    assumptions: '2026 MC Taxi official rate structure: ₱40 base fare for 1st km, ₱18 per km.',
    routeType: 'ride_hail',
  },
];

async function seedFares() {
  console.log('🌱 Initializing database...');
  await initDb();

  console.log('🧹 Clearing existing fare rules from database...');
  await db.delete(fareRules);

  console.log(`📦 Inserting ${ncrFareData2026.length} official 2026 Metro Manila fare rules...`);

  for (const item of ncrFareData2026) {
    await db.insert(fareRules).values({
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
    });

    console.log(
      `  - ✅ [2026] ${item.name} (${item.category}): Base ₱${item.baseFare.toFixed(2)}, +₱${item.perKmRate.toFixed(2)}/km`
    );
  }

  console.log('✨ Seed complete! 2026 Metro Manila fare matrix loaded.');
}

seedFares().catch((err) => {
  console.error('❌ Error during 2026 fare seeding:', err);
  process.exit(1);
});
