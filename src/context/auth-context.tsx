'use client';

import type { User as FirebaseUser } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from 'react';
import { auth } from '@/lib/firebase';
import { getUserProfile } from '@/lib/user-service';
import type { UserProfile } from '@/types';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loadingAuth: boolean;
  refetchUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true); // Initial state is true

  const fetchAndSetUserProfile = useCallback(async (user: FirebaseUser | null) => {
    if (user) {
      setFirebaseUser(user);
      try {
        const profile = await getUserProfile(user.uid);
        setCurrentUser(profile);
      } catch (error) {
        console.error("AuthContext: Error fetching user profile:", error);
        setCurrentUser(null); // Ensure currentUser is null on error
      }
    } else {
      setFirebaseUser(null);
      setCurrentUser(null);
    }
    setLoadingAuth(false); // Set loading to false after profile is fetched or user is null
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoadingAuth(true); // Set loading to true when auth state might be changing
      await fetchAndSetUserProfile(user);
      // setLoadingAuth(false) is handled within fetchAndSetUserProfile
    });
    return () => unsubscribe();
  }, [fetchAndSetUserProfile]);

  const refetchUserProfile = useCallback(async () => {
    if (firebaseUser) {
      setLoadingAuth(true);
      try {
        const profile = await getUserProfile(firebaseUser.uid);
        setCurrentUser(profile);
      } catch (error) {
        console.error("AuthContext: Error refetching user profile:", error);
        // Decide if you want to clear currentUser or keep the old one on error
        // setCurrentUser(null); 
      } finally {
        setLoadingAuth(false);
      }
    }
  }, [firebaseUser]);

  return (
    <AuthContext.Provider value={{ currentUser, firebaseUser, loadingAuth, refetchUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
