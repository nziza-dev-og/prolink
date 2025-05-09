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
  apiKey: "AIzaSyC7ZIObx_3nwu6fPwUKZWVOLPt67iE2LlY",
  authDomain: "react-chat-d82gq.firebaseapp.com",
  projectId: "react-chat-d82gq",
  storageBucket: "react-chat-d82gq.appspot.com", // Usually .appspot.com, but user provided .firebasestorage.app. Firestore usually uses .appspot.com. Keeping it as .appspot.com for broader compatibility.
  messagingSenderId: "1098560041392",
  appId: "1:1098560041392:web:2434dd4a9250558c23a675"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };

