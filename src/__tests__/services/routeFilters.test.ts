import { filterRoutes, RouteFilters } from '@services/routeFilters';
import { Route } from '@types/route';

describe('routeFilters', () => {
  // Sample test routes
  const testRoutes: Route[] = [
    {
      id: '1',
      name: 'Short Easy Route',
      distance: 2.5, // km
      estimatedDuration: 15, // minutes
      elevationGain: 20, // meters
      difficulty: 'easy',
      surfaceType: ['pavement'],
      startPoint: { latitude: 37.7749, longitude: -122.4194 },
      endPoint: { latitude: 37.7750, longitude: -122.4195 },
      waypoints: [
        { latitude: 37.7749, longitude: -122.4194 },
        { latitude: 37.7750, longitude: -122.4195 },
      ],
      createdBy: 'user1',
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      amenities: {
        hasParking: true,
        hasBathrooms: false,
        hasWaterFountains: true,
        hasLighting: true,
      },
    },
    {
      id: '2',
      name: 'Medium Trail Route',
      distance: 5.8, // km
      estimatedDuration: 45, // minutes
      elevationGain: 120, // meters
      difficulty: 'moderate',
      surfaceType: ['trail'],
      startPoint: { latitude: 37.7749, longitude: -122.4194 },
      endPoint: { latitude: 37.7755, longitude: -122.4200 },
      waypoints: [
        { latitude: 37.7749, longitude: -122.4194 },
        { latitude: 37.7755, longitude: -122.4200 },
      ],
      createdBy: 'user1',
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      amenities: {
        hasParking: false,
        hasBathrooms: true,
        hasWaterFountains: false,
        hasLighting: false,
      },
    },
    {
      id: '3',
      name: 'Long Challenging Route',
      distance: 12.3, // km
      estimatedDuration: 90, // minutes
      elevationGain: 350, // meters
      difficulty: 'challenging',
      surfaceType: ['mixed'],
      startPoint: { latitude: 37.7749, longitude: -122.4194 },
      endPoint: { latitude: 37.7760, longitude: -122.4210 },
      waypoints: [
        { latitude: 37.7749, longitude: -122.4194 },
        { latitude: 37.7760, longitude: -122.4210 },
      ],
      createdBy: 'user2',
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      amenities: {
        hasParking: true,
        hasBathrooms: true,
        hasWaterFountains: true,
        hasLighting: false,
      },
    },
  ];

  it('filters routes by distance', () => {
    const filters: RouteFilters = {
      minDistance: 5,
      maxDistance: 10,
    };

    const result = filterRoutes(testRoutes, filters);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('filters routes by difficulty', () => {
    const filters: RouteFilters = {
      difficulty: ['easy', 'moderate'],
    };

    const result = filterRoutes(testRoutes, filters);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('2');
  });

  it('filters routes by surface type', () => {
    const filters: RouteFilters = {
      surfaceTypes: ['trail'],
    };

    const result = filterRoutes(testRoutes, filters);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('filters routes by elevation', () => {
    const filters: RouteFilters = {
      minElevation: 100,
      maxElevation: 200,
    };

    const result = filterRoutes(testRoutes, filters);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('filters routes by amenities', () => {
    const filters: RouteFilters = {
      hasBathrooms: true,
      hasWaterFountains: true,
    };

    const result = filterRoutes(testRoutes, filters);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  it('combines multiple filters', () => {
    const filters: RouteFilters = {
      minDistance: 2,
      maxDistance: 15,
      difficulty: ['moderate', 'challenging'],
      hasParking: true,
    };

    const result = filterRoutes(testRoutes, filters);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  it('returns empty array when no routes match filters', () => {
    const filters: RouteFilters = {
      minDistance: 20,
    };

    const result = filterRoutes(testRoutes, filters);
    expect(result).toHaveLength(0);
  });

  it('returns all routes when no filters are applied', () => {
    const filters: RouteFilters = {};

    const result = filterRoutes(testRoutes, filters);
    expect(result).toHaveLength(3);
  });
});
