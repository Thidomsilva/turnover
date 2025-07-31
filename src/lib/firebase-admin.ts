
import * as admin from 'firebase-admin';

let adminApp: admin.app.App;

function initializeFirebaseAdmin() {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    throw new Error('A variável de ambiente FIREBASE_SERVICE_ACCOUNT_KEY não está definida.');
  }

  // Evita reinicialização
  if (admin.apps.length > 0) {
    adminApp = admin.app();
    return;
  }
  
  try {
    const serviceAccount = JSON.parse(serviceAccountKey);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch(e: any) {
    throw new Error(`A chave de serviço do Firebase é inválida: ${e.message}`);
  }

  adminApp = admin.app();
}

export const getAdminApp = () => {
  if (!adminApp) {
    try {
      initializeFirebaseAdmin();
    } catch (error: any) {
      throw new Error(`A inicialização do Firebase Admin falhou. ${error.message}`);
    }
  }
  return adminApp;
};
