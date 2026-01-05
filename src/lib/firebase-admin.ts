
'use server';

import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let adminApp: App;
let adminDb: Firestore;
let adminAuth: Auth;

function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    const serviceAccountStr = process.env.SERVICE_ACCOUNT_KEY;
    if (!serviceAccountStr) {
      throw new Error('A variável de ambiente SERVICE_ACCOUNT_KEY não está definida. Verifique suas configurações de ambiente.');
    }
    
    try {
      const serviceAccount = JSON.parse(serviceAccountStr);
      adminApp = initializeApp({
        credential: cert(serviceAccount),
      });
    } catch (error) {
      console.error("Falha ao analisar a SERVICE_ACCOUNT_KEY. Verifique se é um JSON válido.", error);
      throw new Error("Formato inválido para SERVICE_ACCOUNT_KEY.");
    }
  } else {
    adminApp = getApp();
  }
  
  adminDb = getFirestore(adminApp);
  adminAuth = getAuth(adminApp);
}

// Chame a inicialização uma vez para garantir que tudo esteja pronto.
try {
  initializeFirebaseAdmin();
} catch (e) {
  // Atrasar a emissão de erro se a variável de ambiente não estiver pronta
  // no momento do carregamento inicial do módulo.
  console.warn('Inicialização adiada do Firebase Admin devido à falta de SERVICE_ACCOUNT_KEY no carregamento inicial.');
}

export const getDb = (): Firestore => {
  if (!adminDb) {
    console.log('adminDb não encontrado, reiniciando...');
    initializeFirebaseAdmin();
  }
  return adminDb;
};

export const getAuthAdmin = (): Auth => {
  if (!adminAuth) {
    console.log('adminAuth não encontrado, reiniciando...');
    initializeFirebaseAdmin();
  }
  return adminAuth;
};
