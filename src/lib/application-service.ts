
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
  orderBy, 
  updateDoc,
  increment,
} from 'firebase/firestore';
import type { Job, JobApplication } from '@/types';
import { createUserSpecificNotification } from './notification-service'; // Import notification service
import { getJobById } from './job-service'; // Import job service to get job author

export async function createApplication(
  applicationData: Omit<JobApplication, 'id' | 'appliedDate' | 'status'>
): Promise<string> {
  const applicationsCollectionRef = collection(db, 'jobApplications');
  
  const docRef = await addDoc(applicationsCollectionRef, {
    ...applicationData,
    status: 'submitted',
    appliedDate: serverTimestamp(),
  });

  // Increment applicationsCount on the job
  const jobRef = doc(db, 'jobs', applicationData.jobId);
  const jobSnap = await getDoc(jobRef);
  let jobAuthorId: string | null = null;
  let jobTitle: string | null = null;

  if (jobSnap.exists()) {
      const jobData = jobSnap.data() as Job;
      jobAuthorId = jobData.authorId;
      jobTitle = jobData.title;
      await updateDoc(jobRef, {
        applicationsCount: increment(1)
      });
  }

  // Send notification to job poster
  if (jobAuthorId && jobTitle && applicationData.applicantId !== jobAuthorId) { // Don't notify if poster applies to own job
    try {
      await createUserSpecificNotification({
        recipientId: jobAuthorId,
        actorId: applicationData.applicantId,
        type: 'job_application_received',
        entityId: applicationData.jobId, // Link to the job
        entityType: 'job',
        content: `${applicationData.applicantName} applied for your job: "${jobTitle}".`,
      });
    } catch (notificationError) {
      console.error("Failed to send job application notification:", notificationError);
      // Optionally, handle this error, e.g., by logging or sending a monitoring alert
    }
  }


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
