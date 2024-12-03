// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBXJuIf5DRwxa7VVFMy37XKjjCYDGX4KjA",
  authDomain: "pantry-tracker-bb6f3.firebaseapp.com",
  projectId: "pantry-tracker-bb6f3",
  storageBucket: "pantry-tracker-bb6f3.firebasestorage.app",
  messagingSenderId: "651025093961",
  appId: "1:651025093961:web:de96acaa070b575b7bb698",
  measurementId: "G-3ZVFPZRCHY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;