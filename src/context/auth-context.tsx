
'use client';

import type { User as FirebaseUser } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from 'react';
import { auth } from '@/lib/firebase';
import { getUserProfile, updateUserProfile } from '@/lib/user-service';
import type { UserProfile } from '@/types';
import { onAuthStateChanged } from 'firebase/auth';
// serverTimestamp from 'firebase/firestore' should not be used in client components if its result is passed to server actions.
// Instead, we'll use a string marker.

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
  const [previousFirebaseUserId, setPreviousFirebaseUserId] = useState<string | null>(null);

  const fetchAndSetUserProfile = useCallback(async (user: FirebaseUser | null) => {
    if (user) {
      setFirebaseUser(user);
      try {
        // Use 'SERVER_TIMESTAMP' marker to tell updateUserProfile to use serverTimestamp()
        await updateUserProfile(user.uid, { isActive: true, lastLogin: 'SERVER_TIMESTAMP' });
        const profile = await getUserProfile(user.uid);
        setCurrentUser(profile);
        if (previousFirebaseUserId && previousFirebaseUserId !== user.uid) {
          await updateUserProfile(previousFirebaseUserId, { isActive: false });
        }
        setPreviousFirebaseUserId(user.uid); 
      } catch (error) {
        console.error("AuthContext: Error fetching/updating user profile:", error);
        setCurrentUser(null);
      }
    } else {
      if (previousFirebaseUserId) {
        try {
          await updateUserProfile(previousFirebaseUserId, { isActive: false });
        } catch (error) {
          console.error("AuthContext: Error setting user to inactive on logout:", error);
        }
      }
      setFirebaseUser(null);
      setCurrentUser(null);
      setPreviousFirebaseUserId(null); 
    }
    setLoadingAuth(false);
  }, [previousFirebaseUserId]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoadingAuth(true); 
      await fetchAndSetUserProfile(user);
    });
    return () => unsubscribe();
  }, [fetchAndSetUserProfile]);

  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (firebaseUser) {
        try {
          // isActive: false will also update 'updatedAt' via updateUserProfile
          await updateUserProfile(firebaseUser.uid, { isActive: false });
        } catch (e) {
          // console.warn("AuthContext: Failed to set user inactive on beforeunload", e);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [firebaseUser]);


  const refetchUserProfile = useCallback(async () => {
    if (firebaseUser) {
      setLoadingAuth(true);
      try {
        const profile = await getUserProfile(firebaseUser.uid);
        setCurrentUser(profile);
      } catch (error) {
        console.error("AuthContext: Error refetching user profile:", error);
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
