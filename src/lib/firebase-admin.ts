
import * as admin from 'firebase-admin';

let adminApp: admin.app.App;

function initializeFirebaseAdmin() {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    throw new Error('A variável de ambiente FIREBASE_SERVICE_ACCOUNT_KEY não está definida.');
  }

  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  adminApp = admin.app();
}

export const getAdminApp = () => {
  if (!adminApp) {
    try {
      initializeFirebaseAdmin();
    } catch (error: any) {
        // We throw a more user-friendly error to be caught in the action.
        throw new Error(`A inicialização do Firebase Admin falhou. A chave de serviço pode estar faltando ou ser inválida. Detalhes: ${error.message}`);
    }
  }
  return adminApp;
};
