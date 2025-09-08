import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { RouteFilters as FilterType } from '@services/routeFilters';
import { 
  getDistanceRangeOptions, 
  getDifficultyOptions, 
  getSurfaceTypeOptions, 
  getElevationRangeOptions 
} from '@services/routeFilters';
import { SurfaceType } from '@types/route';

interface RouteFiltersProps {
  onApplyFilters: (filters: FilterType) => void;
  initialFilters?: FilterType;
}

const RouteFilters: React.FC<RouteFiltersProps> = ({ 
  onApplyFilters, 
  initialFilters = {} 
}) => {
  const [filters, setFilters] = useState<FilterType>(initialFilters);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const distanceOptions = getDistanceRangeOptions();
  const difficultyOptions = getDifficultyOptions();
  const surfaceTypeOptions = getSurfaceTypeOptions();
  const elevationOptions = getElevationRangeOptions();

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const toggleDistanceFilter = (min: number, max: number) => {
    setFilters(prev => ({
      ...prev,
      minDistance: prev.minDistance === min ? undefined : min,
      maxDistance: prev.maxDistance === max ? undefined : max,
    }));
  };

  const toggleDifficultyFilter = (difficulty: 'easy' | 'moderate' | 'challenging') => {
    setFilters(prev => {
      const currentDifficulties = prev.difficulty || [];
      const newDifficulties = currentDifficulties.includes(difficulty)
        ? currentDifficulties.filter(d => d !== difficulty)
        : [...currentDifficulties, difficulty];
      
      return {
        ...prev,
        difficulty: newDifficulties.length > 0 ? newDifficulties : undefined,
      };
    });
  };

  const toggleSurfaceTypeFilter = (surfaceType: SurfaceType) => {
    setFilters(prev => {
      const currentSurfaceTypes = prev.surfaceTypes || [];
      const newSurfaceTypes = currentSurfaceTypes.includes(surfaceType)
        ? currentSurfaceTypes.filter(s => s !== surfaceType)
        : [...currentSurfaceTypes, surfaceType];
      
      return {
        ...prev,
        surfaceTypes: newSurfaceTypes.length > 0 ? newSurfaceTypes : undefined,
      };
    });
  };

  const toggleElevationFilter = (min: number, max: number) => {
    setFilters(prev => ({
      ...prev,
      minElevation: prev.minElevation === min ? undefined : min,
      maxElevation: prev.maxElevation === max ? undefined : max,
    }));
  };

  const toggleAmenityFilter = (amenity: 'hasParking' | 'hasBathrooms' | 'hasWaterFountains' | 'hasLighting') => {
    setFilters(prev => ({
      ...prev,
      [amenity]: !prev[amenity],
    }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
  };

  const clearFilters = () => {
    setFilters({});
  };

  const isFilterActive = Object.values(filters).some(value => 
    value !== undefined && 
    (Array.isArray(value) ? value.length > 0 : true)
  );

  return (
    <View className="bg-white rounded-lg shadow-md">
      <ScrollView>
        {/* Distance Section */}
        <TouchableOpacity 
          className="flex-row justify-between items-center p-4 border-b border-gray-200"
          onPress={() => toggleSection('distance')}
        >
          <Text className="font-bold">Distance</Text>
          <Text className={activeSection === 'distance' ? 'rotate-180' : ''}>▼</Text>
        </TouchableOpacity>
        
        {activeSection === 'distance' && (
          <View className="p-4 bg-gray-50">
            {distanceOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                className={`flex-row items-center py-2 ${
                  filters.minDistance === option.min && filters.maxDistance === option.max
                    ? 'opacity-100'
                    : 'opacity-50'
                }`}
                onPress={() => toggleDistanceFilter(option.min, option.max)}
              >
                <View className={`w-5 h-5 rounded-full border border-blue-500 mr-2 ${
                  filters.minDistance === option.min && filters.maxDistance === option.max
                    ? 'bg-blue-500'
                    : 'bg-white'
                }`} />
                <Text>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Difficulty Section */}
        <TouchableOpacity 
          className="flex-row justify-between items-center p-4 border-b border-gray-200"
          onPress={() => toggleSection('difficulty')}
        >
          <Text className="font-bold">Difficulty</Text>
          <Text className={activeSection === 'difficulty' ? 'rotate-180' : ''}>▼</Text>
        </TouchableOpacity>
        
        {activeSection === 'difficulty' && (
          <View className="p-4 bg-gray-50">
            {difficultyOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                className={`flex-row items-center py-2 ${
                  filters.difficulty?.includes(option.value)
                    ? 'opacity-100'
                    : 'opacity-50'
                }`}
                onPress={() => toggleDifficultyFilter(option.value)}
              >
                <View className={`w-5 h-5 rounded border border-blue-500 mr-2 ${
                  filters.difficulty?.includes(option.value)
                    ? 'bg-blue-500'
                    : 'bg-white'
                }`} />
                <Text>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Surface Type Section */}
        <TouchableOpacity 
          className="flex-row justify-between items-center p-4 border-b border-gray-200"
          onPress={() => toggleSection('surface')}
        >
          <Text className="font-bold">Surface Type</Text>
          <Text className={activeSection === 'surface' ? 'rotate-180' : ''}>▼</Text>
        </TouchableOpacity>
        
        {activeSection === 'surface' && (
          <View className="p-4 bg-gray-50">
            {surfaceTypeOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                className={`flex-row items-center py-2 ${
                  filters.surfaceTypes?.includes(option.value)
                    ? 'opacity-100'
                    : 'opacity-50'
                }`}
                onPress={() => toggleSurfaceTypeFilter(option.value)}
              >
                <View className={`w-5 h-5 rounded border border-blue-500 mr-2 ${
                  filters.surfaceTypes?.includes(option.value)
                    ? 'bg-blue-500'
                    : 'bg-white'
                }`} />
                <Text>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Elevation Section */}
        <TouchableOpacity 
          className="flex-row justify-between items-center p-4 border-b border-gray-200"
          onPress={() => toggleSection('elevation')}
        >
          <Text className="font-bold">Elevation</Text>
          <Text className={activeSection === 'elevation' ? 'rotate-180' : ''}>▼</Text>
        </TouchableOpacity>
        
        {activeSection === 'elevation' && (
          <View className="p-4 bg-gray-50">
            {elevationOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                className={`flex-row items-center py-2 ${
                  filters.minElevation === option.min && filters.maxElevation === option.max
                    ? 'opacity-100'
                    : 'opacity-50'
                }`}
                onPress={() => toggleElevationFilter(option.min, option.max)}
              >
                <View className={`w-5 h-5 rounded-full border border-blue-500 mr-2 ${
                  filters.minElevation === option.min && filters.maxElevation === option.max
                    ? 'bg-blue-500'
                    : 'bg-white'
                }`} />
                <Text>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Amenities Section */}
        <TouchableOpacity 
          className="flex-row justify-between items-center p-4 border-b border-gray-200"
          onPress={() => toggleSection('amenities')}
        >
          <Text className="font-bold">Amenities</Text>
          <Text className={activeSection === 'amenities' ? 'rotate-180' : ''}>▼</Text>
        </TouchableOpacity>
        
        {activeSection === 'amenities' && (
          <View className="p-4 bg-gray-50">
            {[
              { key: 'hasParking', label: 'Parking Available' },
              { key: 'hasBathrooms', label: 'Bathrooms' },
              { key: 'hasWaterFountains', label: 'Water Fountains' },
              { key: 'hasLighting', label: 'Lighting' },
            ].map((amenity, index) => (
              <TouchableOpacity
                key={index}
                className="flex-row items-center py-2"
                onPress={() => toggleAmenityFilter(amenity.key as any)}
              >
                <View className={`w-5 h-5 rounded border border-blue-500 mr-2 ${
                  filters[amenity.key as keyof FilterType]
                    ? 'bg-blue-500'
                    : 'bg-white'
                }`} />
                <Text>{amenity.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <View className="flex-row justify-between p-4 border-t border-gray-200">
        <TouchableOpacity
          className="py-2 px-4"
          onPress={clearFilters}
          disabled={!isFilterActive}
        >
          <Text className={isFilterActive ? 'text-blue-500' : 'text-gray-400'}>
            Clear All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className="bg-blue-500 py-2 px-6 rounded-lg"
          onPress={handleApplyFilters}
        >
          <Text className="text-white font-medium">Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RouteFilters;
