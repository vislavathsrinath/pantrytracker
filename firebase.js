import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBXJuIf5DRwxa7VVFMy37XKjjCYDGX4KjA",
  authDomain: "pantry-tracker-bb6f3.firebaseapp.com",
  projectId: "pantry-tracker-bb6f3",
  storageBucket: "pantry-tracker-bb6f3.appspot.com",
  messagingSenderId: "651025093961",
  appId: "1:651025093961:web:de96acaa070b575b7bb698",
  measurementId: "G-3ZVFPZRCHY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Define analytics variable
let analytics;

// Initialize Firebase Analytics only on the client side
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

const auth = getAuth(app);
const firestore = getFirestore(app);

export { app, analytics, firestore, auth };
