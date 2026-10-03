import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

export const fareRules = sqliteTable('fare_rules', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(), // 'jeepney' | 'bus' | 'rail' | 'uv' | 'ride_hail' | 'tricycle'
  baseFare: real('base_fare').notNull(),
  baseDistanceKm: real('base_distance_km').notNull(),
  perKmRate: real('per_km_rate').notNull(),
  bookingFee: real('booking_fee').default(0),
  minFare: real('min_fare'),
  maxFare: real('max_fare'),
  perMinuteRate: real('per_minute_rate').default(0),
  discountEligible: integer('discount_eligible', { mode: 'boolean' }).notNull().default(true),
  discountPercentage: real('discount_percentage').default(0.20),
  estimatedSpeedKmh: real('estimated_speed_kmh').notNull().default(20),
  isVerified: integer('is_verified', { mode: 'boolean' }).notNull().default(true),
  source: text('source').notNull(),
  assumptions: text('assumptions').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  routeType: text('route_type').default('city'),
  updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString()),
});

export type FareRuleRecord = typeof fareRules.$inferSelect;
export type NewFareRuleRecord = typeof fareRules.$inferInsert;
