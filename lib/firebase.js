import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBhI08xFRWDgeWFzu9SzalS0rysFpJn4f8",
  authDomain: "secret-party-d63ef.firebaseapp.com",
  databaseURL: "https://secret-party-d63ef-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "secret-party-d63ef",
  storageBucket: "secret-party-d63ef.firebasestorage.app",
  messagingSenderId: "342764951778",
  appId: "1:342764951778:web:d78abffb959959ca6f66bb",
  measurementId: "G-RV0HXG6B3J"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);