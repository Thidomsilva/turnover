
import * as admin from 'firebase-admin';

let adminApp: admin.app.App | null = null;

const initializeFirebaseAdmin = () => {
  if (admin.apps.length > 0) {
    adminApp = admin.app();
    return;
  }
  
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    throw new Error('A variável de ambiente FIREBASE_SERVICE_ACCOUNT_KEY não está definida.');
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountKey);
    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (e: any) {
    console.error("Failed to parse Firebase service account key.", e);
    throw new Error(`A chave de serviço do Firebase é inválida: ${e.message}`);
  }
};

export const getAdminApp = (): admin.app.App => {
  if (!adminApp) {
    try {
      initializeFirebaseAdmin();
    } catch (error: any) {
      console.error("Firebase Admin initialization failed:", error);
      throw new Error(`A inicialização do Firebase Admin falhou. ${error.message}`);
    }
  }
  // This check is necessary because initializeFirebaseAdmin can return without setting adminApp if admin.apps.length > 0
  if (!adminApp) {
    throw new Error('A inicialização do Firebase Admin não resultou em um app válido.');
  }
  return adminApp;
};
