import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, ActivityIndicator } from 'react-native';
import MapComponent from '@components/MapView';
import RouteFilters from '@components/RouteFilters';
import { getCurrentLocation, fetchRoutesFromOverpass, parseOsmRoutes } from '@services/map';
import { filterRoutes, RouteFilters as FilterType } from '@services/routeFilters';
import { GeoPoint } from '@types/route';

const FilteredRoutesScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<GeoPoint | null>(null);
  const [allRoutes, setAllRoutes] = useState<any[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<any[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterType>({});
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
      
      setAllRoutes(parsedRoutes);
      setFilteredRoutes(parsedRoutes);
    } catch (err) {
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

  const handleApplyFilters = (filters: FilterType) => {
    setActiveFilters(filters);
    const filtered = filterRoutes(allRoutes, filters);
    setFilteredRoutes(filtered);
    setShowFilters(false);
  };

  const mapRoutes = filteredRoutes
    .filter(route => !selectedRoute || route.id === selectedRoute)
    .map(route => ({
      id: route.id,
      name: route.name,
      waypoints: route.waypoints,
      color: route.id === selectedRoute ? '#0000FF' : '#FF0000',
    }));

  const filtersApplied = Object.values(activeFilters).some(value => 
    value !== undefined && 
    (Array.isArray(value) ? value.length > 0 : true)
  );

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
      
      <View className="flex-row justify-between items-center py-2 px-4 bg-gray-100">
        <View className="flex-row">
          <Text className="font-bold mr-2">Radius:</Text>
          {[1, 2, 5, 10].map(radius => (
            <TouchableOpacity
              key={radius}
              className={`py-1 px-3 rounded-full mr-1 ${
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
        
        <TouchableOpacity
          className="flex-row items-center"
          onPress={() => setShowFilters(true)}
        >
          <Text className="mr-1">Filters</Text>
          {filtersApplied && (
            <View className="w-3 h-3 bg-blue-500 rounded-full" />
          )}
        </TouchableOpacity>
      </View>
      
      <ScrollView className="flex-1 p-4">
        <Text className="text-lg font-bold mb-2">
          {filteredRoutes.length > 0
            ? `${filteredRoutes.length} routes found`
            : 'No routes found. Try adjusting your filters or increasing the search radius.'}
        </Text>
        
        {loading && (
          <ActivityIndicator size="small" color="#0000ff" />
        )}
        
        {filteredRoutes.map(route => (
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
            <Text>Difficulty: {route.difficulty}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white rounded-t-lg h-3/4">
            <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
              <Text className="text-lg font-bold">Filter Routes</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Text className="text-blue-500">Close</Text>
              </TouchableOpacity>
            </View>
            
            <RouteFilters
              onApplyFilters={handleApplyFilters}
              initialFilters={activeFilters}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default FilteredRoutesScreen;
