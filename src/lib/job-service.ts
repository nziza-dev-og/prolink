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
} from 'firebase/firestore';
import type { Job } from '@/types';

export async function createJob(
  jobData: Omit<Job, 'id' | 'postedDate'>
): Promise<string> {
  const jobsCollectionRef = collection(db, 'jobs');
  const docRef = await addDoc(jobsCollectionRef, {
    ...jobData,
    postedDate: serverTimestamp(),
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
    } as Job;
  } else {
    return null;
  }
}
