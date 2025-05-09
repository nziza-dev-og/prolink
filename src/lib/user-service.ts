

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

export async function createUserProfile(userId: string, data: Omit<UserProfile, 'id' | 'uid' | 'createdAt' | 'connectionsCount' | 'profilePictureUrl' | 'coverPhotoUrl' | 'connections' | 'pendingInvitationsCount' | 'pendingInvitations' | 'suggestedConnections' | 'isActive'>): Promise<void> {
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
    isActive: false, // Default isActive to false
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
      isActive: data.isActive === undefined ? false : data.isActive, // Default isActive if not present
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
    if (!profile) {
        // This case should ideally not happen if docSnapshot.id is valid
        // and getUserProfile handles errors gracefully or returns null.
        // Throw an error or return a placeholder if necessary.
        console.error(`Profile not found for ID: ${docSnapshot.id}`);
        // Depending on strictness, you might throw an error or filter out nulls later.
        // For now, let's assume getUserProfile returns UserProfile or null.
        return null; 
    }
    return profile;
  })).then(profiles => profiles.filter(p => p !== null) as UserProfile[]); // Filter out any nulls
}


export async function searchUserProfiles(searchTerm: string, currentUserId: string): Promise<UserProfile[]> {
  if (!searchTerm.trim()) {
    return [];
  }
  const lowerSearchTerm = searchTerm.toLowerCase();
  const usersCollectionRef = collection(db, 'users');
  const profilesMap = new Map<string, UserProfile>();

  // Search by first name (attempting a prefix search on original case and capitalized)
  const searchTerms = [searchTerm, searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1), lowerSearchTerm];

  for (const term of searchTerms) {
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
  
  // Search by email (exact match, assuming email stored as is or lowercase)
  const emailQuery = query(usersCollectionRef, where('email', '==', lowerSearchTerm), limit(10));
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

  const invitationsRef = collection(db, 'invitations');
  // Check for pending or accepted invitation in either direction
  const existingInvitationQuery = query(
    invitationsRef,
    where('participantIds', 'array-contains-any', [fromUserId, toUserId])
    // We will filter further client-side or by fetching both directions if participantIds isn't used
  );
  
  const existingInvitationSnap = await getDocs(existingInvitationQuery);

  for (const docSnap of existingInvitationSnap.docs) {
    const inv = docSnap.data() as Invitation; // Assuming Invitation type is defined
    if (
      ((inv.fromUserId === fromUserId && inv.toUserId === toUserId) || (inv.fromUserId === toUserId && inv.toUserId === fromUserId))
    ) {
      if (inv.status === 'accepted') return 'already_connected';
      if (inv.status === 'pending') {
        if (inv.fromUserId === fromUserId) return 'already_sent';
        if (inv.fromUserId === toUserId) return 'already_received';
      }
    }
  }


  const newInvitation = {
    fromUserId,
    toUserId,
    participantIds: [fromUserId, toUserId].sort(), // For easier querying if needed
    status: 'pending' as const,
    createdAt: serverTimestamp(),
  };
  const docRef = await addDoc(invitationsRef, newInvitation);
  
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

  // Check for invitation sent by current user to target user
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

  // Check for invitation received by current user from target user
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
  
  // Check if already connected via an accepted invitation (double check against profile's connections array)
  const acceptedQuery = query(
    invitationsRef,
    where('participantIds', 'array-contains', currentUserId),
    // Firestore does not support 'array-contains-all' with 'or' effectively for this structure.
    // So we query for one participant and filter for the other.
  );
  const acceptedSnap = await getDocs(acceptedQuery);
  for (const docSnap of acceptedSnap.docs) {
    const inv = docSnap.data() as Invitation;
    if (inv.participantIds.includes(targetUserId) && inv.status === 'accepted') {
      // Ensure both users are in connections arrays for consistency
      const targetUserProfile = await getUserProfile(targetUserId);
      if (currentUserProfile?.connections?.includes(targetUserId) && targetUserProfile?.connections?.includes(currentUserId)) {
          return { status: 'connected' };
      }
    }
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

export async function cancelConnectionRequest(invitationId: string, fromUserId: string, toUserId: string): Promise<void> {
  const invitationRef = doc(db, 'invitations', invitationId);
  const invitationSnap = await getDoc(invitationRef);

  if (invitationSnap.exists() && invitationSnap.data()?.status === 'pending') {
    const targetUserRef = doc(db, 'users', toUserId); // User who received the request
    await updateDoc(targetUserRef, {
      pendingInvitationsCount: increment(-1),
      pendingInvitations: arrayRemove(invitationId)
    }).catch(err => console.error("Error updating target user on cancel:", err)); // Log error but proceed to delete
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
  
  // Limit processing to a subset of connections to avoid excessive reads, e.g., first 10-20 connections.
  const connectionsToProcess = currentUserProfile.connections.slice(0, 10); 

  for (const friendId of connectionsToProcess) {
    const friendProfile = await getUserProfile(friendId);
    if (friendProfile && friendProfile.connections) {
      for (const friendOfFriendId of friendProfile.connections) {
        if (!currentUserConnectionsSet.has(friendOfFriendId)) { // Not self or already a direct connection
          friendsOfFriendsUids.add(friendOfFriendId);
        }
      }
    }
  }
  
  const suggestedProfiles: UserProfile[] = [];
  // Convert Set to Array to easily slice or limit.
  const fofArray = Array.from(friendsOfFriendsUids);

  for (let i = 0; i < fofArray.length && suggestedProfiles.length < resultLimit; i++) {
    const uid = fofArray[i];
    const profile = await getUserProfile(uid);
    if (profile) {
      // Ensure this person hasn't already sent/received a pending invite to/from current user
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
  
  const q = query(
    usersCollectionRef, 
    where('location', '==', location), 
    orderBy(documentId()), // Add a default orderBy if not specific to avoid warnings with limit
    limit(resultLimit + 5) // Fetch a bit more to filter out current user and already connected users
  );

  const querySnapshot = await getDocs(q);
  const profiles: UserProfile[] = [];
  const currentUserProfile = await getUserProfile(currentUserId);
  const currentUserConnections = new Set(currentUserProfile?.connections || []);

  for (const docSnap of querySnapshot.docs) {
    if (docSnap.id === currentUserId || currentUserConnections.has(docSnap.id)) {
      continue; 
    }
    const profileData = await getUserProfile(docSnap.id); 
    if (profileData) {
       // Further check: ensure this person hasn't already sent/received a pending invite to/from current user
      const invitationStatus = await getInvitationStatus(currentUserId, profileData.uid);
      if (invitationStatus.status === 'not_connected') {
        profiles.push(profileData);
        if (profiles.length >= resultLimit) {
            break; 
        }
      }
    }
  }
  return profiles;
}


    
