'use server';

import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { FirebaseError } from 'firebase/app';

/**
 * Uploads a file to Firebase Storage.
 * @param file The file to upload.
 * @param path The path in Firebase Storage where the file should be stored (e.g., 'profilePictures/userId/filename.jpg').
 * @returns A promise that resolves with the download URL of the uploaded file.
 * @throws Throws an error if the upload fails.
 */
export async function uploadFile(file: File, path: string): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    const firebaseError = error as FirebaseError;
    console.error('Error uploading file to Firebase Storage:', firebaseError);
    throw new Error(`Failed to upload file: ${firebaseError.message}`);
  }
}
