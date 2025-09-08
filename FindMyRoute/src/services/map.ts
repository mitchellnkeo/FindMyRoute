import { GeoPoint } from '@types/route';

// Get current location
export const getCurrentLocation = (): Promise<GeoPoint> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this device'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      error => {
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  });
};

// Fetch routes from OpenStreetMap Overpass API
export const fetchRoutesFromOverpass = async (
  center: GeoPoint,
  radiusInKm: number
): Promise<any[]> => {
  try {
    const radiusInMeters = radiusInKm * 1000;
    
    // Overpass API query to find routes suitable for running
    // This looks for paths, footways, and tracks within the specified radius
    const query = `
      [out:json];
      (
        way["highway"="footway"](around:${radiusInMeters},${center.latitude},${center.longitude});
        way["highway"="path"](around:${radiusInMeters},${center.latitude},${center.longitude});
        way["highway"="track"](around:${radiusInMeters},${center.latitude},${center.longitude});
        way["highway"="pedestrian"](around:${radiusInMeters},${center.latitude},${center.longitude});
      );
      out body;
      >;
      out skel qt;
    `;
    
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.elements || [];
  } catch (error) {
    console.error('Error fetching routes from Overpass API:', error);
    throw error;
  }
};

// Parse OpenStreetMap data into route objects
export const parseOsmRoutes = (osmData: any[]): any[] => {
  // This is a simplified implementation
  // In a real app, you would need to:
  // 1. Group nodes into ways
  // 2. Convert ways into complete routes with proper metadata
  // 3. Calculate distances, elevation, etc.
  
  const ways = osmData.filter(element => element.type === 'way');
  const nodes = osmData.filter(element => element.type === 'node');
  
  // Create a map of node ID to node data for quick lookup
  const nodeMap = new Map();
  nodes.forEach(node => {
    nodeMap.set(node.id, {
      latitude: node.lat,
      longitude: node.lon,
    });
  });
  
  // Convert ways to routes
  return ways.map(way => {
    // Extract waypoints from the way's node references
    const waypoints = way.nodes
      .map((nodeId: number) => nodeMap.get(nodeId))
      .filter(Boolean);
    
    // Basic route properties
    return {
      id: way.id.toString(),
      name: way.tags?.name || `Route ${way.id}`,
      description: way.tags?.description || '',
      surfaceType: getSurfaceType(way.tags),
      waypoints,
      // These would normally be calculated based on the waypoints
      distance: 0, // Placeholder
      estimatedDuration: 0, // Placeholder
      elevationGain: 0, // Placeholder
      difficulty: 'moderate', // Placeholder
    };
  });
};

// Helper function to determine surface type from OSM tags
const getSurfaceType = (tags: any): string[] => {
  if (!tags) return ['mixed'];
  
  const surface = tags.surface || '';
  
  if (['asphalt', 'paved', 'concrete'].includes(surface)) {
    return ['pavement'];
  } else if (['dirt', 'unpaved', 'ground', 'grass'].includes(surface)) {
    return ['trail'];
  } else if (surface === 'track') {
    return ['track'];
  }
  
  return ['mixed'];
};
