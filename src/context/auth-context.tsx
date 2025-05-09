'use client';

import type { User as FirebaseUser } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
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
  const [loadingAuth, setLoadingAuth] = useState(true);

  const fetchAndSetUserProfile = async (user: FirebaseUser | null) => {
    if (user) {
      setFirebaseUser(user);
      const profile = await getUserProfile(user.uid);
      setCurrentUser(profile);
    } else {
      setFirebaseUser(null);
      setCurrentUser(null);
    }
    setLoadingAuth(false);
  };
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      await fetchAndSetUserProfile(user);
    });
    return () => unsubscribe();
  }, []);

  const refetchUserProfile = async () => {
    if (firebaseUser) {
      setLoadingAuth(true);
      const profile = await getUserProfile(firebaseUser.uid);
      setCurrentUser(profile);
      setLoadingAuth(false);
    }
  }

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
