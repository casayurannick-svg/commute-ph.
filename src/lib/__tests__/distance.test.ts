import { describe, it, expect } from 'vitest';
import { calculateHaversineDistance } from '../distance';

describe('calculateHaversineDistance', () => {
  it('should return 0 when origin and destination are identical', () => {
    const dist = calculateHaversineDistance(14.5995, 120.9842, 14.5995, 120.9842);
    expect(dist).toBe(0);
  });

  it('should calculate approximate distance between Manila landmarks correctly', () => {
    // Monumento (14.6575, 120.9836) to BGC (14.5517, 121.051)
    const dist = calculateHaversineDistance(14.6575, 120.9836, 14.5517, 121.051);
    // Approximate straight-line distance is around 13-15 km
    expect(dist).toBeGreaterThan(12);
    expect(dist).toBeLessThan(16);
  });
});
