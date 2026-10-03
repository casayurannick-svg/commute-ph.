import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

const url = process.env.TURSO_DATABASE_URL || 'file:commute_fares.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

export const client = createClient({
  url,
  authToken,
});

export const db = drizzle(client, { schema });

/**
 * Helper to ensure tables exist in the Turso/LibSQL database.
 */
export async function initDb() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS fare_rules (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      base_fare REAL NOT NULL,
      base_distance_km REAL NOT NULL,
      per_km_rate REAL NOT NULL,
      booking_fee REAL DEFAULT 0,
      min_fare REAL,
      max_fare REAL,
      per_minute_rate REAL DEFAULT 0,
      discount_eligible INTEGER NOT NULL DEFAULT 1,
      discount_percentage REAL DEFAULT 0.20,
      estimated_speed_kmh REAL NOT NULL DEFAULT 20,
      is_verified INTEGER NOT NULL DEFAULT 1,
      source TEXT NOT NULL,
      assumptions TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      route_type TEXT DEFAULT 'city',
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
