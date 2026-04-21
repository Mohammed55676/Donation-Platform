import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA7iw4iJjKSZ-4_NVRWDweVehLs8RdVEKs",
  authDomain: "donation-platform-4d81c.firebaseapp.com",
  projectId: "donation-platform-4d81c",
  storageBucket: "donation-platform-4d81c.firebasestorage.app",
  messagingSenderId: "829930822837",
  appId: "1:829930822837:web:b4863ca8d740f2956c32fc",
  measurementId: "G-KT8HYGJ7MK",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
