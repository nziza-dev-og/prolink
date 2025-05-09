'use client';

import type { User as FirebaseUser } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from 'react';
import { auth } from '@/lib/firebase';
import { getUserProfile, updateUserProfile } from '@/lib/user-service';
import type { UserProfile } from '@/types';
import { onAuthStateChanged } from 'firebase/auth';
import { serverTimestamp } from 'firebase/firestore';

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
        // Update user status to active and set lastLogin time
        // Cast serverTimestamp() to any to satisfy strict UserProfile type if needed, Firestore handles it.
        await updateUserProfile(user.uid, { isActive: true, lastLogin: serverTimestamp() as any });
        const profile = await getUserProfile(user.uid);
        setCurrentUser(profile);
        if (previousFirebaseUserId && previousFirebaseUserId !== user.uid) {
          // If a different user was previously logged in, ensure they are marked inactive
          await updateUserProfile(previousFirebaseUserId, { isActive: false });
        }
        setPreviousFirebaseUserId(user.uid); 
      } catch (error) {
        console.error("AuthContext: Error fetching/updating user profile:", error);
        setCurrentUser(null);
      }
    } else {
      // User is logging out or not logged in
      if (previousFirebaseUserId) {
        // If there was a previously logged-in user, set them to inactive
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

  // Best-effort to set user inactive on tab close
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (firebaseUser) {
        // This is a best-effort attempt. Modern browsers may not guarantee its full execution.
        // For reliable presence, Firebase Realtime Database presence or Cloud Functions are better.
        try {
          await updateUserProfile(firebaseUser.uid, { isActive: false });
        } catch (e) {
          // console.warn("AuthContext: Failed to set user inactive on beforeunload", e);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Potentially call handleBeforeUnload here if component unmounts for other reasons while user is still "logged in"
      // This can be complex as it might conflict with explicit logout.
      // For now, relying on onAuthStateChanged for explicit logouts.
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
