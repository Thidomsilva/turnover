
import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let adminApp: App;
let adminDb: Firestore;
let adminAuth: Auth;

function getServiceAccount() {
  const serviceAccountStr = process.env.SERVICE_ACCOUNT_KEY;
  if (!serviceAccountStr) {
    throw new Error('A variável de ambiente SERVICE_ACCOUNT_KEY não está definida. Verifique suas configurações de ambiente.');
  }
  try {
    return JSON.parse(serviceAccountStr);
  } catch (error) {
    console.error("Falha ao analisar a SERVICE_ACCOUNT_KEY. Verifique se é um JSON válido.", error);
    throw new Error("Formato inválido para SERVICE_ACCOUNT_KEY.");
  }
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
