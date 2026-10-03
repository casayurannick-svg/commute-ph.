import { FareRule, TripInput, CompareOptions, CompareResult, FareCalculationResult } from './types';
import { calculateModeFare } from './fare-rules';

/**
 * Pure comparison function that evaluates an array of FareRules against a TripInput.
 * Pure function: Deterministic, no DB calls, no mutations.
 */
export function compareModes(
  rules: FareRule[],
  trip: TripInput,
  options: CompareOptions = {}
): CompareResult {
  const { sortBy = 'cost_asc', filterCategories, onlyVerified } = options;

  let activeRules = rules.filter((r) => r.isActive !== false);

  if (filterCategories && filterCategories.length > 0) {
    const allowed = new Set(filterCategories);
    activeRules = activeRules.filter((r) => allowed.has(r.category));
  }

  if (onlyVerified) {
    activeRules = activeRules.filter((r) => r.isVerified);
  }

  const results: FareCalculationResult[] = activeRules.map((rule) =>
    calculateModeFare(rule, trip)
  );

  // Sorting
  results.sort((a, b) => {
    if (sortBy === 'cost_asc') {
      if (a.totalCost !== b.totalCost) {
        return a.totalCost - b.totalCost;
      }
      return a.estimatedDurationMinutes - b.estimatedDurationMinutes;
    }

    if (sortBy === 'cost_desc') {
      if (a.totalCost !== b.totalCost) {
        return b.totalCost - a.totalCost;
      }
      return a.estimatedDurationMinutes - b.estimatedDurationMinutes;
    }

    if (sortBy === 'speed_asc') {
      if (a.estimatedDurationMinutes !== b.estimatedDurationMinutes) {
        return a.estimatedDurationMinutes - b.estimatedDurationMinutes;
      }
      return a.totalCost - b.totalCost;
    }

    return 0;
  });

  // Identify cheapest and fastest among results
  let cheapest: FareCalculationResult | undefined;
  let fastest: FareCalculationResult | undefined;

  for (const item of results) {
    if (!cheapest || item.totalCost < cheapest.totalCost) {
      cheapest = item;
    }
    if (!fastest || item.estimatedDurationMinutes < fastest.estimatedDurationMinutes) {
      fastest = item;
    }
  }

  return {
    trip,
    results,
    cheapest,
    fastest,
  };
}
