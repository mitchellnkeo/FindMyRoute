import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signInWithApple,
  signOut,
  createUserProfile,
  checkUserExists,
  getCurrentUserProfile,
} from '@services/auth';

// Mock Firebase
jest.mock('@services/firebase', () => {
  const mockUser = {
    uid: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg',
  };

  return {
    auth: {
      currentUser: mockUser,
    },
    db: {
      // Mock implementation
    },
  };
});

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn().mockResolvedValue({
    user: {
      uid: 'test-user-id',
      email: 'test@example.com',
    },
  }),
  signInWithEmailAndPassword: jest.fn().mockResolvedValue({
    user: {
      uid: 'test-user-id',
      email: 'test@example.com',
    },
  }),
  GoogleAuthProvider: jest.fn().mockImplementation(() => ({})),
  OAuthProvider: jest.fn().mockImplementation(() => ({})),
  signInWithPopup: jest.fn().mockResolvedValue({
    user: {
      uid: 'test-user-id',
      email: 'test@example.com',
    },
  }),
  signOut: jest.fn().mockResolvedValue(undefined),
  onAuthStateChanged: jest.fn().mockImplementation((auth, callback) => {
    callback(auth.currentUser);
    return jest.fn(); // Return unsubscribe function
  }),
}));

// Mock Firestore
jest.mock('firebase/firestore', () => ({
  doc: jest.fn().mockReturnValue({}),
  setDoc: jest.fn().mockResolvedValue(undefined),
  getDoc: jest.fn().mockResolvedValue({
    exists: jest.fn().mockReturnValue(true),
    data: jest.fn().mockReturnValue({
      id: 'test-user-id',
      email: 'test@example.com',
      displayName: 'Test User',
      stravaConnected: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  }),
  serverTimestamp: jest.fn().mockReturnValue({}),
}));

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('signs up with email and password', async () => {
    const createUserWithEmailAndPassword = require('firebase/auth').createUserWithEmailAndPassword;
    const setDoc = require('firebase/firestore').setDoc;

    await signUpWithEmail('test@example.com', 'password123');

    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'test@example.com',
      'password123'
    );
    expect(setDoc).toHaveBeenCalled();
  });

  it('signs in with email and password', async () => {
    const signInWithEmailAndPassword = require('firebase/auth').signInWithEmailAndPassword;

    await signInWithEmail('test@example.com', 'password123');

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'test@example.com',
      'password123'
    );
  });

  it('signs in with Google', async () => {
    const signInWithPopup = require('firebase/auth').signInWithPopup;
    const getDoc = require('firebase/firestore').getDoc;

    await signInWithGoogle();

    expect(signInWithPopup).toHaveBeenCalled();
    expect(getDoc).toHaveBeenCalled();
  });

  it('signs in with Apple', async () => {
    const signInWithPopup = require('firebase/auth').signInWithPopup;
    const getDoc = require('firebase/firestore').getDoc;

    await signInWithApple();

    expect(signInWithPopup).toHaveBeenCalled();
    expect(getDoc).toHaveBeenCalled();
  });

  it('signs out', async () => {
    const firebaseSignOut = require('firebase/auth').signOut;

    await signOut();

    expect(firebaseSignOut).toHaveBeenCalled();
  });

  it('creates user profile', async () => {
    const setDoc = require('firebase/firestore').setDoc;
    const user = {
      uid: 'test-user-id',
      email: 'test@example.com',
      displayName: 'Test User',
    };

    await createUserProfile(user);

    expect(setDoc).toHaveBeenCalled();
  });

  it('checks if user exists', async () => {
    const getDoc = require('firebase/firestore').getDoc;
    const exists = await checkUserExists('test-user-id');

    expect(getDoc).toHaveBeenCalled();
    expect(exists).toBe(true);
  });

  it('gets current user profile', async () => {
    const getDoc = require('firebase/firestore').getDoc;
    const profile = await getCurrentUserProfile();

    expect(getDoc).toHaveBeenCalled();
    expect(profile).toEqual(expect.objectContaining({
      id: 'test-user-id',
      email: 'test@example.com',
    }));
  });
});
