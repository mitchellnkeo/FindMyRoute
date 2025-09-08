import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { UserPreferences, UserProfile } from '../types/user';

// Get user profile by ID
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (
  userId: string, 
  profileData: Partial<UserProfile>
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Add updated timestamp
    const updatedData = {
      ...profileData,
      updatedAt: new Date()
    };
    
    await updateDoc(userRef, updatedData);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Update user preferences
export const updateUserPreferences = async (
  userId: string, 
  preferences: Partial<UserPreferences>
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      'preferences': preferences,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
};

// Connect Strava account
export const connectStravaAccount = async (
  userId: string,
  stravaId: string,
  accessToken: string,
  refreshToken: string
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      stravaConnected: true,
      stravaId,
      stravaAccessToken: accessToken,
      stravaRefreshToken: refreshToken,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error connecting Strava account:', error);
    throw error;
  }
};

// Disconnect Strava account
export const disconnectStravaAccount = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      stravaConnected: false,
      stravaId: null,
      stravaAccessToken: null,
      stravaRefreshToken: null,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error disconnecting Strava account:', error);
    throw error;
  }
};
