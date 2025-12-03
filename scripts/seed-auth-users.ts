
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
// IMPORTANT: Download your service account key JSON file from the Firebase console
// and save it as 'serviceAccountKey.json' in this 'scripts' directory.
// This file is git-ignored, so it won't be committed to your repository.
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id
    });
}

const db = getFirestore();
const auth = admin.auth();

async function seedAuthUsers() {
    const usuarios = [
        { email: 'marlon.carvalho@eletropolar.com.br', senha: 'marlon123', nome: 'Marlon', role: 'user' },
        { email: 'karin@sagacy.com.br', senha: 'karin123', nome: 'Karin', role: 'user' },
        { email: 'marcos@sagacy.com.br', senha: 'marcos123', nome: 'Marcos', role: 'user' },
        { email: 'larissa.eduarda@eletropolar.com.br', senha: 'larissa123', nome: 'Larissa', role: 'user' },
        { email: 'paulo@eletropolar.com.br', senha: 'paulo123', nome: 'Paulo', role: 'user' },
        { email: 'thiago@sagacy.com.br', senha: 'thiago123', nome: 'Thiago', role: 'admin' },
    ];

    for (const usuario of usuarios) {
        try {
            // 1. Create user in Firebase Authentication
            const userRecord = await auth.createUser({
                email: usuario.email,
                password: usuario.senha,
                displayName: usuario.nome,
                emailVerified: true,
                disabled: false
            });

            console.log(`Successfully created new auth user: ${userRecord.uid} (${userRecord.email})`);

            // 2. Create corresponding user document in Firestore
            const userDoc = {
                name: usuario.nome,
                email: usuario.email,
                role: usuario.role,
                uid: userRecord.uid, // Store the auth UID in the document
            };
            
            // Note: We use the auth UID as the document ID for easy lookup
            await db.collection('users').doc(userRecord.uid).set(userDoc);
            
            console.log(`Successfully created Firestore user doc for: ${userRecord.email}`);

        } catch (error: any) {
            if (error.code === 'auth/email-already-exists') {
                console.warn(`Auth user with email ${usuario.email} already exists. Skipping auth creation.`);
                // If user exists, you might want to update their Firestore doc, but we'll skip for this script.
            } else {
                console.error(`Error creating user ${usuario.email}:`, error);
            }
        }
    }
}

seedAuthUsers().then(() => {
    console.log('User seeding process finished.');
    process.exit(0);
}).catch((error) => {
    console.error('Unhandled error during user seeding:', error);
    process.exit(1);
});

    