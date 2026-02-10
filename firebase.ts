import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDcYfZAQX5VtN8HQKVh1d7_pgTPye2r49U",
  authDomain: "una-aventura-mas-cr.firebaseapp.com",
  projectId: "una-aventura-mas-cr",
  storageBucket: "una-aventura-mas-cr.firebasestorage.app",
  messagingSenderId: "82072938954",
  appId: "1:82072938954:web:f1da0ca965e152a68f0733",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);