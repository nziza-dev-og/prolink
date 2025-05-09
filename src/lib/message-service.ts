
'use server';

import { db } from './firebase';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  Timestamp,
  or,
} from 'firebase/firestore';
import type { Message, UserProfile } from '@/types';
import { getUserProfile } from './user-service';

export async function createMessage(
  senderId: string,
  receiverId: string,
  content: string
): Promise<string> {
  const messagesCollectionRef = collection(db, 'messages');
  const docRef = await addDoc(messagesCollectionRef, {
    senderId,
    receiverId,
    content,
    timestamp: serverTimestamp(),
    isRead: false, // Initially, message is unread by receiver
  });
  return docRef.id;
}

export async function getMessagesBetweenUsers(
  userId1: string,
  userId2: string
): Promise<Message[]> {
  const messagesCollectionRef = collection(db, 'messages');
  // Query for messages where (sender is userId1 AND receiver is userId2) OR (sender is userId2 AND receiver is userId1)
  const q = query(
    messagesCollectionRef,
    or(
        where('senderId', '==', userId1),
        where('senderId', '==', userId2)
    ),
    orderBy('timestamp', 'asc')
  );

  const querySnapshot = await getDocs(q);
  const messages: Message[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    // Additional client-side filter because Firestore 'or' queries are limited
    if ((data.senderId === userId1 && data.receiverId === userId2) || (data.senderId === userId2 && data.receiverId === userId1)) {
        messages.push({
        id: doc.id,
        senderId: data.senderId,
        receiverId: data.receiverId,
        content: data.content,
        timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate().toISOString() : String(data.timestamp),
        isRead: data.isRead,
        } as Message);
    }
  });
  return messages;
}

// Helper function to get a list of user profiles this user has had conversations with.
// This is a simplified version; a more robust solution might involve a dedicated 'conversations' collection.
export async function getConversations(userId: string): Promise<UserProfile[]> {
  const messagesCollectionRef = collection(db, 'messages');
  const sentMessagesQuery = query(messagesCollectionRef, where('senderId', '==', userId));
  const receivedMessagesQuery = query(messagesCollectionRef, where('receiverId', '==', userId));

  const [sentSnapshot, receivedSnapshot] = await Promise.all([
    getDocs(sentMessagesQuery),
    getDocs(receivedMessagesQuery),
  ]);

  const partnerIds = new Set<string>();
  sentSnapshot.forEach(doc => partnerIds.add(doc.data().receiverId));
  receivedSnapshot.forEach(doc => partnerIds.add(doc.data().senderId));

  const conversationPartners: UserProfile[] = [];
  for (const partnerId of partnerIds) {
    if (partnerId !== userId) {
      const profile = await getUserProfile(partnerId);
      if (profile) {
        conversationPartners.push(profile);
      }
    }
  }
  return conversationPartners;
}
