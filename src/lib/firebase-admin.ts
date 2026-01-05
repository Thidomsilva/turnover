
import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let adminApp: App;
let adminDb: Firestore;
let adminAuth: Auth;

function getServiceAccount() {
  const serviceAccount = process.env.SERVICE_ACCOUNT_KEY;
  if (!serviceAccount) {
    throw new Error('A variável de ambiente SERVICE_ACCOUNT_KEY não está definida.');
  }
  return JSON.parse(serviceAccount);
}

if (getApps().length === 0) {
  adminApp = initializeApp({
    credential: cert(getServiceAccount()),
  });
} else {
  adminApp = getApp();
}

adminDb = getFirestore(adminApp);
adminAuth = getAuth(adminApp);

export const getDb = () => adminDb;
export const getAuthAdmin = () => adminAuth;
