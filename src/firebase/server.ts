import * as admin from 'firebase-admin';
import { firebaseConfig } from './config';

// --- SERVER-SIDE ADMIN SDK INITIALIZATION ---

if (!admin.apps.length) {
  try {
    // When running in a Google Cloud environment, the SDK will automatically
    // find the service account credentials.
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
      storageBucket: firebaseConfig.storageBucket,
    });
  } catch (error) {
    console.error('Firebase Admin initialization error', error);
    // For local development outside of a Google environment, you might need
    // to manually set up a service account.
    // Download a service account key JSON file from your Firebase project settings,
    // then set the GOOGLE_APPLICATION_CREDENTIALS environment variable.
    // e.g., `export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-file.json"`
    // Or, you can initialize with the service account object directly:
    /*
    try {
        const serviceAccount = require('/path/to/your/service-account-file.json');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
            storageBucket: firebaseConfig.storageBucket,
        });
    } catch (e) {
        console.error('Secondary Firebase Admin initialization attempt failed', e)
    }
    */
  }
}

const firestore = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

export { firestore, auth, storage, admin };
