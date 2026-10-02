import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCLmqOh2XNdqzJeaB0-MnagcTwVmB0VzlY",
  authDomain: "enrollsmart-130e2.firebaseapp.com",
  projectId: "enrollsmart-130e2",
  storageBucket: "enrollsmart-130e2.firebasestorage.app",
  messagingSenderId: "889151016280",
  appId: "1:889151016280:web:789d6ca802657d560a692d",
  measurementId: "G-82SS56G699"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;