
import * as admin from 'firebase-admin';

// We will initialize the app on demand
let adminApp: admin.app.App;

function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
    // When running in a Google Cloud environment, the SDK can automatically
    // discover the service account credentials.
    try {
      admin.initializeApp();
    } catch (error: any) {
      console.error('Firebase admin initialization error', error.stack);
      // If auto-discovery fails, it might be because the service account key is needed.
      // We will re-throw a more user-friendly error.
      throw new Error('Firebase admin initialization failed. This might be due to missing service account credentials in the environment.');
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
