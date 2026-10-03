import { FareRule, TripInput, FareCalculationResult } from './types';

/**
 * Pure function to calculate fare for a given transit mode and trip input.
 * All rates, baselines, and rules are provided via the FareRule parameter.
 * No hardcoded prices or rates exist in this logic.
 */
export function calculateModeFare(
  rule: FareRule,
  input: TripInput
): FareCalculationResult {
  const distance = Math.max(0, input.distanceKm);

  // 1. Distance fare calculation
  const extraDistance = Math.max(0, distance - rule.baseDistanceKm);
  const baseCost = rule.baseFare;
  const distanceCost = Number((extraDistance * rule.perKmRate).toFixed(2));

  // 2. Travel duration estimation
  const speed = rule.estimatedSpeedKmh > 0 ? rule.estimatedSpeedKmh : 20;
  const trafficMultiplier = input.trafficMultiplier && input.trafficMultiplier > 0
    ? input.trafficMultiplier
    : 1;

  // Boarding / waiting buffer (minimum 3 mins)
  const travelDurationMinutes = (distance / speed) * 60 * trafficMultiplier;
  const estimatedDurationMinutes = input.durationMinutes ?? Math.max(5, Math.round(travelDurationMinutes + 5));

  // 3. Optional time cost (e.g. TNVS per-minute charges)
  const perMinuteRate = rule.perMinuteRate ?? 0;
  const timeCost = Number((estimatedDurationMinutes * perMinuteRate).toFixed(2));

  // 4. Subtotal subject to standard passenger discount
  const subtotal = Number((baseCost + distanceCost + timeCost).toFixed(2));

  // 5. Profile Discount (RA 9994 / RA 10931 for Students, Seniors, PWDs)
  const isDiscountedProfile = input.profile !== 'regular';
  let discountAmount = 0;
  if (rule.discountEligible && isDiscountedProfile) {
    const discountRate = rule.discountPercentage ?? 0.20;
    discountAmount = Number((subtotal * discountRate).toFixed(2));
  }

  const subtotalAfterDiscount = Number((subtotal - discountAmount).toFixed(2));

  // 6. Booking / Platform fee (non-discountable fee added on top)
  const bookingFee = Number((rule.bookingFee ?? 0).toFixed(2));
  const totalBeforeBounds = Number((subtotalAfterDiscount + bookingFee).toFixed(2));

  // 7. Minimum & Maximum Fare bounds
  let totalCost = totalBeforeBounds;
  if (rule.minFare !== undefined && rule.minFare !== null && totalCost < rule.minFare) {
    totalCost = rule.minFare;
  }
  if (rule.maxFare !== undefined && rule.maxFare !== null && totalCost > rule.maxFare) {
    totalCost = rule.maxFare;
  }
  totalCost = Number(totalCost.toFixed(2));

  // 8. Human-readable breakdown description
  const breakdownParts: string[] = [
    `Base fare: ₱${baseCost.toFixed(2)} (first ${rule.baseDistanceKm.toFixed(1)} km)`,
  ];

  if (extraDistance > 0) {
    breakdownParts.push(
      `Extra distance: ₱${distanceCost.toFixed(2)} (${extraDistance.toFixed(1)} km @ ₱${rule.perKmRate.toFixed(2)}/km)`
    );
  }

  if (timeCost > 0) {
    breakdownParts.push(`Time charge: ₱${timeCost.toFixed(2)} (${estimatedDurationMinutes} mins)`);
  }

  if (discountAmount > 0) {
    const pct = Math.round((rule.discountPercentage ?? 0.20) * 100);
    breakdownParts.push(`Profile discount (${input.profile.toUpperCase()} ${pct}%): -₱${discountAmount.toFixed(2)}`);
  }

  if (bookingFee > 0) {
    breakdownParts.push(`Platform/Booking fee: +₱${bookingFee.toFixed(2)}`);
  }

  if (rule.maxFare !== undefined && totalBeforeBounds > rule.maxFare) {
    breakdownParts.push(`Fare capped at maximum allowable rate of ₱${rule.maxFare.toFixed(2)}`);
  }

  const breakdownDescription = breakdownParts.join(' | ');

  return {
    modeId: rule.id,
    modeName: rule.name,
    category: rule.category,
    baseCost,
    distanceCost,
    timeCost,
    bookingFee,
    subtotal,
    discountAmount,
    totalCost,
    estimatedDurationMinutes,
    isVerified: rule.isVerified,
    source: rule.source,
    assumptions: rule.assumptions,
    breakdownDescription,
  };
}
