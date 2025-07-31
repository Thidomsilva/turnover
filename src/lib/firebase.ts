// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "gesto-de-turnover",
  "appId": "1:523995517168:web:6479f21037d1aa8ebcb235",
  "storageBucket": "gesto-de-turnover.firebasestorage.app",
  "apiKey": "AIzaSyCq_Qnb-cDsWzij6bj39g-uaaKY7Ild9cw",
  "authDomain": "gesto-de-turnover.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "523995517168"
};

// Initialize Firebase
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { db, app, auth, firebaseConfig };
