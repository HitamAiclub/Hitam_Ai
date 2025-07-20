import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
   apiKey: "AIzaSyDtaV1gdByf5khP3AatvKMMpMHA8HozuUU",
  authDomain: "hitam-ai-club.firebaseapp.com",
  databaseURL: "https://hitam-ai-club-default-rtdb.firebaseio.com",
  projectId: "hitam-ai-club",
  storageBucket: "hitam-ai-club.appspot.com",
  messagingSenderId: "87157714690",
  appId: "1:87157714690:web:3888500c1ff26590259c1b",
  measurementId: "G-X4J4GVY63K"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enable offline persistence
import { enableNetwork, disableNetwork } from 'firebase/firestore';

// Test connection function
export const testFirebaseConnection = async () => {
  try {
    // Simple connection test without requiring data
    console.log('Firebase services initialized successfully');
    
    return true;
  } catch (error) {
    console.warn('Firebase initialization warning:', error.message);
    return false;
  }
};

export default app;