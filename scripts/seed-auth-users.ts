
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

async function migrateUsersToAuth() {
    console.log('Starting user migration...');
    const usersSnapshot = await db.collection('users').get();

    if (usersSnapshot.empty) {
        console.log('No user documents found in Firestore. Nothing to migrate.');
        return;
    }

    const temporaryPassword = 'nova_senha_123';
    console.log(`\n---\nIMPORTANT: A temporary password "${temporaryPassword}" will be set for all migrated users.\nThey should change it upon first login.\n---\n`);


    for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        const { email, name, role } = userData;

        if (!email) {
            console.warn(`Skipping user document ${userDoc.id} because it has no email.`);
            continue;
        }

        try {
            // 1. Check if user already exists in Firebase Auth
            let userRecord;
            try {
                userRecord = await auth.getUserByEmail(email);
                console.log(`Auth user for ${email} already exists with UID ${userRecord.uid}. Skipping auth creation.`);
            } catch (error: any) {
                if (error.code === 'auth/user-not-found') {
                    // 2. If user does not exist, create them in Firebase Auth
                    console.log(`Auth user for ${email} not found. Creating...`);
                    userRecord = await auth.createUser({
                        email: email,
                        password: temporaryPassword,
                        displayName: name,
                        emailVerified: true,
                        disabled: false,
                    });
                    console.log(`Successfully created new auth user for ${email} with UID ${userRecord.uid}`);
                } else {
                    // Rethrow other errors
                    throw error;
                }
            }

            // 3. Update the Firestore document with the correct Auth UID
            // This ensures consistency. We use the Auth UID as the document ID.
            if (userDoc.id !== userRecord.uid) {
                console.log(`Firestore doc ID ${userDoc.id} does not match Auth UID ${userRecord.uid}. Re-creating doc with correct ID.`);
                
                // Set data in new document with correct ID
                await db.collection('users').doc(userRecord.uid).set({
                    ...userData,
                    uid: userRecord.uid, // Ensure uid field is correct
                });

                // Delete the old document
                await db.collection('users').doc(userDoc.id).delete();
                console.log(`Migrated Firestore document for ${email} from ${userDoc.id} to ${userRecord.uid}.`);

            } else {
                 await db.collection('users').doc(userDoc.id).update({
                    uid: userRecord.uid, // just ensure uid field is correct
                });
                console.log(`Firestore document for ${email} already has the correct ID. Ensured 'uid' field is set.`);
            }

        } catch (error: any) {
            console.error(`Failed to migrate user ${email}:`, error.message || error);
        }
    }
}

migrateUsersToAuth().then(() => {
    console.log('\nUser migration process finished.');
    process.exit(0);
}).catch((error) => {
    console.error('\nUnhandled error during user migration:', error);
    process.exit(1);
});
