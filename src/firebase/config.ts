
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

let firebaseApp: FirebaseApp;

// Check if Firebase has already been initialized
if (getApps().length > 0) {
  firebaseApp = getApp();
} else {
  firebaseApp = initializeApp(firebaseConfig);
}

const auth: Auth = getAuth(firebaseApp);
const firestore: Firestore = getFirestore(firebaseApp);
const storage: FirebaseStorage = getStorage(firebaseApp);

export { firebaseApp, auth, firestore, storage };
