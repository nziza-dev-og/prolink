
'use server';
import type { UserProfile } from '@/types';
import { db } from './firebase';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  increment,
  arrayUnion,
  arrayRemove,
  writeBatch,
  deleteDoc,
  limit,
  documentId, 
} from 'firebase/firestore';

export async function createUserProfile(userId: string, data: Omit<UserProfile, 'id' | 'uid' | 'createdAt' | 'connectionsCount' | 'profilePictureUrl' | 'coverPhotoUrl' | 'connections' | 'pendingInvitationsCount' | 'pendingInvitations' | 'suggestedConnections'>): Promise<void> {
  const userRef = doc(db, 'users', userId);
  const defaultProfilePictureUrl = `https://picsum.photos/seed/${userId}/200/200`;
  const defaultCoverPhotoUrl = `https://picsum.photos/seed/${userId}cover/800/200`;
  
  await setDoc(userRef, {
    ...data,
    uid: userId,
    id: userId, 
    profilePictureUrl: data.profilePictureUrl || defaultProfilePictureUrl,
    coverPhotoUrl: data.coverPhotoUrl || defaultCoverPhotoUrl,
    headline: data.headline || `${data.firstName} ${data.lastName} at ProLink`,
    summary: data.summary || '',
    location: data.location || '',
    connectionsCount: 0,
    connections: [], 
    pendingInvitationsCount: 0,
    pendingInvitations: [],
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
      pendingInvitationsCount: data.pendingInvitationsCount || (data.pendingInvitations?.length || 0),
      pendingInvitations: data.pendingInvitations || [],
    };

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

export async function updateUserProfile(userId: string, data: Partial<Omit<UserProfile, 'id' | 'uid' | 'email' | 'createdAt' | 'suggestedConnections'>>): Promise<void> {
  const userRef = doc(db, 'users', userId);
  // Create a mutable copy for updates
  const updateData: { [key: string]: any } = { ...data };
  
  updateData.updatedAt = serverTimestamp();

  if (data.hasOwnProperty('profilePictureUrl')) {
    if (!data.profilePictureUrl) { // Handles empty string, null, undefined
      updateData.profilePictureUrl = `https://picsum.photos/seed/${userId}/200/200`; 
    } else {
      updateData.profilePictureUrl = data.profilePictureUrl;
    }
  }
  
  if (data.hasOwnProperty('coverPhotoUrl')) {
    if (!data.coverPhotoUrl) {
        updateData.coverPhotoUrl = `https://picsum.photos/seed/${userId}cover/800/200`;
    } else {
        updateData.coverPhotoUrl = data.coverPhotoUrl;
    }
  }
  
  if (data.connections && Array.isArray(data.connections)) {
    updateData.connectionsCount = data.connections.length;
  }
  if (data.pendingInvitations && Array.isArray(data.pendingInvitations)) {
    updateData.pendingInvitationsCount = data.pendingInvitations.length;
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
    const profile = await getUserProfile(docSnapshot.id);
    return profile as UserProfile; 
  }));
}

export async function searchUserProfiles(searchTerm: string, currentUserId: string): Promise<UserProfile[]> {
  if (!searchTerm.trim()) {
    return [];
  }
  const lowerSearchTerm = searchTerm.toLowerCase();
  const usersCollectionRef = collection(db, 'users');
  const profilesMap = new Map<string, UserProfile>();

  const nameQueries = [searchTerm, searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1)]; 

  // Search by first name (case-insensitive through multiple queries or backend function)
  // For simplicity, this example performs a basic prefix search on stored case.
  // For a true case-insensitive search, store a lowercase version of names.
  for (const term of nameQueries) {
      const firstNameQuery = query(
        usersCollectionRef,
        where('firstName', '>=', term),
        where('firstName', '<=', term + '\uf8ff'),
        limit(10)
      );
      const firstNameSnap = await getDocs(firstNameQuery);
      for (const docSnap of firstNameSnap.docs) {
        if (docSnap.id !== currentUserId && !profilesMap.has(docSnap.id)) {
          const profile = await getUserProfile(docSnap.id);
          if (profile) profilesMap.set(docSnap.id, profile);
        }
      }

      const lastNameQuery = query(
        usersCollectionRef,
        where('lastName', '>=', term),
        where('lastName', '<=', term + '\uf8ff'),
        limit(10)
      );
      const lastNameSnap = await getDocs(lastNameQuery);
      for (const docSnap of lastNameSnap.docs) {
        if (docSnap.id !== currentUserId && !profilesMap.has(docSnap.id)) {
          const profile = await getUserProfile(docSnap.id);
          if (profile) profilesMap.set(docSnap.id, profile);
        }
      }
  }
  
  // Search by email (exact match, assuming email stored as is)
  const emailQuery = query(usersCollectionRef, where('email', '==', searchTerm), limit(10)); // Emails are often case-sensitive or stored lowercase
  const emailSnap = await getDocs(emailQuery);
  for (const docSnap of emailSnap.docs) {
    if (docSnap.id !== currentUserId && !profilesMap.has(docSnap.id)) {
      const profile = await getUserProfile(docSnap.id);
      if (profile) profilesMap.set(docSnap.id, profile);
    }
  }
  
  return Array.from(profilesMap.values()).slice(0, 10);
}


