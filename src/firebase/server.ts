import * as admin from 'firebase-admin';
import { firebaseConfig } from './config';

// --- SERVER-SIDE ADMIN SDK INITIALIZATION ---

// Ensure you have the GOOGLE_APPLICATION_CREDENTIALS environment variable set.
// This is typically handled by the Firebase/Google Cloud environment.
// For local development, you'd download a service account key JSON file and set the env var.
// `export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-file.json"`

const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS 
  ? JSON.parse(Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'base64').toString('ascii'))
  : undefined;

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: serviceAccount ? admin.credential.cert(serviceAccount) : admin.credential.applicationDefault(),
      databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
      storageBucket: firebaseConfig.storageBucket,
    });
  } catch (error) {
    console.error('Firebase Admin initialization error', error);
  }
}

const firestore = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

export { firestore, auth, storage, admin };
