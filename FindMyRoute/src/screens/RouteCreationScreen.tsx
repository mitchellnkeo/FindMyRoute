import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import MapComponent from '@components/MapView';
import { getCurrentLocation } from '@services/map';
import { createCompleteRoute } from '@services/routing';
import { GeoPoint } from '@types/route';
import { auth } from '@services/firebase';

const RouteCreationScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<GeoPoint | null>(null);
  const [startPoint, setStartPoint] = useState<GeoPoint | null>(null);
  const [endPoint, setEndPoint] = useState<GeoPoint | null>(null);
  const [routeName, setRouteName] = useState('');
  const [routeDescription, setRouteDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [calculatedRoute, setCalculatedRoute] = useState<any | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const location = await getCurrentLocation();
        setCurrentLocation(location);
        setStartPoint(location); // Default start point to current location
      } catch (error) {
        console.error('Error getting current location:', error);
        Alert.alert('Error', 'Failed to get your current location. Please check your location settings.');
      }
    };

    initialize();
  }, []);

  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    
    if (!startPoint) {
      setStartPoint(coordinate);
    } else if (!endPoint) {
      setEndPoint(coordinate);
    } else {
      // If both points are set, reset and start over
      setStartPoint(coordinate);
      setEndPoint(null);
      setCalculatedRoute(null);
    }
  };

  const calculateRoute = async () => {
    if (!startPoint || !endPoint) {
      Alert.alert('Error', 'Please select both start and end points on the map');
      return;
    }

    if (!routeName) {
      Alert.alert('Error', 'Please enter a name for your route');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a route');
      return;
    }

    setLoading(true);
    try {
      const route = await createCompleteRoute(
        startPoint,
        endPoint,
        routeName,
        routeDescription,
        user.uid,
        isPublic
      );
      
      setCalculatedRoute(route);
      Alert.alert('Success', 'Route calculated successfully!');
    } catch (error) {
      console.error('Error calculating route:', error);
      Alert.alert('Error', 'Failed to calculate route. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetRoute = () => {
    setStartPoint(currentLocation);
    setEndPoint(null);
    setCalculatedRoute(null);
    setRouteName('');
    setRouteDescription('');
    setIsPublic(false);
  };

  const mapRoutes = calculatedRoute
    ? [
        {
          id: 'new-route',
          name: routeName,
          waypoints: calculatedRoute.waypoints,
          color: '#0000FF',
        },
      ]
    : [];

  const markers = [];
  if (startPoint) {
    markers.push({
      id: 'start',
      coordinate: startPoint,
      title: 'Start',
      pinColor: 'green',
    });
  }
  if (endPoint) {
    markers.push({
      id: 'end',
      coordinate: endPoint,
      title: 'End',
      pinColor: 'red',
    });
  }

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
            onPress={handleMapPress}
          />
        )}
      </View>

      <ScrollView className="flex-1 p-4">
        <Text className="text-lg font-bold mb-2">Create New Route</Text>
        
        <View className="mb-4">
          <Text className="font-medium mb-1">Route Name</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-2"
            value={routeName}
            onChangeText={setRouteName}
            placeholder="Enter route name"
          />
        </View>
        
        <View className="mb-4">
          <Text className="font-medium mb-1">Description (Optional)</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-2"
            value={routeDescription}
            onChangeText={setRouteDescription}
            placeholder="Enter route description"
            multiline
            numberOfLines={3}
          />
        </View>
        
        <View className="flex-row mb-4 items-center">
          <TouchableOpacity
            className={`w-6 h-6 mr-2 rounded ${isPublic ? 'bg-blue-500' : 'border border-gray-300'}`}
            onPress={() => setIsPublic(!isPublic)}
          >
            {isPublic && <Text className="text-white text-center">✓</Text>}
          </TouchableOpacity>
          <Text>Make this route public</Text>
        </View>
        
        <View className="mb-4">
          <Text className="font-medium mb-1">Instructions</Text>
          <Text className="text-gray-600">
            1. Tap on the map to set a start point (green marker)
          </Text>
          <Text className="text-gray-600">
            2. Tap again to set an end point (red marker)
          </Text>
          <Text className="text-gray-600">
            3. Enter a name and tap "Calculate Route"
          </Text>
        </View>
        
        <View className="flex-row justify-between mb-4">
          <TouchableOpacity
            className="bg-blue-500 py-3 px-6 rounded-lg"
            onPress={calculateRoute}
            disabled={loading || !startPoint || !endPoint}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white font-medium">Calculate Route</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            className="bg-gray-300 py-3 px-6 rounded-lg"
            onPress={resetRoute}
          >
            <Text className="font-medium">Reset</Text>
          </TouchableOpacity>
        </View>
        
        {calculatedRoute && (
          <View className="mt-4 p-4 bg-blue-50 rounded-lg">
            <Text className="font-bold text-lg">{routeName}</Text>
            <Text>Distance: {calculatedRoute.distance.toFixed(2)} km</Text>
            <Text>Duration: {calculatedRoute.estimatedDuration} minutes</Text>
            <Text>Elevation Gain: {calculatedRoute.elevationGain} meters</Text>
            <Text>Difficulty: {calculatedRoute.difficulty}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default RouteCreationScreen;
