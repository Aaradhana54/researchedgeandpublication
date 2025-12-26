
import * as admin from 'firebase-admin';

// --- SERVER-SIDE ADMIN SDK INITIALIZATION ---

// This simplified initialization is the standard and most reliable method.
// It relies on the hosting environment (like Firebase App Hosting) to automatically 
// provide the necessary service account credentials.
if (!admin.apps.length) {
  admin.initializeApp();
}

const firestore = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

export { firestore, auth, storage, admin };
