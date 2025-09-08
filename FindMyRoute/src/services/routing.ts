import { GeoPoint, Route } from '@types/route';

// Base URL for OSRM API
// Note: In production, you'd want to self-host this service
const OSRM_API_BASE_URL = 'https://router.project-osrm.org/route/v1';

// Calculate route between two points using OSRM
export const calculateRoute = async (
  start: GeoPoint,
  end: GeoPoint,
  profile: 'foot' | 'bike' = 'foot'
): Promise<{
  waypoints: GeoPoint[];
  distance: number; // in meters
  duration: number; // in seconds
}> => {
  try {
    const url = `${OSRM_API_BASE_URL}/${profile}/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('No route found');
    }
    
    const route = data.routes[0];
    const coordinates = route.geometry.coordinates;
    
    // Convert GeoJSON format (lon, lat) to our GeoPoint format (lat, lon)
    const waypoints = coordinates.map((coord: [number, number]) => ({
      latitude: coord[1],
      longitude: coord[0],
    }));
    
    return {
      waypoints,
      distance: route.distance, // in meters
      duration: route.duration, // in seconds
    };
  } catch (error) {
    console.error('Error calculating route:', error);
    throw error;
  }
};

// Calculate elevation profile for a route
// Note: This would typically require a separate elevation API
// For now, this is a placeholder that returns random elevation data
export const calculateElevationProfile = async (
  waypoints: GeoPoint[]
): Promise<number[]> => {
  // This is a placeholder. In a real app, you'd call an elevation API
  // Example APIs: Google Elevation API, Open-Elevation, etc.
  
  // Generate random elevation data for demonstration
  return waypoints.map(() => Math.floor(Math.random() * 100));
};

// Calculate route difficulty based on distance and elevation
export const calculateRouteDifficulty = (
  distance: number, // in meters
  elevationGain: number // in meters
): 'easy' | 'moderate' | 'challenging' => {
  // Convert distance to kilometers
  const distanceKm = distance / 1000;
  
  // Simple difficulty calculation
  // This could be much more sophisticated in a real app
  if (distanceKm < 3 && elevationGain < 50) {
    return 'easy';
  } else if (distanceKm < 8 && elevationGain < 150) {
    return 'moderate';
  } else {
    return 'challenging';
  }
};

// Create a complete route with all necessary data
export const createCompleteRoute = async (
  startPoint: GeoPoint,
  endPoint: GeoPoint,
  name: string,
  description: string = '',
  userId: string,
  isPublic: boolean = false
): Promise<Omit<Route, 'id' | 'createdAt' | 'updatedAt'>> => {
  try {
    // Calculate route using OSRM
    const routeData = await calculateRoute(startPoint, endPoint);
    
    // Calculate elevation profile
    const elevations = await calculateElevationProfile(routeData.waypoints);
    
    // Calculate total elevation gain
    let elevationGain = 0;
    for (let i = 1; i < elevations.length; i++) {
      const diff = elevations[i] - elevations[i - 1];
      if (diff > 0) {
        elevationGain += diff;
      }
    }
    
    // Calculate difficulty
    const difficulty = calculateRouteDifficulty(routeData.distance, elevationGain);
    
    // Convert duration from seconds to minutes
    const estimatedDuration = Math.ceil(routeData.duration / 60);
    
    // Create route object
    return {
      name,
      description,
      distance: routeData.distance / 1000, // Convert to kilometers
      estimatedDuration,
      elevationGain,
      difficulty,
      surfaceType: ['mixed'], // Default to mixed, would need more data to determine accurately
      startPoint,
      endPoint,
      waypoints: routeData.waypoints,
      createdBy: userId,
      isPublic,
    };
  } catch (error) {
    console.error('Error creating complete route:', error);
    throw error;
  }
};
