
'use server';

import { db } from './firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
  Timestamp,
  limit,
  // doc, // Might need for user-specific notifications later
  // where, // Might need for user-specific notifications later
} from 'firebase/firestore';
import type { Notification, UserProfile as UserProfileType } from '@/types'; // Renamed to avoid conflict
import { mockUserProfiles } from './mock-data'; 

// Function to create an admin broadcast notification
export async function createAdminBroadcast(content: string): Promise<string> {
  const adminNotificationsCollectionRef = collection(db, 'admin_notifications');
  const docRef = await addDoc(adminNotificationsCollectionRef, {
    content,
    createdAt: serverTimestamp(),
    type: 'admin_broadcast', // Explicitly set type
  });
  return docRef.id;
}

// Function to get all notifications for a user (combines admin and placeholder personal)
export async function getAllUserNotifications(userId: string): Promise<Notification[]> {
  const allNotifications: Notification[] = [];

  // 1. Fetch Admin Broadcast Notifications
  try {
    const adminNotificationsCollectionRef = collection(db, 'admin_notifications');
    // Fetch recent admin notifications, e.g., last 30 days or last 20 notifications
    const adminQuery = query(adminNotificationsCollectionRef, orderBy('createdAt', 'desc'), limit(20));
    const adminSnapshot = await getDocs(adminQuery);
    adminSnapshot.forEach(docSnap => {
      const data = docSnap.data();
      allNotifications.push({
        id: docSnap.id,
        type: 'admin_broadcast',
        content: data.content,
        timestamp: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt as string),
        isRead: false, // Admin broadcasts are typically always shown as "new"
      } as Notification);
    });
  } catch (error) {
    console.error("Error fetching admin notifications:", error);
    // Optionally throw or handle error (e.g., return empty admin notifications)
  }
  

  // 2. Fetch User-Specific Notifications (currently mocked)
  // In a real app, this would query a 'user_notifications/<userId>/notifications' subcollection 
  // or a main 'notifications' collection filtered by `recipientId == userId`.
  const mockPersonalNotifications = generateMockUserSpecificNotifications(userId)
    .filter(n => n.type !== 'admin_broadcast'); // Ensure mock doesn't include admin type

  allNotifications.push(...mockPersonalNotifications);


  // 3. Sort all notifications by timestamp, newest first
  allNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return allNotifications;
}


// This is a mock function for generating user-specific notifications.
// In a real application, these would come from Firestore interactions.
const generateMockUserSpecificNotifications = (currentUserId?: string): Notification[] => {
  // Find a few other users to be the source of notifications
  const otherUsers = mockUserProfiles.filter(u => u.uid !== currentUserId).slice(0, 3);
  if (otherUsers.length === 0 && mockUserProfiles.length > 0) {
    otherUsers.push(mockUserProfiles[0]); // Ensure there's at least one user if currentUserId is not in mockUserProfiles
  }
  
  const notificationsBase: Omit<Notification, 'id' | 'timestamp' | 'isRead' | 'link'>[] = [];

  if (otherUsers.length > 0) {
    notificationsBase.push(
      {
        type: "profile_view",
        user: { id: otherUsers[0].uid, name: `${otherUsers[0].firstName} ${otherUsers[0].lastName}`, avatarUrl: otherUsers[0].profilePictureUrl },
        content: `${otherUsers[0].firstName} ${otherUsers[0].lastName} viewed your profile.`,
      },
      {
        type: "post_like",
        user: { id: otherUsers[Math.min(1, otherUsers.length - 1)].uid, name: `${otherUsers[Math.min(1, otherUsers.length - 1)].firstName} ${otherUsers[Math.min(1, otherUsers.length - 1)].lastName}`, avatarUrl: otherUsers[Math.min(1, otherUsers.length - 1)].profilePictureUrl },
        content: `${otherUsers[Math.min(1, otherUsers.length - 1)].firstName} liked your post: "Excited to share..."`,
      },
      {
        type: "connection_request",
        user: { id: otherUsers[Math.min(2, otherUsers.length - 1)].uid, name: `${otherUsers[Math.min(2, otherUsers.length - 1)].firstName} ${otherUsers[Math.min(2, otherUsers.length - 1)].lastName}`, avatarUrl: otherUsers[Math.min(2, otherUsers.length - 1)].profilePictureUrl },
        content: `You have a new connection request from ${otherUsers[Math.min(2, otherUsers.length - 1)].firstName}.`,
      }
    );
     if (otherUsers.length > 1) {
        notificationsBase.push({
            type: "message",
            user: { id: otherUsers[1].uid, name: `${otherUsers[1].firstName} ${otherUsers[1].lastName}`, avatarUrl: otherUsers[1].profilePictureUrl },
            content: `${otherUsers[1].firstName} sent you a new message.`,
        });
    }
  }
   notificationsBase.push({
      type: "job_alert", // Generic, no specific user
      content: "New job alert: Senior Developer at ProLink Solutions.",
    });


  const processedNotifications: Notification[] = notificationsBase.map((n, index) => ({
    ...n,
    id: `mock-personal-${index}-${Date.now()}`,
    timestamp: new Date(Date.now() - (index + 1) * 2 * 60 * 60 * 1000 * Math.random()), // Random times in the past few hours/days
    isRead: Math.random() > 0.7, // Most are unread for testing
    link: n.type === 'profile_view' && n.user ? `/profile/${n.user.id}` :
          n.type === 'post_like' ? `/posts/mock-post-id-${index}` : // Example link
          n.type === 'job_alert' ? `/jobs` : // General link to jobs
          n.type === 'connection_request' && n.user ? `/network` : // Link to network page
          n.type === 'message' && n.user ? `/messaging?chatWith=${n.user.id}` : '#',
  }));
  
  // Filter out notifications where the acting user is the current user (e.g., can't get a profile view notification from self)
  // This is more relevant if the mock data included the currentUserId as an actor.
  if (currentUserId) {
    return processedNotifications.filter(n => !n.user || n.user.id !== currentUserId);
  }
  return processedNotifications;
};