export async function sendConnectionRequest(fromUserId: string, toUserId: string): Promise<string | 'already_connected' | 'already_sent' | 'already_received' | null> {
  const fromUserProfile = await getUserProfile(fromUserId);
  if (fromUserProfile?.connections?.includes(toUserId)) {
    return 'already_connected';
  }

  const existingInvitationQuery = query(
    collection(db, 'invitations'),
    where('fromUserId', 'in', [fromUserId, toUserId]),
    where('toUserId', 'in', [fromUserId, toUserId])
  );
  const existingInvitationSnap = await getDocs(existingInvitationQuery);

  for (const docSnap of existingInvitationSnap.docs) {
    const inv = docSnap.data();
    if (inv.status === 'accepted') return 'already_connected';
    if (inv.status === 'pending') {
      if (inv.fromUserId === fromUserId && inv.toUserId === toUserId) return 'already_sent';
      if (inv.fromUserId === toUserId && inv.toUserId === fromUserId) return 'already_received';
    }
  }

  const invitationRef = collection(db, 'invitations');
  const newInvitation = {
    fromUserId,
    toUserId,
    status: 'pending' as const,
    createdAt: serverTimestamp(),
  };
  const docRef = await addDoc(invitationRef, newInvitation);
  
  const toUserRef = doc(db, 'users', toUserId);
  await updateDoc(toUserRef, {
    pendingInvitationsCount: increment(1),
    pendingInvitations: arrayUnion(docRef.id) 
  });

  return docRef.id;
}

export async function getInvitationStatus(
  currentUserId: string,
  targetUserId: string
): Promise<{ status: 'not_connected' | 'pending_sent' | 'pending_received' | 'connected' | 'unknown', invitationId?: string }> {
  if (currentUserId === targetUserId) return { status: 'unknown' };

  const currentUserProfile = await getUserProfile(currentUserId);
  if (currentUserProfile?.connections?.includes(targetUserId)) {
    return { status: 'connected' };
  }

  const invitationsRef = collection(db, 'invitations');

  const sentQuery = query(
    invitationsRef,
    where('fromUserId', '==', currentUserId),
    where('toUserId', '==', targetUserId),
    where('status', '==', 'pending')
  );
  const sentSnap = await getDocs(sentQuery);
  if (!sentSnap.empty) {
    return { status: 'pending_sent', invitationId: sentSnap.docs[0].id };
  }

  const receivedQuery = query(
    invitationsRef,
    where('fromUserId', '==', targetUserId),
    where('toUserId', '==', currentUserId),
    where('status', '==', 'pending')
  );
  const receivedSnap = await getDocs(receivedQuery);
  if (!receivedSnap.empty) {
    return { status: 'pending_received', invitationId: receivedSnap.docs[0].id };
  }
  
  const acceptedQuery = query(
    invitationsRef,
    where('fromUserId', 'in', [currentUserId, targetUserId]),
    where('toUserId', 'in', [currentUserId, targetUserId]),
    where('status', '==', 'accepted')
  );
  const acceptedSnap = await getDocs(acceptedQuery);
  if(!acceptedSnap.empty){
      return {status: 'connected'};
  }

  return { status: 'not_connected' };
}

export async function acceptConnectionRequest(invitationId: string, currentUserId: string, requestingUserId: string): Promise<void> {
  const batch = writeBatch(db);
  const invitationRef = doc(db, 'invitations', invitationId);
  batch.update(invitationRef, { status: 'accepted', updatedAt: serverTimestamp() });

  const currentUserRef = doc(db, 'users', currentUserId);
  batch.update(currentUserRef, {
    connections: arrayUnion(requestingUserId),
    connectionsCount: increment(1),
    pendingInvitationsCount: increment(-1), 
    pendingInvitations: arrayRemove(invitationId) 
  });

  const requestingUserRef = doc(db, 'users', requestingUserId);
  batch.update(requestingUserRef, {
    connections: arrayUnion(currentUserId),
    connectionsCount: increment(1)
  });

  await batch.commit();
}

