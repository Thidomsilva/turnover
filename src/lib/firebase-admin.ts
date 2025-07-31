
import * as admin from 'firebase-admin';

// We will initialize the app on demand
let adminApp: admin.app.App;

function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccount) {
      throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_KEY environment variable. Please configure it to use admin features.');
    }

    try {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccount)),
      });
    } catch (error: any) {
      console.error('Firebase admin initialization error', error.stack);
      throw new Error('Firebase admin initialization failed.');
    }
  }
  adminApp = admin.app();
}

// Lazy initialization
const getAdminApp = () => {
  if (!adminApp) {
    initializeFirebaseAdmin();
  }
  return adminApp;
}

export { getAdminApp };
