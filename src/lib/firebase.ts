import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB91wOJ0VPUKmjj4DXdSDYnHQZRgXft5pU",
  authDomain: "mservice-2ceec.firebaseapp.com",
  projectId: "mservice-2ceec",
  storageBucket: "mservice-2ceec.firebasestorage.app",
  messagingSenderId: "101029623164",
  appId: "1:101029623164:web:6d272f8557b4be19a160f9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);