export async function cancelConnectionRequest(invitationId: string, toUserId?: string): Promise<void> {
  const invitationRef = doc(db, 'invitations', invitationId);
  const invitationSnap = await getDoc(invitationRef);

  if (invitationSnap.exists() && invitationSnap.data()?.status === 'pending' && toUserId) {
    const toUserRef = doc(db, 'users', toUserId);
    await updateDoc(toUserRef, {
      pendingInvitationsCount: increment(-1),
      pendingInvitations: arrayRemove(invitationId)
    });
  }
  await deleteDoc(invitationRef);
}

export async function ignoreConnectionRequest(invitationId: string, currentUserId: string): Promise<void> {
  const invitationRef = doc(db, 'invitations', invitationId);
  await updateDoc(invitationRef, { status: 'ignored', updatedAt: serverTimestamp() });

  const currentUserRef = doc(db, 'users', currentUserId);
  await updateDoc(currentUserRef, {
    pendingInvitationsCount: increment(-1),
    pendingInvitations: arrayRemove(invitationId)
  });
}

export async function getPendingInvitations(userId: string): Promise<(UserProfile & {invitationId: string})[]> {
    const invitationsRef = collection(db, 'invitations');
    const q = query(invitationsRef, where('toUserId', '==', userId), where('status', '==', 'pending'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const usersFromInvitations: (UserProfile & {invitationId: string})[] = [];
    for (const docSnap of querySnapshot.docs) {
        const invitation = docSnap.data();
        const userProfile = await getUserProfile(invitation.fromUserId);
        if (userProfile) {
            usersFromInvitations.push({...userProfile, invitationId: docSnap.id});
        }
    }
    return usersFromInvitations;
}

export async function getFriendsOfFriendsSuggestions(currentUserId: string, resultLimit: number = 5): Promise<UserProfile[]> {
  const currentUserProfile = await getUserProfile(currentUserId);
  if (!currentUserProfile || !currentUserProfile.connections || currentUserProfile.connections.length === 0) {
    return [];
  }

  const currentUserConnectionsSet = new Set(currentUserProfile.connections);
  currentUserConnectionsSet.add(currentUserId); 

  const friendsOfFriendsUids = new Set<string>();
  const connectionsToProcess = currentUserProfile.connections.slice(0, 10); 

  for (const friendId of connectionsToProcess) {
    const friendProfile = await getUserProfile(friendId);
    if (friendProfile && friendProfile.connections) {
      for (const friendOfFriendId of friendProfile.connections) {
        if (!currentUserConnectionsSet.has(friendOfFriendId)) {
          friendsOfFriendsUids.add(friendOfFriendId);
        }
      }
    }
  }
  
  const suggestedProfiles: UserProfile[] = [];
  for (const uid of Array.from(friendsOfFriendsUids)) {
    if (suggestedProfiles.length >= resultLimit) break;
    const profile = await getUserProfile(uid);
    if (profile) {
      const invitationStatus = await getInvitationStatus(currentUserId, profile.uid);
      if (invitationStatus.status === 'not_connected') {
        suggestedProfiles.push(profile);
      }
    }
  }
  return suggestedProfiles;
}

export async function getUserProfileByLocation(location: string, currentUserId: string, resultLimit: number): Promise<UserProfile[]> {
  if (!location.trim()) {
    return [];
  }
  const usersCollectionRef = collection(db, 'users');
  // Fetch a bit more to allow filtering out currentUserId if they happen to match the location
  const q = query(
    usersCollectionRef, 
    where('location', '==', location), 
    // where(documentId(), '!=', currentUserId) // Not always efficient, filter client-side
    limit(resultLimit + 5) // fetch a bit more to filter out current user and ensure limit
  );

  const querySnapshot = await getDocs(q);
  const profiles: UserProfile[] = [];

  for (const docSnap of querySnapshot.docs) {
    if (docSnap.id === currentUserId) {
      continue; // Skip current user
    }
    const profileData = await getUserProfile(docSnap.id); // Use existing function for consistency
    if (profileData) {
      profiles.push(profileData);
      if (profiles.length >= resultLimit) {
        break; // Stop once limit is reached
      }
    }
  }
  return profiles;
}


    