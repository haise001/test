import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// TODO: Замените эти данные на ваши из Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDOC9w6vFGcdnPp_Szir80XBIyPa3xlxEY",
  authDomain: "risen-d8d90.firebaseapp.com",
  projectId: "risen-d8d90",
  storageBucket: "risen-d8d90.firebasestorage.app",
  messagingSenderId: "646977436926",
  appId: "1:646977436926:web:40d7225f5a47ea8f6f79af",
  measurementId: "G-FGXYF3WH11"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
