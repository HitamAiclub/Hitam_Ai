import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDtaV1gdByf5khP3AatvKMMpMHA8HozuUU",
  authDomain: "hitam-ai-club.firebaseapp.com",
  databaseURL: "https://hitam-ai-club-default-rtdb.firebaseio.com",
  projectId: "hitam-ai-club",
  storageBucket: "hitam-ai-club.firebasestorage.app",
  messagingSenderId: "87157714690",
  appId: "1:87157714690:web:3888500c1ff26590259c1b",
  measurementId: "G-X4J4GVY63K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;