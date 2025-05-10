
'use server';

import { db } from './firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  Timestamp,
  limit,
  doc,
  getDoc,
} from 'firebase/firestore';
import type { JobApplication, UserProfile, Job } from '@/types';

export async function createApplication(
  applicationData: Omit<JobApplication, 'id' | 'appliedDate' | 'status'>
): Promise<string> {
  const applicationsCollectionRef = collection(db, 'jobApplications');
  
  const docRef = await addDoc(applicationsCollectionRef, {
    ...applicationData,
    status: 'submitted',
    appliedDate: serverTimestamp(),
  });
  return docRef.id;
}

export async function checkIfUserApplied(userId: string, jobId: string): Promise<boolean> {
  const applicationsCollectionRef = collection(db, 'jobApplications');
  const q = query(
    applicationsCollectionRef,
    where('applicantId', '==', userId),
    where('jobId', '==', jobId),
    limit(1)
  );

  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

export async function getApplicationById(applicationId: string): Promise<JobApplication | null> {
  const appRef = doc(db, 'jobApplications', applicationId);
  const docSnap = await getDoc(appRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      appliedDate: data.appliedDate instanceof Timestamp ? data.appliedDate.toDate().toISOString() : String(data.appliedDate),
    } as JobApplication;
  }
  return null;
}

export async function getApplicationsByJobId(jobId: string): Promise<JobApplication[]> {
    const applicationsCollectionRef = collection(db, 'jobApplications');
    const q = query(applicationsCollectionRef, where('jobId', '==', jobId), orderBy('appliedDate', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
        id: docSnap.id,
        ...data,
        appliedDate: data.appliedDate instanceof Timestamp ? data.appliedDate.toDate().toISOString() : String(data.appliedDate),
        } as JobApplication;
    });
}

export async function getApplicationsByUserId(userId: string): Promise<JobApplication[]> {
    const applicationsCollectionRef = collection(db, 'jobApplications');
    const q = query(applicationsCollectionRef, where('applicantId', '==', userId), orderBy('appliedDate', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
        id: docSnap.id,
        ...data,
        appliedDate: data.appliedDate instanceof Timestamp ? data.appliedDate.toDate().toISOString() : String(data.appliedDate),
        } as JobApplication;
    });
}
```