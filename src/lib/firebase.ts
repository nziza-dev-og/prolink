// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// IMPORTANT: For production apps, consider moving this configuration to environment variables.
const firebaseConfig = {
  apiKey: "AIzaSyCjdp4gn0poRVWpmc_5amIm4mbt2uzo5Ac",
  authDomain: "hospital-patient-manager.firebaseapp.com",
  projectId: "hospital-patient-manager",
  storageBucket: "hospital-patient-manager.appspot.com", // Corrected: .appspot.com is typical for storageBucket
  messagingSenderId: "925703856243",
  appId: "1:925703856243:web:d140d4aa56ae91f11f0a06",
  measurementId: "G-R0H1JXR7N9"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
