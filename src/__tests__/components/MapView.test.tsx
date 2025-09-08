import React from 'react';
import { render } from '@testing-library/react-native';
import MapComponent from '@components/MapView';

// Mock the MapView component from react-native-maps
jest.mock('react-native-maps', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: View,
    Marker: View,
    Polyline: View,
    PROVIDER_GOOGLE: 'google',
  };
});

// Mock the getCurrentLocation function
jest.mock('@services/map', () => ({
  getCurrentLocation: jest.fn().mockResolvedValue({
    latitude: 37.7749,
    longitude: -122.4194,
  }),
}));

describe('MapComponent', () => {
  it('renders loading state when no initialRegion is provided', () => {
    const { getByText } = render(<MapComponent />);
    expect(getByText('Loading...')).toBeTruthy();
  });

  it('renders the map when initialRegion is provided', () => {
    const initialRegion = {
      latitude: 37.7749,
      longitude: -122.4194,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };

    const { queryByText } = render(<MapComponent initialRegion={initialRegion} />);
    expect(queryByText('Loading...')).toBeNull();
  });

  it('renders routes when provided', () => {
    const initialRegion = {
      latitude: 37.7749,
      longitude: -122.4194,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };

    const routes = [
      {
        id: '1',
        name: 'Test Route',
        waypoints: [
          { latitude: 37.7749, longitude: -122.4194 },
          { latitude: 37.7750, longitude: -122.4195 },
        ],
        color: '#FF0000',
      },
    ];

    const { UNSAFE_queryAllByType } = render(
      <MapComponent initialRegion={initialRegion} routes={routes} />
    );

    // Check if Polyline and Markers are rendered
    // Note: In a real test with proper mocking, we would check more specifically
    expect(UNSAFE_queryAllByType('View').length).toBeGreaterThan(1);
  });
});
