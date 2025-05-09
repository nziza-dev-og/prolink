'use server';
import type { UserProfile } from '@/types';
import { db } from './firebase';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

export async function createUserProfile(userId: string, data: Omit<UserProfile, 'id' | 'uid' | 'createdAt' | 'connectionsCount'>): Promise<void> {
  const userRef = doc(db, 'users', userId);
  const profilePictureUrl = `https://picsum.photos/seed/${userId}/200/200`;
  const coverPhotoUrl = `https://picsum.photos/seed/${userId}cover/800/200`;
  
  await setDoc(userRef, {
    ...data,
    uid: userId,
    id: userId,
    profilePictureUrl,
    coverPhotoUrl,
    headline: data.headline || `${data.firstName} ${data.lastName} at ProLink`,
    summary: data.summary || '',
    location: data.location || '',
    connectionsCount: 0,
    workExperience: [],
    education: [],
    skills: [],
    createdAt: serverTimestamp(),
  });
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const data = userSnap.data();
    
    // Create a base profile object that can be typed safely
    const profile: { [key: string]: any } = { 
      ...data,
      id: userSnap.id,
      uid: userSnap.id,
    };

    // Convert Timestamps to ISO strings
    if (data.createdAt) {
      profile.createdAt = data.createdAt instanceof Timestamp 
        ? data.createdAt.toDate().toISOString() 
        : String(data.createdAt); // Ensure it's a string
    }
    if (data.updatedAt) {
      profile.updatedAt = data.updatedAt instanceof Timestamp 
        ? data.updatedAt.toDate().toISOString() 
        : String(data.updatedAt); // Ensure it's a string
    }
    
    return profile as UserProfile;
  } else {
    return null;
  }
}

export async function updateUserProfile(userId: string, data: Partial<Omit<UserProfile, 'id' | 'uid' | 'email' | 'createdAt' | 'profilePictureUrl' | 'coverPhotoUrl' | 'connectionsCount'>>): Promise<void> {
  const userRef = doc(db, 'users', userId);
  // Construct the update object, ensuring not to update fields that shouldn't be directly updatable here (like email, id, uid, etc.)
  const updateData: Record<string, any> = { ...data };
  
  // Add a field for when the profile was last updated
  updateData.updatedAt = serverTimestamp();

  await updateDoc(userRef, updateData);
}

