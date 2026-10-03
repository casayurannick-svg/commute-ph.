import { describe, it, expect } from 'vitest';
import { calculateModeFare } from '../fare-rules';
import { compareModes } from '../compare';
import { FareRule, TripInput } from '../types';

const mockJeepneyRule: FareRule = {
  id: 'jeepney_traditional',
  name: 'Traditional Jeepney',
  category: 'jeepney',
  baseFare: 13.0,
  baseDistanceKm: 4.0,
  perKmRate: 1.8,
  bookingFee: 0,
  minFare: 13.0,
  discountEligible: true,
  discountPercentage: 0.2,
  estimatedSpeedKmh: 15,
  isVerified: true,
  source: 'LTFRB Test Order',
  assumptions: 'Cash payment',
};

const mockBusRule: FareRule = {
  id: 'bus_aircon',
  name: 'Aircon City Bus',
  category: 'bus',
  baseFare: 17.0,
  baseDistanceKm: 5.0,
  perKmRate: 2.65,
  discountEligible: true,
  discountPercentage: 0.2,
  estimatedSpeedKmh: 18,
  isVerified: true,
  source: 'LTFRB Test Order',
  assumptions: 'Conductor issued ticket',
};

const mockRailRule: FareRule = {
  id: 'mrt3',
  name: 'MRT-3',
  category: 'rail',
  baseFare: 13.0,
  baseDistanceKm: 0.0,
  perKmRate: 1.0,
  maxFare: 28.0,
  discountEligible: true,
  discountPercentage: 0.2,
  estimatedSpeedKmh: 30,
  isVerified: true,
  source: 'DOTr Test Matrix',
  assumptions: 'Beep card / Single journey',
};

const mockRideHailRule: FareRule = {
  id: 'grab_car',
  name: 'Ride Hailing Car',
  category: 'ride_hail',
  baseFare: 45.0,
  baseDistanceKm: 1.0,
  perKmRate: 15.0,
  bookingFee: 50.0,
  perMinuteRate: 2.0,
  discountEligible: false,
  estimatedSpeedKmh: 16,
  isVerified: false,
  source: 'Estimated Test Rate',
  assumptions: 'Includes surge placeholder',
};

describe('Pure Fare Engine: calculateModeFare', () => {
  describe('Distance Rules', () => {
    it('charges base fare when distance is less than baseDistanceKm', () => {
      const trip: TripInput = { distanceKm: 2.5, profile: 'regular' };
      const result = calculateModeFare(mockJeepneyRule, trip);

      expect(result.baseCost).toBe(13.0);
      expect(result.distanceCost).toBe(0);
      expect(result.subtotal).toBe(13.0);
      expect(result.totalCost).toBe(13.0);
    });

    it('charges base fare when distance is exactly baseDistanceKm', () => {
      const trip: TripInput = { distanceKm: 4.0, profile: 'regular' };
      const result = calculateModeFare(mockJeepneyRule, trip);

      expect(result.baseCost).toBe(13.0);
      expect(result.distanceCost).toBe(0);
      expect(result.totalCost).toBe(13.0);
    });

    it('charges base fare + perKmRate * extraDistance when exceeding baseDistanceKm', () => {
      // 4 km base + 6 km extra @ 1.80/km = 13.00 + 10.80 = 23.80
      const trip: TripInput = { distanceKm: 10.0, profile: 'regular' };
      const result = calculateModeFare(mockJeepneyRule, trip);

      expect(result.baseCost).toBe(13.0);
      expect(result.distanceCost).toBe(10.8);
      expect(result.totalCost).toBe(23.8);
    });

    it('handles zero distance gracefully', () => {
      const trip: TripInput = { distanceKm: 0, profile: 'regular' };
      const result = calculateModeFare(mockJeepneyRule, trip);

      expect(result.baseCost).toBe(13.0);
      expect(result.distanceCost).toBe(0);
      expect(result.totalCost).toBe(13.0);
    });

    it('enforces maximum fare caps (e.g. MRT-3 max 28 PHP)', () => {
      // 35 km @ 1.00/km + 13 base = 48, but capped at 28
      const trip: TripInput = { distanceKm: 35.0, profile: 'regular' };
      const result = calculateModeFare(mockRailRule, trip);

      expect(result.totalCost).toBe(28.0);
      expect(result.breakdownDescription).toContain('Fare capped at maximum allowable rate of ₱28.00');
    });
  });

  describe('Profile Discounts (Student, Senior, PWD 20%)', () => {
    it('applies 20% discount for student on eligible modes', () => {
      // 10 km on Jeepney: Subtotal = 23.80. 20% discount = 4.76. Total = 19.04
      const trip: TripInput = { distanceKm: 10.0, profile: 'student' };
      const result = calculateModeFare(mockJeepneyRule, trip);

      expect(result.subtotal).toBe(23.8);
      expect(result.discountAmount).toBe(4.76);
      expect(result.totalCost).toBe(19.04);
      expect(result.breakdownDescription).toContain('Profile discount (STUDENT 20%): -₱4.76');
    });

    it('applies 20% discount for senior and pwd identically', () => {
      const seniorTrip: TripInput = { distanceKm: 10.0, profile: 'senior' };
      const pwdTrip: TripInput = { distanceKm: 10.0, profile: 'pwd' };

      const seniorResult = calculateModeFare(mockJeepneyRule, seniorTrip);
      const pwdResult = calculateModeFare(mockJeepneyRule, pwdTrip);

      expect(seniorResult.totalCost).toBe(19.04);
      expect(pwdResult.totalCost).toBe(19.04);
      expect(seniorResult.discountAmount).toBe(pwdResult.discountAmount);
    });

    it('does NOT apply discount when mode is not discount eligible', () => {
      const trip: TripInput = { distanceKm: 5.0, profile: 'student', durationMinutes: 20 };
      const result = calculateModeFare(mockRideHailRule, trip);

      expect(result.discountAmount).toBe(0);
      // Base (45) + Extra 4km*15 (60) + Time 20*2 (40) = 145 subtotal + 50 booking fee = 195
      expect(result.subtotal).toBe(145.0);
      expect(result.bookingFee).toBe(50.0);
      expect(result.totalCost).toBe(195.0);
    });

    it('does not discount booking/platform fee even if fare is discounted', () => {
      const ruleWithFee: FareRule = {
        ...mockJeepneyRule,
        bookingFee: 10.0,
      };
      // Base (13.00), discount 20% = 2.60. Subtotal after discount = 10.40. Add fee 10.00 = 20.40
      const trip: TripInput = { distanceKm: 3.0, profile: 'student' };
      const result = calculateModeFare(ruleWithFee, trip);

      expect(result.discountAmount).toBe(2.6);
      expect(result.bookingFee).toBe(10.0);
      expect(result.totalCost).toBe(20.4);
    });
  });
});

