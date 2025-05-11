
'use server';

import { db } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
  updateDoc, // Added
  arrayUnion, // Added
  arrayRemove, // Added
  increment, // Added
  where, // Added for getJobsByIds
  documentId, // Added for getJobsByIds
} from 'firebase/firestore';
import type { Job } from '@/types';

export async function createJob(
  jobData: Omit<Job, 'id' | 'postedDate' | 'savedBy' | 'applicationsCount'>
): Promise<string> {
  const jobsCollectionRef = collection(db, 'jobs');
  const docRef = await addDoc(jobsCollectionRef, {
    ...jobData,
    postedDate: serverTimestamp(),
    savedBy: [], // Initialize savedBy array
    applicationsCount: 0, // Initialize applicationsCount
  });
  return docRef.id;
}

export async function getAllJobs(): Promise<Job[]> {
  const jobsCollectionRef = collection(db, 'jobs');
  const q = query(jobsCollectionRef, orderBy('postedDate', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    // Ensure 'id' is the Firestore document ID and 'postedDate' is a string.
    return {
      ...data, // Spread original data first
      id: doc.id, // Override with Firestore document ID to ensure uniqueness
      postedDate: data.postedDate instanceof Timestamp ? data.postedDate.toDate().toISOString() : String(data.postedDate),
      savedBy: data.savedBy || [],
      applicationsCount: data.applicationsCount || 0,
    } as Job;
  });
}

export async function getJobById(jobId: string): Promise<Job | null> {
  const jobRef = doc(db, 'jobs', jobId);
  const docSnap = await getDoc(jobRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    // Ensure 'id' is the Firestore document ID and 'postedDate' is a string.
    return {
      ...data, // Spread original data first
      id: docSnap.id, // Override with Firestore document ID to ensure uniqueness
      postedDate: data.postedDate instanceof Timestamp ? data.postedDate.toDate().toISOString() : String(data.postedDate),
      savedBy: data.savedBy || [],
      applicationsCount: data.applicationsCount || 0,
    } as Job;
  } else {
    return null;
  }
}

export async function getJobsByIds(jobIds: string[]): Promise<Job[]> {
  if (!jobIds || jobIds.length === 0) {
    return [];
  }
  const jobsCollectionRef = collection(db, 'jobs');
  // Firestore 'in' query is limited to 30 items per query.
  // For larger arrays, chunking would be necessary. For now, assume < 30.
  const chunks = [];
  for (let i = 0; i < jobIds.length; i += 30) {
    chunks.push(jobIds.slice(i, i + 30));
  }

  const jobPromises = chunks.map(async (chunk) => {
    const q = query(jobsCollectionRef, where(documentId(), 'in', chunk));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        postedDate: data.postedDate instanceof Timestamp ? data.postedDate.toDate().toISOString() : String(data.postedDate),
        savedBy: data.savedBy || [],
        applicationsCount: data.applicationsCount || 0,
      } as Job;
    });
  });
  
  const results = await Promise.all(jobPromises);
  return results.flat(); // Flatten the array of arrays
}


// Functions to manage savedBy on the job document itself (optional, but good for querying jobs saved by a user)
export async function addUserIdToJobSavedBy(jobId: string, userId: string): Promise<void> {
  const jobRef = doc(db, 'jobs', jobId);
  await updateDoc(jobRef, {
    savedBy: arrayUnion(userId),
  });
}

export async function removeUserIdFromJobSavedBy(jobId: string, userId: string): Promise<void> {
  const jobRef = doc(db, 'jobs', jobId);
  await updateDoc(jobRef, {
    savedBy: arrayRemove(userId),
  });
}

