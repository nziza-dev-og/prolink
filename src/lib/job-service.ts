
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
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  increment, 
  where, 
  documentId, 
} from 'firebase/firestore';
import type { Job } from '@/types';

export async function createJob(
  jobData: Omit<Job, 'id' | 'postedDate' | 'savedBy' | 'applicationsCount'>
): Promise<string> {
  const jobsCollectionRef = collection(db, 'jobs');
  const docRef = await addDoc(jobsCollectionRef, {
    ...jobData,
    postedDate: serverTimestamp(),
    savedBy: [], 
    applicationsCount: 0, 
    assessmentId: jobData.assessmentId || undefined,
    addAssessmentLater: jobData.addAssessmentLater || false,
  });
  return docRef.id;
}

export async function getAllJobs(): Promise<Job[]> {
  const jobsCollectionRef = collection(db, 'jobs');
  const q = query(jobsCollectionRef, orderBy('postedDate', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data, 
      id: doc.id, 
      postedDate: data.postedDate instanceof Timestamp ? data.postedDate.toDate().toISOString() : String(data.postedDate),
      savedBy: data.savedBy || [],
      applicationsCount: data.applicationsCount || 0,
      assessmentId: data.assessmentId || undefined,
      addAssessmentLater: data.addAssessmentLater || false,
    } as Job;
  });
}

export async function getJobById(jobId: string): Promise<Job | null> {
  const jobRef = doc(db, 'jobs', jobId);
  const docSnap = await getDoc(jobRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      ...data, 
      id: docSnap.id, 
      postedDate: data.postedDate instanceof Timestamp ? data.postedDate.toDate().toISOString() : String(data.postedDate),
      savedBy: data.savedBy || [],
      applicationsCount: data.applicationsCount || 0,
      assessmentId: data.assessmentId || undefined,
      addAssessmentLater: data.addAssessmentLater || false,
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
        assessmentId: data.assessmentId || undefined,
        addAssessmentLater: data.addAssessmentLater || false,
      } as Job;
    });
  });
  
  const results = await Promise.all(jobPromises);
  return results.flat(); 
}


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

