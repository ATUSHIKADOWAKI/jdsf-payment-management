import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAOI1e5k8NwTF9vT6UjJCCcJ5BYolz0EnI",
  authDomain: "jdsf-payment-management.firebaseapp.com",
  projectId: "jdsf-payment-management",
  storageBucket: "jdsf-payment-management.firebasestorage.app",
  messagingSenderId: "869417149271",
  appId: "1:869417149271:web:0d3e021f207aee76511412",
  measurementId: "G-JRT9JREMMM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);