describe('Pure Compare Engine: compareModes', () => {
  const rules = [mockJeepneyRule, mockBusRule, mockRailRule, mockRideHailRule];

  it('sorts results by cost_asc by default', () => {
    const trip: TripInput = { distanceKm: 10.0, profile: 'regular' };
    const comparison = compareModes(rules, trip, { sortBy: 'cost_asc' });

    expect(comparison.results.length).toBe(4);
    for (let i = 0; i < comparison.results.length - 1; i++) {
      expect(comparison.results[i].totalCost).toBeLessThanOrEqual(
        comparison.results[i + 1].totalCost
      );
    }
    expect(comparison.cheapest?.modeId).toBe(comparison.results[0].modeId);
  });

  it('sorts results by cost_desc when requested', () => {
    const trip: TripInput = { distanceKm: 10.0, profile: 'regular' };
    const comparison = compareModes(rules, trip, { sortBy: 'cost_desc' });

    expect(comparison.results[0].totalCost).toBeGreaterThanOrEqual(
      comparison.results[comparison.results.length - 1].totalCost
    );
  });

  it('sorts results by speed_asc (fastest first)', () => {
    const trip: TripInput = { distanceKm: 10.0, profile: 'regular' };
    const comparison = compareModes(rules, trip, { sortBy: 'speed_asc' });

    for (let i = 0; i < comparison.results.length - 1; i++) {
      expect(comparison.results[i].estimatedDurationMinutes).toBeLessThanOrEqual(
        comparison.results[i + 1].estimatedDurationMinutes
      );
    }
    expect(comparison.fastest?.modeId).toBe(comparison.results[0].modeId);
  });

  it('filters by transit category', () => {
    const trip: TripInput = { distanceKm: 8.0, profile: 'regular' };
    const comparison = compareModes(rules, trip, { filterCategories: ['rail', 'bus'] });

    expect(comparison.results.length).toBe(2);
    expect(comparison.results.map((r) => r.category)).toEqual(
      expect.arrayContaining(['rail', 'bus'])
    );
  });

  it('filters by onlyVerified', () => {
    const trip: TripInput = { distanceKm: 8.0, profile: 'regular' };
    const comparison = compareModes(rules, trip, { onlyVerified: true });

    expect(comparison.results.every((r) => r.isVerified)).toBe(true);
    expect(comparison.results.some((r) => r.modeId === 'grab_car')).toBe(false);
  });
});
