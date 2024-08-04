// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Import the functions you need from the SDKs you need
import { getAnalytics,  isSupported } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const auth = getAuth(app);
const firestore = getFirestore(app);

const analytics = getAnalytics(app);

export { firestore, auth };