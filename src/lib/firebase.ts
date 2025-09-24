// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "studio-1299955846-26083",
  "appId": "1:197849744080:web:19db086a78cf7384d7d4d5",
  "apiKey": "AIzaSyDLoQ7EQv4B3l8Nat-1R13Zr_CT_YEeAvA",
  "authDomain": "studio-1299955846-26083.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "197849744080"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
