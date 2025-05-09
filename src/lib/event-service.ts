
'use server';

import { db } from './firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  getDocs,
  Timestamp,
  where,
  increment,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import type { Event, UserProfile } from '@/types';
import { getUserProfile } from './user-service';

// Create Event
export async function createEvent(
  eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'organizerInfo' | 'attendeesCount' | 'attendees'>
): Promise<string> {
  const eventsCollectionRef = collection(db, 'events');
  
  const organizerProfile = await getUserProfile(eventData.organizerId);
  if (!organizerProfile) {
    throw new Error('Organizer profile not found.');
  }

  const organizerInfo: Pick<UserProfile, "id" | "uid" | "firstName" | "lastName" | "profilePictureUrl" | "headline"> = {
    id: organizerProfile.uid,
    uid: organizerProfile.uid,
    firstName: organizerProfile.firstName,
    lastName: organizerProfile.lastName,
    profilePictureUrl: organizerProfile.profilePictureUrl,
    headline: organizerProfile.headline,
  };
  
  let dateTimeToStore: Timestamp;
  if (typeof eventData.dateTime === 'string') {
    dateTimeToStore = Timestamp.fromDate(new Date(eventData.dateTime));
  } else if (eventData.dateTime instanceof Date) { // Handle if Date object is passed
    dateTimeToStore = Timestamp.fromDate(eventData.dateTime);
  } else {
     dateTimeToStore = eventData.dateTime as Timestamp; // Assume it's already a Timestamp
  }


  const docRef = await addDoc(eventsCollectionRef, {
    ...eventData,
    dateTime: dateTimeToStore,
    organizerInfo,
    attendeesCount: 0,
    attendees: [], // Initialize attendees array
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

// Get Event by ID
export async function getEventById(eventId: string): Promise<Event | null> {
  const eventRef = doc(db, 'events', eventId);
  const docSnap = await getDoc(eventRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      dateTime: data.dateTime instanceof Timestamp ? data.dateTime.toDate().toISOString() : String(data.dateTime),
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : String(data.createdAt),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : String(data.updatedAt),
      attendees: data.attendees || [], // Ensure attendees array is present
    } as Event;
  } else {
    return null;
  }
}

// Get All Events (Published/Upcoming)
export async function getAllEvents(): Promise<Event[]> {
  const eventsCollectionRef = collection(db, 'events');
  // Optionally, filter for upcoming events: where('dateTime', '>=', Timestamp.now())
  const q = query(eventsCollectionRef, orderBy('dateTime', 'asc')); 
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docSnap => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      dateTime: data.dateTime instanceof Timestamp ? data.dateTime.toDate().toISOString() : String(data.dateTime),
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : String(data.createdAt),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : String(data.updatedAt),
      attendees: data.attendees || [],
    } as Event;
  });
}

// Update Event
export async function updateEvent(eventId: string, data: Partial<Omit<Event, 'id' | 'organizerId' | 'organizerInfo' | 'createdAt' | 'attendeesCount' | 'attendees'>>): Promise<void> {
  const eventRef = doc(db, 'events', eventId);
  const updateData: any = { ...data, updatedAt: serverTimestamp() };

  if (data.dateTime && typeof data.dateTime === 'string') {
    updateData.dateTime = Timestamp.fromDate(new Date(data.dateTime));
  } else if (data.dateTime && data.dateTime instanceof Date) {
    updateData.dateTime = Timestamp.fromDate(data.dateTime);
  }

  await updateDoc(eventRef, updateData);
}

// Delete Event
export async function deleteEvent(eventId: string): Promise<void> {
  const eventRef = doc(db, 'events', eventId);
  await deleteDoc(eventRef);
}

// Get Events by Organizer
export async function getEventsByOrganizer(organizerId: string): Promise<Event[]> {
  const eventsCollectionRef = collection(db, 'events');
  const q = query(eventsCollectionRef, where('organizerId', '==', organizerId), orderBy('dateTime', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(docSnap => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      dateTime: data.dateTime instanceof Timestamp ? data.dateTime.toDate().toISOString() : String(data.dateTime),
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : String(data.createdAt),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : String(data.updatedAt),
      attendees: data.attendees || [],
    } as Event;
  });
}

// RSVP to Event
export async function rsvpToEvent(eventId: string, userId: string): Promise<void> {
  const eventRef = doc(db, 'events', eventId);
  await updateDoc(eventRef, {
    attendees: arrayUnion(userId),
    attendeesCount: increment(1),
    updatedAt: serverTimestamp(),
  });
}

// Cancel RSVP from Event
export async function cancelRsvpFromEvent(eventId: string, userId: string): Promise<void> {
  const eventRef = doc(db, 'events', eventId);
  await updateDoc(eventRef, {
    attendees: arrayRemove(userId),
    attendeesCount: increment(-1),
    updatedAt: serverTimestamp(),
  });
}
