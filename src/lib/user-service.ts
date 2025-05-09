'use server';
import type { UserProfile } from '@/types';
import { db } from './firebase';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, Timestamp, collection, getDocs, query, where, orderBy } from 'firebase/firestore';

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
  
  if (data.profilePictureUrl === '') {
    // If an empty string is passed for profilePictureUrl,
    // it means the user wants to remove/reset it.
    // We can set it to a default or handle as per application logic.
    // For now, we allow an empty string to be saved, or set to undefined to remove from doc.
    // Let's use a default if it's empty.
    updateData.profilePictureUrl = `https://picsum.photos/seed/${userId}/200/200`;
  } else if (data.profilePictureUrl === undefined && !Object.prototype.hasOwnProperty.call(data, 'profilePictureUrl')) {
    // If profilePictureUrl is not in data at all, don't touch it.
    // If it's explicitly undefined (though Zod schema makes it optional().or(z.literal(''))), handle if needed.
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
    return (await getUserProfile(docSnapshot.id)) as UserProfile; 
  }));
}

export async function searchUserProfiles(searchTerm: string, currentUserId: string): Promise<UserProfile[]> {
  if (!searchTerm.trim()) {
    return [];
  }

  const usersCollectionRef = collection(db, 'users');
  const profilesMap = new Map<string, UserProfile>();

  // Query by email (exact match)
  const emailQuery = query(usersCollectionRef, where('email', '==', searchTerm));
  const emailSnap = await getDocs(emailQuery);
  for (const docSnap of emailSnap.docs) {
    if (docSnap.id !== currentUserId) {
      const profile = await getUserProfile(docSnap.id);
      if (profile) profilesMap.set(docSnap.id, profile);
    }
  }

  // Query by first name (prefix match - case sensitive)
  const firstNameQuery = query(
    usersCollectionRef,
    where('firstName', '>=', searchTerm),
    where('firstName', '<=', searchTerm + '\uf8ff'),
    orderBy('firstName') // Required for range queries on different fields
  );
  const firstNameSnap = await getDocs(firstNameQuery);
  for (const docSnap of firstNameSnap.docs) {
    if (docSnap.id !== currentUserId && !profilesMap.has(docSnap.id)) {
      const profile = await getUserProfile(docSnap.id);
      if (profile) profilesMap.set(docSnap.id, profile);
    }
  }

  // Query by last name (prefix match - case sensitive)
  const lastNameQuery = query(
    usersCollectionRef,
    where('lastName', '>=', searchTerm),
    where('lastName', '<=', searchTerm + '\uf8ff'),
    orderBy('lastName') // Required for range queries on different fields
  );
  const lastNameSnap = await getDocs(lastNameQuery);
  for (const docSnap of lastNameSnap.docs) {
    if (docSnap.id !== currentUserId && !profilesMap.has(docSnap.id)) {
      const profile = await getUserProfile(docSnap.id);
      if (profile) profilesMap.set(docSnap.id, profile);
    }
  }
  
  return Array.from(profilesMap.values()).slice(0, 10); // Limit results
}
