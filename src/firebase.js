// C:\xampp\htdocs\ghana_auto_hub\frontend\src\firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDZ5KfPIo6olKwiPOrA3sLUuZnU4X4QT1E",
  authDomain: "autodutygh.firebaseapp.com",
  projectId: "autodutygh",
  storageBucket: "autodutygh.firebasestorage.app",
  messagingSenderId: "317869501707",
  appId: "1:317869501707:web:9efe58f640b09de7f0c60e",
  measurementId: "G-4EGSLLV9K4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the specific services we need
export const auth = getAuth(app);       // For Login/Register
export const db = getFirestore(app);    // For the Dealer Directory Database
export const storage = getStorage(app); // For Profile Picture Uploads