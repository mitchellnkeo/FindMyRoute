export interface Route {
  id: string;
  name: string;
  description?: string;
  distance: number; // in kilometers
  estimatedDuration: number; // in minutes
  elevationGain: number; // in meters
  difficulty: 'easy' | 'moderate' | 'challenging';
  surfaceType: SurfaceType[];
  startPoint: GeoPoint;
  endPoint: GeoPoint;
  waypoints: GeoPoint[];
  createdBy: string; // user ID
  isPublic: boolean;
  safetyScore?: number; // 0-100
  amenities?: RouteAmenities;
  createdAt: Date;
  updatedAt: Date;
}

export type SurfaceType = 'pavement' | 'trail' | 'track' | 'mixed';

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface RouteAmenities {
  hasParking?: boolean;
  hasBathrooms?: boolean;
  hasWaterFountains?: boolean;
  hasLighting?: boolean;
}
