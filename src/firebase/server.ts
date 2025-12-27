
import * as admin from 'firebase-admin';

// --- SERVER-SIDE ADMIN SDK INITIALIZATION ---

// This file initializes the Firebase Admin SDK.
// It relies on the hosting environment (like Firebase App Hosting) to automatically 
// provide the necessary service account credentials via Application Default Credentials (ADC).
//
// CURRENT STATUS:
// The server environment is consistently failing to obtain a valid OAuth2 access token,
// leading to errors like "Could not refresh Access token" or "Error fetching access token".
// This indicates a problem with the service account permissions or the environment's
// metadata server, which is outside the control of the application code.
//
// As a result, all server-side actions using the Admin SDK have been disabled to
// prevent application crashes. The code is left here for future use if the underlying
// infrastructure issue is resolved.

if (!admin.apps.length) {
  try {
    // This is the standard initialization method for environments like App Hosting.
    admin.initializeApp();
  } catch (error: any) {
    console.error("Firebase Admin SDK initialization failed:", error);
    // This log helps confirm if the initialization itself is the point of failure.
  }
}

const firestore = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

export { firestore, auth, storage, admin };
