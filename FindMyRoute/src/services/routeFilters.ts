import { Route, SurfaceType } from '@types/route';

// Filter interface
export interface RouteFilters {
  minDistance?: number; // in kilometers
  maxDistance?: number; // in kilometers
  difficulty?: ('easy' | 'moderate' | 'challenging')[];
  surfaceTypes?: SurfaceType[];
  minElevation?: number; // in meters
  maxElevation?: number; // in meters
  hasParking?: boolean;
  hasBathrooms?: boolean;
  hasWaterFountains?: boolean;
  hasLighting?: boolean;
}

// Apply filters to a list of routes
export const filterRoutes = (routes: Route[], filters: RouteFilters): Route[] => {
  return routes.filter(route => {
    // Distance filter
    if (filters.minDistance !== undefined && route.distance < filters.minDistance) {
      return false;
    }
    if (filters.maxDistance !== undefined && route.distance > filters.maxDistance) {
      return false;
    }

    // Difficulty filter
    if (filters.difficulty && filters.difficulty.length > 0 && !filters.difficulty.includes(route.difficulty)) {
      return false;
    }

    // Surface type filter
    if (filters.surfaceTypes && filters.surfaceTypes.length > 0) {
      const hasMatchingSurface = route.surfaceType.some(surface => 
        filters.surfaceTypes?.includes(surface)
      );
      if (!hasMatchingSurface) {
        return false;
      }
    }

    // Elevation filter
    if (filters.minElevation !== undefined && route.elevationGain < filters.minElevation) {
      return false;
    }
    if (filters.maxElevation !== undefined && route.elevationGain > filters.maxElevation) {
      return false;
    }

    // Amenities filters
    if (filters.hasParking && !route.amenities?.hasParking) {
      return false;
    }
    if (filters.hasBathrooms && !route.amenities?.hasBathrooms) {
      return false;
    }
    if (filters.hasWaterFountains && !route.amenities?.hasWaterFountains) {
      return false;
    }
    if (filters.hasLighting && !route.amenities?.hasLighting) {
      return false;
    }

    // If all filters pass, include the route
    return true;
  });
};

// Get distance range options
export const getDistanceRangeOptions = (): { label: string; min: number; max: number }[] => {
  return [
    { label: 'Short (0-3 km)', min: 0, max: 3 },
    { label: 'Medium (3-8 km)', min: 3, max: 8 },
    { label: 'Long (8-15 km)', min: 8, max: 15 },
    { label: 'Very Long (15+ km)', min: 15, max: Infinity },
  ];
};

// Get difficulty options
export const getDifficultyOptions = (): { label: string; value: Route['difficulty'] }[] => {
  return [
    { label: 'Easy', value: 'easy' },
    { label: 'Moderate', value: 'moderate' },
    { label: 'Challenging', value: 'challenging' },
  ];
};

// Get surface type options
export const getSurfaceTypeOptions = (): { label: string; value: SurfaceType }[] => {
  return [
    { label: 'Pavement', value: 'pavement' },
    { label: 'Trail', value: 'trail' },
    { label: 'Track', value: 'track' },
    { label: 'Mixed', value: 'mixed' },
  ];
};

// Get elevation range options
export const getElevationRangeOptions = (): { label: string; min: number; max: number }[] => {
  return [
    { label: 'Flat (0-50m)', min: 0, max: 50 },
    { label: 'Rolling (50-150m)', min: 50, max: 150 },
    { label: 'Hilly (150-300m)', min: 150, max: 300 },
    { label: 'Mountainous (300m+)', min: 300, max: Infinity },
  ];
};
