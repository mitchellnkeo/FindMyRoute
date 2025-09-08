import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Alert, Linking } from 'react-native';
// Auth is imported from firebase service when needed
import { getStravaAuthUrl, connectStravaAccount, disconnectStravaAccount, getStravaActivities } from '../services/strava';
import { getCurrentUserProfile } from '../services/auth';
import { UserProfile } from '../types/user';

const StravaConnectScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [stravaActivities, setStravaActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await getCurrentUserProfile();
        setUserProfile(profile);
        
        // If connected to Strava, load activities
        if (profile?.stravaConnected) {
          loadStravaActivities();
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        Alert.alert('Error', 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  const handleStravaConnect = async () => {
    try {
      const authUrl = getStravaAuthUrl();
      await Linking.openURL(authUrl);
      
      // Note: In a real app, you would need to handle the redirect back to your app
      // and extract the authorization code from the URL
      // For this example, we'll simulate receiving a code
      const mockCode = 'simulated_auth_code';
      
      setConnecting(true);
      await connectStravaAccount(mockCode);
      
      // Reload user profile
      const updatedProfile = await getCurrentUserProfile();
      setUserProfile(updatedProfile);
      
      // Load activities
      if (updatedProfile?.stravaConnected) {
        loadStravaActivities();
      }
      
      Alert.alert('Success', 'Strava account connected successfully');
    } catch (error) {
      console.error('Error connecting Strava account:', error);
      Alert.alert('Error', 'Failed to connect Strava account');
    } finally {
      setConnecting(false);
    }
  };

  const handleStravaDisconnect = async () => {
    try {
      setConnecting(true);
      await disconnectStravaAccount();
      
      // Reload user profile
      const updatedProfile = await getCurrentUserProfile();
      setUserProfile(updatedProfile);
      
      // Clear activities
      setStravaActivities([]);
      
      Alert.alert('Success', 'Strava account disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting Strava account:', error);
      Alert.alert('Error', 'Failed to disconnect Strava account');
    } finally {
      setConnecting(false);
    }
  };

  const loadStravaActivities = async () => {
    try {
      setActivitiesLoading(true);
      const activities = await getStravaActivities(10, 1);
      setStravaActivities(activities);
    } catch (error) {
      console.error('Error loading Strava activities:', error);
      Alert.alert('Error', 'Failed to load Strava activities');
    } finally {
      setActivitiesLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-4">Loading profile...</Text>
      </View>
    );
  }

  const isConnected = userProfile?.stravaConnected;

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 p-4">
        <View className="items-center mb-6">
          <View className="w-20 h-20 bg-orange-500 rounded-full items-center justify-center mb-2">
            <Text className="text-white text-2xl font-bold">S</Text>
          </View>
          <Text className="text-xl font-bold">Strava Integration</Text>
        </View>

        <View className="bg-gray-100 p-4 rounded-lg mb-6">
          <Text className="text-base mb-2">
            Connect your Strava account to:
          </Text>
          <Text className="text-gray-700 mb-1">• Import your running history</Text>
          <Text className="text-gray-700 mb-1">• Get personalized route recommendations</Text>
          <Text className="text-gray-700 mb-1">• Track your progress over time</Text>
        </View>

        {connecting ? (
          <View className="items-center my-4">
            <ActivityIndicator size="small" color="#0000ff" />
            <Text className="mt-2">{isConnected ? 'Disconnecting...' : 'Connecting...'}</Text>
          </View>
        ) : (
          <TouchableOpacity
            className={`py-3 px-4 rounded-lg items-center ${
              isConnected ? 'bg-red-500' : 'bg-orange-500'
            }`}
            onPress={isConnected ? handleStravaDisconnect : handleStravaConnect}
          >
            <Text className="text-white font-medium">
              {isConnected ? 'Disconnect from Strava' : 'Connect with Strava'}
            </Text>
          </TouchableOpacity>
        )}

        {isConnected && (
          <View className="mt-8">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold">Recent Activities</Text>
              <TouchableOpacity 
                className="py-1 px-3 bg-gray-200 rounded-lg"
                onPress={loadStravaActivities}
                disabled={activitiesLoading}
              >
                <Text>Refresh</Text>
              </TouchableOpacity>
            </View>

            {activitiesLoading ? (
              <ActivityIndicator size="small" color="#0000ff" />
            ) : stravaActivities.length > 0 ? (
              stravaActivities.map((activity, index) => (
                <View 
                  key={index} 
                  className="p-4 mb-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <Text className="font-bold">{activity.name || `Activity ${index + 1}`}</Text>
                  <Text>Distance: {((activity.distance || 0) / 1000).toFixed(2)} km</Text>
                  <Text>Duration: {Math.floor((activity.moving_time || 0) / 60)} minutes</Text>
                  <Text>Date: {new Date(activity.start_date).toLocaleDateString()}</Text>
                </View>
              ))
            ) : (
              <Text className="text-gray-500 italic">No activities found</Text>
            )}
          </View>
        )}

        {!isConnected && (
          <View className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <Text className="text-center text-gray-500">
              You can also use the app without connecting to Strava.
              Connect anytime later from your profile settings.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default StravaConnectScreen;
