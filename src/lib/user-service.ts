'use server';
import type { UserProfile } from '@/types';
import { db } from './firebase';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

export async function createUserProfile(userId: string, data: Omit<UserProfile, 'id' | 'uid' | 'createdAt' | 'connectionsCount' | 'profilePictureUrl' | 'coverPhotoUrl'>): Promise<void> {
  const userRef = doc(db, 'users', userId);
  const defaultProfilePictureUrl = `https://picsum.photos/seed/${userId}/200/200`;
  const defaultCoverPhotoUrl = `https://picsum.photos/seed/${userId}cover/800/200`;
  
  await setDoc(userRef, {
    ...data,
    uid: userId,
    id: userId, // Using uid also as id for simplicity, can be different if needed
    profilePictureUrl: data.profilePictureUrl || defaultProfilePictureUrl,
    coverPhotoUrl: data.coverPhotoUrl || defaultCoverPhotoUrl,
    headline: data.headline || `${data.firstName} ${data.lastName} at ProLink`,
    summary: data.summary || '',
    location: data.location || '',
    connectionsCount: 0,
    workExperience: data.workExperience || [],
    education: data.education || [],
    skills: data.skills || [],
    createdAt: serverTimestamp(),
  });
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const data = userSnap.data();
    
    const profile: { [key: string]: any } = { 
      ...data,
      id: userSnap.id,
      uid: userSnap.id, 
    };

    if (data.createdAt instanceof Timestamp) {
      profile.createdAt = data.createdAt.toDate().toISOString();
    } else if (data.createdAt) {
       profile.createdAt = String(data.createdAt);
    }

    if (data.updatedAt instanceof Timestamp) {
      profile.updatedAt = data.updatedAt.toDate().toISOString();
    } else if (data.updatedAt) {
      profile.updatedAt = String(data.updatedAt);
    }
    
    return profile as UserProfile;
  } else {
    return null;
  }
}

export async function updateUserProfile(userId: string, data: Partial<Omit<UserProfile, 'id' | 'uid' | 'email' | 'createdAt' | 'connectionsCount'>>): Promise<void> {
  const userRef = doc(db, 'users', userId);
  const updateData: Record<string, any> = { ...data };
  
  updateData.updatedAt = serverTimestamp();

  await updateDoc(userRef, updateData);
}
