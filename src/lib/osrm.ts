import type { POIItem } from '@/components/PlaceSearch';

/**
 * Fetch road distance between two POI points using the public OSRM API.
 * Returns distance in kilometers rounded to 2 decimal places, or `null` on any error.
 */
export async function fetchRoadDistance(
  origin: POIItem,
  destination: POIItem
): Promise<number | null> {
  const url = `http://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=false`;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    const distanceMeters = data?.routes?.[0]?.distance;
    if (typeof distanceMeters !== 'number') return null;
    const km = distanceMeters / 1000;
    // round to 2 decimal places
    return Math.round(km * 100) / 100;
  } catch (_) {
    return null;
  }
}
