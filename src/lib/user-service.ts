'use server';
import type { UserProfile } from '@/types';
import { db } from './firebase';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, Timestamp, collection, getDocs } from 'firebase/firestore';

export async function createUserProfile(userId: string, data: Omit<UserProfile, 'id' | 'uid' | 'createdAt' | 'connectionsCount' | 'profilePictureUrl' | 'coverPhotoUrl' | 'connections'>): Promise<void> {
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
    connectionsCount: 0, // Initialize connectionsCount
    connections: [], // Initialize connections as empty array
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
      connectionsCount: data.connectionsCount || (data.connections?.length || 0),
      connections: data.connections || [],
    };

    // Convert Timestamps to ISO strings
    if (data.createdAt instanceof Timestamp) {
      profile.createdAt = data.createdAt.toDate().toISOString();
    } else if (data.createdAt && typeof data.createdAt.toDate === 'function') {
        profile.createdAt = data.createdAt.toDate().toISOString();
    } else if (data.createdAt) {
       profile.createdAt = String(data.createdAt);
    }


    if (data.updatedAt instanceof Timestamp) {
      profile.updatedAt = data.updatedAt.toDate().toISOString();
    } else if (data.updatedAt && typeof data.updatedAt.toDate === 'function') {
        profile.updatedAt = data.updatedAt.toDate().toISOString();
    } else if (data.updatedAt) {
      profile.updatedAt = String(data.updatedAt);
    }
    
    return profile as UserProfile;
  } else {
    return null;
  }
}

export async function updateUserProfile(userId: string, data: Partial<Omit<UserProfile, 'id' | 'uid' | 'email' | 'createdAt'>>): Promise<void> {
  const userRef = doc(db, 'users', userId);
  const updateData: Record<string, any> = { ...data };
  
  updateData.updatedAt = serverTimestamp();

  if (data.connections) {
    updateData.connectionsCount = data.connections.length;
  }

  // Ensure profilePictureUrl is handled correctly: if an empty string is passed, it means remove the picture.
  // Firestore doesn't store undefined fields. If `data.profilePictureUrl` is an empty string, 
  // and you want to remove it, you might need to handle this specifically if your default image logic relies on undefined.
  // For now, if it's '', it will be stored as ''. If it's undefined, it won't be updated.
  if(data.profilePictureUrl === ''){
     // If you want to revert to a default or remove, handle here.
     // For this implementation, an empty string will be saved.
     // If you want to truly remove it to use a default, you might set it to a specific "removed" value or delete the field.
  }


  await updateDoc(userRef, updateData);
}

export async function getTotalUsersCount(): Promise<number> {
  const usersCollectionRef = collection(db, 'users');
  const querySnapshot = await getDocs(usersCollectionRef);
  return querySnapshot.size;
}

export async function getAllUserProfiles(): Promise<UserProfile[]> {
  const usersCollectionRef = collection(db, 'users');
  const querySnapshot = await getDocs(query(usersCollectionRef, orderBy('createdAt', 'desc')));
  
  return Promise.all(querySnapshot.docs.map(async (docSnapshot) => {
    // Re-use getUserProfile logic to ensure consistent data transformation, especially for dates
    // This is slightly less performant than direct mapping but ensures consistency
    return (await getUserProfile(docSnapshot.id)) as UserProfile; 
  }));
}