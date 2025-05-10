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
  where,
} from 'firebase/firestore';
import type { Notification, UserProfile as UserProfileType } from '@/types';
import { getUserProfile } from './user-service';


export async function createAdminBroadcast(content: string): Promise<string> {
  const adminNotificationsCollectionRef = collection(db, 'admin_notifications');
  const docRef = await addDoc(adminNotificationsCollectionRef, {
    content,
    createdAt: serverTimestamp(),
    type: 'admin_broadcast', 
  });
  return docRef.id;
}


export async function getAllUserNotifications(userId: string): Promise<Notification[]> {
  const allNotifications: Notification[] = [];

  // 1. Fetch Admin Broadcast Notifications
  try {
    const adminNotificationsCollectionRef = collection(db, 'admin_notifications');
    const adminQuery = query(adminNotificationsCollectionRef, orderBy('createdAt', 'desc'), limit(20));
    const adminSnapshot = await getDocs(adminQuery);
    adminSnapshot.forEach(docSnap => {
      const data = docSnap.data();
      allNotifications.push({
        id: docSnap.id,
        type: 'admin_broadcast',
        content: data.content,
        timestamp: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt as string),
        isRead: false, 
        link: data.link || undefined, // Admin broadcasts might have links
      } as Notification);
    });
  } catch (error) {
    console.error("Error fetching admin notifications:", error);
  }
  
  // 2. Fetch User-Specific Notifications from 'notifications' collection
  try {
    const userNotificationsCollectionRef = collection(db, 'notifications');
    const userNotificationsQuery = query(
      userNotificationsCollectionRef, 
      where('recipientId', '==', userId), 
      orderBy('timestamp', 'desc'), 
      limit(50) // Limit to a reasonable number of recent notifications
    );
    const userNotificationsSnapshot = await getDocs(userNotificationsQuery);

    for (const docSnap of userNotificationsSnapshot.docs) {
      const data = docSnap.data();
      let actorInfo: Notification['user'] = undefined;

      if (data.actorId) {
        const actorProfile = await getUserProfile(data.actorId);
        if (actorProfile) {
          actorInfo = {
            id: actorProfile.uid,
            name: `${actorProfile.firstName} ${actorProfile.lastName}`,
            avatarUrl: actorProfile.profilePictureUrl,
          };
        } else {
          // Fallback if actor profile is not found (e.g., deleted user)
           actorInfo = { id: data.actorId, name: "A user" };
        }
      }
      
      // Construct link based on type and entityId - this part might need more robust logic
      let notificationLink = data.link;
      if (!notificationLink) {
        switch(data.type) {
            case 'post_like':
            case 'post_comment':
                notificationLink = data.entityId ? `/posts/${data.entityId}` : '#';
                break;
            case 'connection_request':
            case 'connection_accepted':
                notificationLink = data.actorId ? `/profile/${data.actorId}` : '/network';
                break;
            case 'profile_view':
                 notificationLink = data.actorId ? `/profile/${data.actorId}` : '#';
                 break;
            case 'message':
                 notificationLink = data.entityId ? `/messaging?chatWith=${data.actorId}&thread=${data.entityId}` : (data.actorId ? `/messaging?chatWith=${data.actorId}` : '/messaging');
                 break;
            case 'job_alert':
                 notificationLink = data.entityId ? `/jobs/${data.entityId}` : '/jobs';
                 break;
            default:
                notificationLink = '#';
        }
      }


      allNotifications.push({
        id: docSnap.id,
        type: data.type as Notification['type'],
        recipientId: data.recipientId,
        actorId: data.actorId,
        user: actorInfo,
        entityId: data.entityId,
        entityType: data.entityType,
        content: data.content,
        timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(data.timestamp as string),
        isRead: data.isRead || false,
        link: notificationLink,
      });
    }
  } catch (error) {
    console.error("Error fetching user-specific notifications:", error);
  }

  // 3. Sort all notifications by timestamp, newest first
  allNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return allNotifications;
}

// Example function to create a user-specific notification (would be called by other services)
// This is for demonstration of how notifications might be created.
export async function createUserSpecificNotification(
  notificationData: Omit<Notification, 'id' | 'timestamp' | 'isRead' | 'user'| 'link'> & { timestamp?: any }
): Promise<string> {
  const notificationsCollectionRef = collection(db, 'notifications');
  
  const dataToSave: any = {
    ...notificationData,
    timestamp: notificationData.timestamp || serverTimestamp(), // Use provided or server timestamp
    isRead: false,
  };

  // Automatically generate content and link if not provided, based on type
  if (!dataToSave.content) {
     // Basic content generation - real app would need more sophisticated logic / localization
    let content = "You have a new notification.";
    let actorName = "Someone";
    if (dataToSave.actorId) {
        const actor = await getUserProfile(dataToSave.actorId);
        if (actor) actorName = `${actor.firstName} ${actor.lastName}`;
    }
    switch(dataToSave.type) {
        case 'post_like': content = `${actorName} liked your post.`; break;
        case 'post_comment': content = `${actorName} commented on your post.`; break;
        case 'connection_request': content = `${actorName} sent you a connection request.`; break;
        case 'connection_accepted': content = `${actorName} accepted your connection request.`; break;
        case 'message': content = `${actorName} sent you a new message.`; break;
        // ... other types
    }
    dataToSave.content = content;
  }

  if(!dataToSave.link) {
     // Basic link generation
      let link = '#';
      switch(dataToSave.type) {
            case 'post_like': case 'post_comment': link = dataToSave.entityId ? `/posts/${dataToSave.entityId}` : '#'; break;
            case 'connection_request': case 'connection_accepted': link = dataToSave.actorId ? `/profile/${dataToSave.actorId}` : '/network'; break;
            case 'message': link = dataToSave.actorId ? `/messaging?chatWith=${dataToSave.actorId}` : '/messaging'; break;
            // ... other types
      }
      dataToSave.link = link;
  }


  const docRef = await addDoc(notificationsCollectionRef, dataToSave);
  return docRef.id;
}