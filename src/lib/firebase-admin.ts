
import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let adminApp: App;
let adminDb: Firestore;
let adminAuth: Auth;

function getServiceAccount() {
  const serviceAccountStr = process.env.SERVICE_ACCOUNT_KEY;
  if (!serviceAccountStr) {
    throw new Error('A variável de ambiente SERVICE_ACCOUNT_KEY não está definida. Verifique seu arquivo .env ou as configurações da Vercel.');
  }
  try {
    return JSON.parse(serviceAccountStr);
  } catch (error) {
    console.error("Falha ao analisar a SERVICE_ACCOUNT_KEY. Verifique se é um JSON válido.", error);
    throw new Error("Formato inválido para SERVICE_ACCOUNT_KEY.");
  }
}

if (getApps().length === 0) {
  try {
    adminApp = initializeApp({
      credential: cert(getServiceAccount()),
    });
  } catch (error) {
     console.error("Falha ao inicializar o Firebase Admin SDK", error);
     // Em um cenário de falha, inicializamos os stubs para evitar que o app quebre completamente,
     // mas nenhuma operação de banco de dados funcionará.
     adminDb = {} as Firestore;
     adminAuth = {} as Auth;
  }
} else {
  adminApp = getApp();
}

if (!adminDb) adminDb = getFirestore(adminApp);
if (!adminAuth) adminAuth = getAuth(adminApp);

export const getDb = () => adminDb;
export const getAuthAdmin = () => adminAuth;
