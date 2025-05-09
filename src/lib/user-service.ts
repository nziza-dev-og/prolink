
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
} from 'firebase/firestore';

export async function createUserProfile(userId: string, data: Omit<UserProfile, 'id' | 'uid' | 'createdAt' | 'connectionsCount' | 'profilePictureUrl' | 'coverPhotoUrl' | 'connections' | 'pendingInvitationsCount' | 'pendingInvitations'>): Promise<void> {
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

export async function updateUserProfile(userId: string, data: Partial<Omit<UserProfile, 'id' | 'uid' | 'email' | 'createdAt'>>): Promise<void> {
  const userRef = doc(db, 'users', userId);
  // Create a mutable copy for updates
  const updateData: { [key: string]: any } = { ...data };
  
  updateData.updatedAt = serverTimestamp();

  // Specific handling for profilePictureUrl
  // This key will be present if the form field for profilePictureUrl was part of the submitted values.
  if (data.hasOwnProperty('profilePictureUrl')) {
    if (data.profilePictureUrl === '' || data.profilePictureUrl === null || data.profilePictureUrl === undefined) {
      // If user explicitly clears the URL or it's passed as null/undefined, set to a default.
      updateData.profilePictureUrl = `https://picsum.photos/seed/${userId}/200/200`; // Consistent default
    }
    // If a valid URL string is provided in data.profilePictureUrl, 
    // it's already correctly set in updateData due to the initial spread `...data`.
    // Zod validation on the client should ensure it's a valid URL if not empty/undefined.
  }
  
  // If connections array is part of the update, update connectionsCount
  if (data.connections && Array.isArray(data.connections)) {
    updateData.connectionsCount = data.connections.length;
  }
   // If pendingInvitations array is part of the update, update pendingInvitationsCount
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
    // Using getUserProfile to ensure consistent data transformation, including date conversions.
    return (await getUserProfile(docSnapshot.id)) as UserProfile; // Type assertion might be needed if getUserProfile can return null
  }));
}

// Searches user profiles by first name, last name, or email.
// Excludes the current user from results.
export async function searchUserProfiles(searchTerm: string, currentUserId: string): Promise<UserProfile[]> {
  if (!searchTerm.trim()) {
    return [];
  }
  const lowerSearchTerm = searchTerm.toLowerCase();
  const usersCollectionRef = collection(db, 'users');
  const profilesMap = new Map<string, UserProfile>(); // Use a map to avoid duplicates

  // Query by email (exact match, case-sensitive in Firestore by default, but email stored as lowercase)
  const emailQuery = query(usersCollectionRef, where('email', '==', lowerSearchTerm));
  const emailSnap = await getDocs(emailQuery);
  for (const docSnap of emailSnap.docs) {
    if (docSnap.id !== currentUserId) { // Exclude current user
      const profile = await getUserProfile(docSnap.id); // Use existing function for consistency
      if (profile) profilesMap.set(docSnap.id, profile);
    }
  }

  // Query by first name (prefix match, case-insensitive by capitalizing first letter)
  // Firestore string queries are case-sensitive. For case-insensitive, you'd usually store a lowercase version.
  // Here, we simulate a basic prefix search for names starting with the searchTerm.
  // For more robust search, consider a dedicated search service like Algolia or Elasticsearch.
  const nameQueries = [searchTerm, searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1)]; // Try both exact and capitalized

  for (const term of nameQueries) {
      const firstNameQuery = query(
        usersCollectionRef,
        where('firstName', '>=', term),
        where('firstName', '<=', term + '\uf8ff') // '\uf8ff' is a high-coded Unicode character for prefix matching
      );
      const firstNameSnap = await getDocs(firstNameQuery);
      for (const docSnap of firstNameSnap.docs) {
        if (docSnap.id !== currentUserId && !profilesMap.has(docSnap.id)) { // Exclude current user and duplicates
          const profile = await getUserProfile(docSnap.id);
          if (profile) profilesMap.set(docSnap.id, profile);
        }
      }

      // Query by last name (prefix match)
      const lastNameQuery = query(
        usersCollectionRef,
        where('lastName', '>=', term),
        where('lastName', '<=', term + '\uf8ff')
      );
      const lastNameSnap = await getDocs(lastNameQuery);
      for (const docSnap of lastNameSnap.docs) {
        if (docSnap.id !== currentUserId && !profilesMap.has(docSnap.id)) { // Exclude current user and duplicates
          const profile = await getUserProfile(docSnap.id);
          if (profile) profilesMap.set(docSnap.id, profile);
        }
      }
  }
  
  // Return up to a certain limit, e.g., 10 results
  return Array.from(profilesMap.values()).slice(0, 10);
}


