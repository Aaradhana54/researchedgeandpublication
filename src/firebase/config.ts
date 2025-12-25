
import { getApps, initializeApp, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// IMPORTANT: This is a sample configuration. Replace with your actual Firebase config object.
const firebaseConfig = {
  projectId: "studio-811024150-b691e",
  appId: "1:657512827836:web:b37c7cc881e15931f4b9b9",
  apiKey: "AIzaSyB3dqCoiJoZH8gOoAPNACS_eAIubLdBBd4",
  authDomain: "studio-811024150-b691e.firebaseapp.com",
  storageBucket: "studio-811024150-b691e.appspot.com",
  messagingSenderId: "657512827836",
  measurementId: "G-XXXXXXXXXX"
};

// --- SERVICE INITIALIZATION ---

// Use a function to ensure initialization happens once, on the client.
function initializeFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
}

const firebaseApp = initializeFirebaseApp();
const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

export { firebaseApp, auth, firestore, storage };
