import { describe, it, expect } from 'vitest';
import { POST } from '@/app/api/compare/route';
import { GET } from '@/app/api/prices/route';
import { NextRequest } from 'next/server';

describe('API Routes', () => {
  describe('GET /api/prices', () => {
    it('returns fare prices with Cache-Control headers', async () => {
      const response = await GET();
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.data.length).toBeGreaterThan(0);

      const cacheHeader = response.headers.get('Cache-Control');
      expect(cacheHeader).toContain('public');
      expect(cacheHeader).toContain('s-maxage');
    });
  });

  describe('POST /api/compare', () => {
    it('rejects invalid distance with 400 status and Zod error messages', async () => {
      const req = new NextRequest('http://localhost:3000/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ distanceKm: -5 }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.issues).toBeDefined();
      expect(json.issues.some((i: { field: string }) => i.field === 'distanceKm')).toBe(true);
    });

    it('successfully computes fare comparison without writing to DB', async () => {
      const req = new NextRequest('http://localhost:3000/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          distanceKm: 8.5,
          profile: 'student',
          sortBy: 'cost_asc',
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.results.length).toBeGreaterThan(0);
      expect(json.data.cheapest).toBeDefined();
      expect(json.data.fastest).toBeDefined();

      // Verify student discount applied in result
      const jeepResult = json.data.results.find((r: { category: string }) => r.category === 'jeepney');
      if (jeepResult) {
        expect(jeepResult.discountAmount).toBeGreaterThan(0);
      }
    });

    it('respects sorting by speed_asc', async () => {
      const req = new NextRequest('http://localhost:3000/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          distanceKm: 12.0,
          profile: 'regular',
          sortBy: 'speed_asc',
        }),
      });

      const res = await POST(req);
      const json = await res.json();
      expect(res.status).toBe(200);

      const results = json.data.results;
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].estimatedDurationMinutes).toBeLessThanOrEqual(
          results[i + 1].estimatedDurationMinutes
        );
      }
    });
  });
});
