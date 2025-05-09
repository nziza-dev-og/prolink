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

export async function createUserProfile(userId: string, data: Omit<UserProfile, 'id' | 'uid' | 'createdAt' | 'connectionsCount' | 'profilePictureUrl' | 'coverPhotoUrl' | 'connections'>): Promise<void> {
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
    updateData.profilePictureUrl = `https://picsum.photos/seed/${userId}/200/200`;
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
  const lowerSearchTerm = searchTerm.toLowerCase();
  const usersCollectionRef = collection(db, 'users');
  const profilesMap = new Map<string, UserProfile>();

  // Firestore queries are case-sensitive for string comparisons.
  // For a truly case-insensitive search, you'd typically store a lowercased version of fields to search on,
  // or perform client-side filtering after fetching a broader set of results (less efficient for large datasets).
  // Here, we'll demonstrate direct querying which will be case-sensitive for prefix matches.

  // Query by email (exact match, assuming email is stored consistently or also lowercased)
  const emailQuery = query(usersCollectionRef, where('email', '==', lowerSearchTerm));
  const emailSnap = await getDocs(emailQuery);
  for (const docSnap of emailSnap.docs) {
    if (docSnap.id !== currentUserId) {
      const profile = await getUserProfile(docSnap.id);
      if (profile) profilesMap.set(docSnap.id, profile);
    }
  }

  // Query by first name (prefix match) - case-sensitive
  // To make it somewhat better, we query for the original term and its capitalized version for prefix
  const nameQueries = [searchTerm, searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1)];

  for (const term of nameQueries) {
      const firstNameQuery = query(
        usersCollectionRef,
        where('firstName', '>=', term),
        where('firstName', '<=', term + '\uf8ff')
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
        where('lastName', '<=', term + '\uf8ff')
      );
      const lastNameSnap = await getDocs(lastNameQuery);
      for (const docSnap of lastNameSnap.docs) {
        if (docSnap.id !== currentUserId && !profilesMap.has(docSnap.id)) {
          const profile = await getUserProfile(docSnap.id);
          if (profile) profilesMap.set(docSnap.id, profile);
        }
      }
  }
  
  return Array.from(profilesMap.values()).slice(0, 10);
}


export async function sendConnectionRequest(fromUserId: string, toUserId: string): Promise<string | 'already_connected' | 'already_sent' | 'already_received' | null> {
  const fromUserProfile = await getUserProfile(fromUserId);
  if (fromUserProfile?.connections?.includes(toUserId)) {
    console.log('Users are already connected (checked from user profile).');
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
        console.log('Invitation already received. Users should accept it.');
        return 'already_received';
      }
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
  
  // Update pendingInvitationsCount for the receiver
  const toUserRef = doc(db, 'users', toUserId);
  await updateDoc(toUserRef, {
    pendingInvitationsCount: increment(1)
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
  
  // Double check for 'accepted' status in invitations if profile check missed it
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
    pendingInvitationsCount: increment(-1) // Decrement pending count for receiver
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
     // If invitation was pending, decrement pendingInvitationsCount for the receiver
    const toUserRef = doc(db, 'users', toUserId);
    await updateDoc(toUserRef, {
      pendingInvitationsCount: increment(-1)
    });
  }
  await deleteDoc(invitationRef); // Or update status to 'cancelled'
}

export async function ignoreConnectionRequest(invitationId: string, currentUserId: string): Promise<void> {
  const invitationRef = doc(db, 'invitations', invitationId);
  await updateDoc(invitationRef, { status: 'ignored', updatedAt: serverTimestamp() });

  // Decrement pendingInvitationsCount for the current user (who is ignoring)
  const currentUserRef = doc(db, 'users', currentUserId);
  await updateDoc(currentUserRef, {
    pendingInvitationsCount: increment(-1)
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
