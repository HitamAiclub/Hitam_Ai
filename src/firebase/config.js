import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDtaV1gdByf5khP3AatvKMMpMHA8HozuUU",
  authDomain: "hitam-ai-club.firebaseapp.com",
  databaseURL: "https://hitam-ai-club-default-rtdb.firebaseio.com/",
  projectId: "hitam-ai-club",
  storageBucket: "hitam-ai-club.appspot.com",
  messagingSenderId: "87157714690",
  appId: "1:87157714690:web:hitam-ai-club-app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;