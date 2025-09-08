import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import MapComponent from '@components/MapView';
import { getCurrentLocation, fetchRoutesFromOverpass, parseOsmRoutes } from '@services/map';
import { GeoPoint } from '@types/route';

const RouteDiscoveryScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<GeoPoint | null>(null);
  const [routes, setRoutes] = useState<any[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [searchRadius, setSearchRadius] = useState(2); // 2 km radius

  useEffect(() => {
    const initialize = async () => {
      try {
        // Get current location
        const location = await getCurrentLocation();
        setCurrentLocation(location);
        
        // Fetch routes from OpenStreetMap
        await fetchRoutes(location, searchRadius);
      } catch (err) {
        setError('Failed to initialize route discovery. Please check your location settings.');
        console.error('Route discovery initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [searchRadius]);

  const fetchRoutes = async (location: GeoPoint, radius: number) => {
    try {
      setLoading(true);
      
      // Fetch raw OSM data
      const osmData = await fetchRoutesFromOverpass(location, radius);
      
      // Parse into route objects
      const parsedRoutes = parseOsmRoutes(osmData);
      
      setRoutes(parsedRoutes);
      setError(null);
    } catch (err) {
      setError('Failed to fetch routes. Please try again later.');
      console.error('Error fetching routes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRouteSelect = (routeId: string) => {
    setSelectedRoute(routeId === selectedRoute ? null : routeId);
  };

  const handleRadiusChange = (radius: number) => {
    setSearchRadius(radius);
    if (currentLocation) {
      fetchRoutes(currentLocation, radius);
    }
  };

  if (loading && !currentLocation) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-4">Loading route discovery...</Text>
      </View>
    );
  }

  if (error && !routes.length) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-red-500">{error}</Text>
        <TouchableOpacity 
          className="mt-4 bg-blue-500 py-2 px-4 rounded-lg"
          onPress={() => currentLocation && fetchRoutes(currentLocation, searchRadius)}
        >
          <Text className="text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const mapRoutes = routes.map(route => ({
    id: route.id,
    name: route.name,
    waypoints: route.waypoints,
    color: route.id === selectedRoute ? '#0000FF' : '#FF0000',
  }));

  return (
    <View className="flex-1 bg-white">
      <View className="h-1/2">
        {currentLocation && (
          <MapComponent
            initialRegion={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            routes={mapRoutes}
          />
        )}
      </View>
      
      <View className="flex-row justify-around items-center py-2 bg-gray-100">
        <Text className="font-bold">Search Radius:</Text>
        {[1, 2, 5, 10].map(radius => (
          <TouchableOpacity
            key={radius}
            className={`py-1 px-3 rounded-full ${
              searchRadius === radius ? 'bg-blue-500' : 'bg-gray-300'
            }`}
            onPress={() => handleRadiusChange(radius)}
          >
            <Text className={searchRadius === radius ? 'text-white' : 'text-black'}>
              {radius} km
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <ScrollView className="flex-1 p-4">
        <Text className="text-lg font-bold mb-2">
          {routes.length > 0
            ? `Found ${routes.length} routes nearby`
            : 'No routes found. Try increasing the search radius.'}
        </Text>
        
        {loading && (
          <ActivityIndicator size="small" color="#0000ff" />
        )}
        
        {routes.map(route => (
          <TouchableOpacity
            key={route.id}
            className={`p-4 mb-2 rounded-lg border ${
              selectedRoute === route.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onPress={() => handleRouteSelect(route.id)}
          >
            <Text className="font-bold">{route.name}</Text>
            <Text>Surface: {route.surfaceType.join(', ')}</Text>
            <Text>Distance: {route.distance.toFixed(2)} km</Text>
            <Text>Estimated Duration: {route.estimatedDuration} min</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default RouteDiscoveryScreen;
