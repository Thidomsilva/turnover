// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration - CORRECTED
const firebaseConfig = {
  apiKey: "AIzaSyCq_Qnb-cDsWzij6bj39g-uaaKY7Ild9cw",
  authDomain: "gesto-de-turnover.firebaseapp.com",
  projectId: "gesto-de-turnover",
  storageBucket: "gesto-de-turnover.appspot.com",
  messagingSenderId: "523995517168",
  appId: "1:523995517168:web:6479f21037d1aa8ebcb235"
};

// Initialize Firebase
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);
const auth = getAuth(app);

export { db, app, auth, firebaseConfig };
