import { auth, db } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { UserProfile } from '@types/user';

// Strava API constants
const STRAVA_CLIENT_ID = 'YOUR_STRAVA_CLIENT_ID';
const STRAVA_CLIENT_SECRET = 'YOUR_STRAVA_CLIENT_SECRET';
const STRAVA_REDIRECT_URI = 'YOUR_REDIRECT_URI'; // e.g., https://your-app.com/strava-callback
const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/authorize';
const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';
const STRAVA_API_BASE_URL = 'https://www.strava.com/api/v3';

// Generate Strava authorization URL
export const getStravaAuthUrl = (): string => {
  const params = new URLSearchParams({
    client_id: STRAVA_CLIENT_ID,
    redirect_uri: STRAVA_REDIRECT_URI,
    response_type: 'code',
    approval_prompt: 'auto',
    scope: 'read,activity:read',
  });

  return `${STRAVA_AUTH_URL}?${params.toString()}`;
};

// Exchange authorization code for tokens
export const exchangeStravaCode = async (code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  athleteId: string;
}> => {
  try {
    const response = await fetch(STRAVA_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_at,
      athleteId: data.athlete.id.toString(),
    };
  } catch (error) {
    console.error('Error exchanging Strava code:', error);
    throw error;
  }
};

// Refresh Strava token
export const refreshStravaToken = async (refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}> => {
  try {
    const response = await fetch(STRAVA_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_at,
    };
  } catch (error) {
    console.error('Error refreshing Strava token:', error);
    throw error;
  }
};

// Connect Strava account to user profile
export const connectStravaAccount = async (
  code: string
): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Exchange code for tokens
    const { accessToken, refreshToken, athleteId } = await exchangeStravaCode(code);

    // Update user profile
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      stravaConnected: true,
      stravaId: athleteId,
      stravaAccessToken: accessToken,
      stravaRefreshToken: refreshToken,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error connecting Strava account:', error);
    throw error;
  }
};

// Disconnect Strava account
export const disconnectStravaAccount = async (): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Update user profile
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      stravaConnected: false,
      stravaId: null,
      stravaAccessToken: null,
      stravaRefreshToken: null,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error disconnecting Strava account:', error);
    throw error;
  }
};

// Get user's Strava activities
export const getStravaActivities = async (
  limit: number = 10,
  page: number = 1
): Promise<any[]> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get user profile to check Strava connection
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User profile not found');
    }
    
    const userProfile = userDoc.data() as UserProfile;
    
    if (!userProfile.stravaConnected || !userProfile.stravaAccessToken) {
      throw new Error('Strava account not connected');
    }

    // Check if token needs refresh
    let accessToken = userProfile.stravaAccessToken;
    
    // Note: In a real app, you would store the token expiration time and check it
    // For now, we'll assume the token might need refreshing
    if (userProfile.stravaRefreshToken) {
      try {
        const refreshedTokens = await refreshStravaToken(userProfile.stravaRefreshToken);
        accessToken = refreshedTokens.accessToken;
        
        // Update tokens in user profile
        await updateDoc(userRef, {
          stravaAccessToken: refreshedTokens.accessToken,
          stravaRefreshToken: refreshedTokens.refreshToken,
          updatedAt: new Date(),
        });
      } catch (refreshError) {
        console.error('Error refreshing token, trying with existing token:', refreshError);
      }
    }

    // Fetch activities
    const response = await fetch(
      `${STRAVA_API_BASE_URL}/athlete/activities?per_page=${limit}&page=${page}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting Strava activities:', error);
    throw error;
  }
};

// Get activity details
export const getStravaActivityDetails = async (activityId: string): Promise<any> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get user profile to check Strava connection
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User profile not found');
    }
    
    const userProfile = userDoc.data() as UserProfile;
    
    if (!userProfile.stravaConnected || !userProfile.stravaAccessToken) {
      throw new Error('Strava account not connected');
    }

    // Fetch activity details
    const response = await fetch(
      `${STRAVA_API_BASE_URL}/activities/${activityId}`,
      {
        headers: {
          'Authorization': `Bearer ${userProfile.stravaAccessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting Strava activity details:', error);
    throw error;
  }
};
