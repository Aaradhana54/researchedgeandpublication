
import * as admin from 'firebase-admin';

// --- SERVER-SIDE ADMIN SDK INITIALIZATION ---

// This simplified initialization is more reliable in various hosting environments.
// It relies on the environment to provide the necessary service account credentials,
// which is standard for Firebase App Hosting and other Google Cloud environments.
if (!admin.apps.length) {
  admin.initializeApp();
}

const firestore = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

export { firestore, auth, storage, admin };
