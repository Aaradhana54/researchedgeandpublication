
import * as admin from 'firebase-admin';
import { firebaseConfig } from './config';

// --- SERVER-SIDE ADMIN SDK INITIALIZATION ---

if (!admin.apps.length) {
  try {
    // In many environments, this simple initialization is sufficient
    // and will automatically use configured service accounts.
    admin.initializeApp();
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    // Fallback for environments that require explicit config
    try {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
            storageBucket: firebaseConfig.storageBucket,
        });
    } catch(e) {
         console.error('Secondary Firebase Admin initialization attempt failed', e)
    }
  }
}

const firestore = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

export { firestore, auth, storage, admin };
