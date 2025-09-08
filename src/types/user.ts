export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  stravaConnected: boolean;
  stravaId?: string;
  stravaAccessToken?: string;
  stravaRefreshToken?: string;
  preferences?: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  preferredDistance?: number; // in kilometers
  preferredElevation?: 'flat' | 'hilly' | 'any';
  preferredSurfaceTypes?: SurfaceType[];
  preferredDifficulty?: 'easy' | 'moderate' | 'challenging';
  safetyPreference?: 'standard' | 'well-lit' | 'high-traffic';
}

export type SurfaceType = 'pavement' | 'trail' | 'track' | 'mixed';
