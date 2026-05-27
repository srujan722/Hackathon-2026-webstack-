import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAmLUSHnyCkE3BGVdJxB7jowiQYCSdfFBE",
  authDomain: "water-supply-management-539e3.firebaseapp.com",
  projectId: "water-supply-management-539e3",
  storageBucket: "water-supply-management-539e3.firebasestorage.app",
  messagingSenderId: "38309002527",
  appId: "1:38309002527:web:6004fa651226d4218d442a",
  measurementId: "G-X90R796MHD"
};

const app = initializeApp(firebaseConfig);

// services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;