// Sends a connection request from fromUserId to toUserId.
// Returns the ID of the created invitation or a status string if already connected/pending.
export async function sendConnectionRequest(fromUserId: string, toUserId: string): Promise<string | 'already_connected' | 'already_sent' | 'already_received' | null> {
  // Check if users are already connected directly in their profiles
  const fromUserProfile = await getUserProfile(fromUserId);
  if (fromUserProfile?.connections?.includes(toUserId)) {
    console.log('Users are already connected (checked from user profile).');
    return 'already_connected';
  }

  // Check existing invitations between these two users
  const existingInvitationQuery = query(
    collection(db, 'invitations'),
    where('fromUserId', 'in', [fromUserId, toUserId]),
    where('toUserId', 'in', [fromUserId, toUserId])
    // where('status', 'in', ['pending', 'accepted']) // Check for pending or already accepted
  );
  const existingInvitationSnap = await getDocs(existingInvitationQuery);

  for (const docSnap of existingInvitationSnap.docs) {
    const inv = docSnap.data();
    if (inv.status === 'accepted') {
      console.log('Users are already connected (invitation accepted).');
      return 'already_connected';
    }
    if (inv.status === 'pending') {
      if (inv.fromUserId === fromUserId && inv.toUserId === toUserId) {
        console.log('Invitation already sent.');
        return 'already_sent';
      }
      if (inv.fromUserId === toUserId && inv.toUserId === fromUserId) {
        // An invitation from the target user to the current user already exists.
        console.log('Invitation already received. Users should accept it.');
        return 'already_received';
      }
    }
  }

  // If no existing connection or pending invitation, create a new one
  const invitationRef = collection(db, 'invitations');
  const newInvitation = {
    fromUserId,
    toUserId,
    status: 'pending' as const, // Ensure status is of literal type 'pending'
    createdAt: serverTimestamp(),
  };
  const docRef = await addDoc(invitationRef, newInvitation);
  
  // Update target user's pending invitations count and list
  const toUserRef = doc(db, 'users', toUserId);
  await updateDoc(toUserRef, {
    pendingInvitationsCount: increment(1),
    pendingInvitations: arrayUnion(docRef.id) // Store invitation ID
  });

  return docRef.id; // Return the new invitation ID
}

export async function getInvitationStatus(
  currentUserId: string,
  targetUserId: string
): Promise<{ status: 'not_connected' | 'pending_sent' | 'pending_received' | 'connected' | 'unknown', invitationId?: string }> {
  if (currentUserId === targetUserId) return { status: 'unknown' }; // Cannot connect to self

  // Check if already connected
  const currentUserProfile = await getUserProfile(currentUserId);
  if (currentUserProfile?.connections?.includes(targetUserId)) {
    return { status: 'connected' };
  }

  const invitationsRef = collection(db, 'invitations');

  // Check if current user has sent a pending request to target user
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

  // Check if current user has received a pending request from target user
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
  
  // Double check if an accepted invitation exists (edge case if direct connection check failed)
  const acceptedQuery = query(
    invitationsRef,
    where('fromUserId', 'in', [currentUserId, targetUserId]),
    where('toUserId', 'in', [currentUserId, targetUserId]),
    where('status', '==', 'accepted')
  );
  const acceptedSnap = await getDocs(acceptedQuery);
  if(!acceptedSnap.empty){
      // This implies they are connected through a past invitation. Sync profiles if needed.
      return {status: 'connected'};
  }

  return { status: 'not_connected' };
}

// Accepts a connection request.
export async function acceptConnectionRequest(invitationId: string, currentUserId: string, requestingUserId: string): Promise<void> {
  const batch = writeBatch(db);

  // Update invitation status
  const invitationRef = doc(db, 'invitations', invitationId);
  batch.update(invitationRef, { status: 'accepted', updatedAt: serverTimestamp() });

  // Add connection to current user
  const currentUserRef = doc(db, 'users', currentUserId);
  batch.update(currentUserRef, {
    connections: arrayUnion(requestingUserId),
    connectionsCount: increment(1),
    pendingInvitationsCount: increment(-1), // Decrement pending count
    pendingInvitations: arrayRemove(invitationId) // Remove from pending list
  });

  // Add connection to requesting user
  const requestingUserRef = doc(db, 'users', requestingUserId);
  batch.update(requestingUserRef, {
    connections: arrayUnion(currentUserId),
    connectionsCount: increment(1)
    // No change to pendingInvitationsCount for the sender of the original request
  });

  await batch.commit();
}

// Cancels a sent connection request.
export async function cancelConnectionRequest(invitationId: string, toUserId?: string): Promise<void> {
  const invitationRef = doc(db, 'invitations', invitationId);
  const invitationSnap = await getDoc(invitationRef);

  // If the request was pending and we have the recipient's ID, update their pending count
  if (invitationSnap.exists() && invitationSnap.data()?.status === 'pending' && toUserId) {
    const toUserRef = doc(db, 'users', toUserId);
    await updateDoc(toUserRef, {
      pendingInvitationsCount: increment(-1),
      pendingInvitations: arrayRemove(invitationId)
    });
  }
  // Delete the invitation document regardless
  await deleteDoc(invitationRef);
}


// Ignores a received connection request.
export async function ignoreConnectionRequest(invitationId: string, currentUserId: string): Promise<void> {
  // Update invitation status to 'ignored'
  const invitationRef = doc(db, 'invitations', invitationId);
  await updateDoc(invitationRef, { status: 'ignored', updatedAt: serverTimestamp() });

  // Update current user's pending invitations count
  const currentUserRef = doc(db, 'users', currentUserId);
  await updateDoc(currentUserRef, {
    pendingInvitationsCount: increment(-1),
    pendingInvitations: arrayRemove(invitationId)
  });
}


// Fetches profiles of users who have sent pending invitations to the given userId.
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


