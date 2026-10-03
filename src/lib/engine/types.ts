export type PassengerProfile = 'regular' | 'student' | 'senior' | 'pwd';

export type TransitCategory =
  | 'jeepney'
  | 'bus'
  | 'rail'
  | 'uv'
  | 'ride_hail'
  | 'tricycle';

export interface FareRule {
  id: string;
  name: string;
  category: TransitCategory;
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
  isActive?: boolean;
  routeType?: string;
}

export interface TripInput {
  distanceKm: number;
  profile: PassengerProfile;
  durationMinutes?: number;
  trafficMultiplier?: number;
}

export interface FareCalculationResult {
  modeId: string;
  modeName: string;
  category: TransitCategory;
  baseCost: number;
  distanceCost: number;
  timeCost: number;
  bookingFee: number;
  subtotal: number;
  discountAmount: number;
  totalCost: number;
  estimatedDurationMinutes: number;
  isVerified: boolean;
  source: string;
  assumptions: string;
  breakdownDescription: string;
}

export type SortOption = 'cost_asc' | 'cost_desc' | 'speed_asc';

export interface CompareOptions {
  sortBy?: SortOption;
  filterCategories?: TransitCategory[];
  onlyVerified?: boolean;
}

export interface CompareResult {
  trip: TripInput;
  results: FareCalculationResult[];
  cheapest?: FareCalculationResult;
  fastest?: FareCalculationResult;
}
