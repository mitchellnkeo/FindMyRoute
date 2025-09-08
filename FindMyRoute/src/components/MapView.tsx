import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { GeoPoint } from '@types/route';
import { getCurrentLocation } from '@services/map';

interface MapComponentProps {
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  routes?: Array<{
    id: string;
    name: string;
    waypoints: GeoPoint[];
    color?: string;
  }>;
  onRegionChange?: (region: any) => void;
  onPress?: (event: any) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({
  initialRegion,
  routes = [],
  onRegionChange,
  onPress,
}) => {
  const [region, setRegion] = useState(initialRegion);
  const [loading, setLoading] = useState(!initialRegion);

  useEffect(() => {
    if (!initialRegion) {
      // If no initial region provided, use current location
      const getLocation = async () => {
        try {
          const location = await getCurrentLocation();
          setRegion({
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
          setLoading(false);
        } catch (error) {
          console.error('Error getting current location:', error);
          // Fallback to a default location (e.g., New York City)
          setRegion({
            latitude: 40.7128,
            longitude: -74.0060,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
          setLoading(false);
        }
      };

      getLocation();
    }
  }, [initialRegion]);

  const handleRegionChange = (newRegion: any) => {
    setRegion(newRegion);
    if (onRegionChange) {
      onRegionChange(newRegion);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <MapView
      className="flex-1 w-full h-full"
      provider={PROVIDER_GOOGLE}
      region={region}
      onRegionChangeComplete={handleRegionChange}
      onPress={onPress}
    >
      {routes.map((route) => (
        <React.Fragment key={route.id}>
          <Polyline
            coordinates={route.waypoints}
            strokeColor={route.color || '#FF0000'}
            strokeWidth={3}
          />
          {route.waypoints.length > 0 && (
            <>
              <Marker
                coordinate={route.waypoints[0]}
                title="Start"
                description={`Start of ${route.name}`}
                pinColor="green"
              />
              <Marker
                coordinate={route.waypoints[route.waypoints.length - 1]}
                title="End"
                description={`End of ${route.name}`}
                pinColor="red"
              />
            </>
          )}
        </React.Fragment>
      ))}
    </MapView>
  );
};

export default MapComponent;
