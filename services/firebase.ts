
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// =================================================================
// TODO: PASTE YOUR FIREBASE PROJECT CONFIGURATION HERE
// =================================================================
// You can find these keys in your project's Firebase console:
// Go to Project settings (gear icon) > scroll down to "Your apps".
// Select your web app and find the `firebaseConfig` object.
// More info: https://firebase.google.com/docs/web/setup#config-object
const firebaseConfig = {
  apiKey: "AIzaSyC3o4DjtkDo0uJktJ_dCXDmM1jNQnJg2Og",
  authDomain: "jetro-reverte.firebaseapp.com",
  projectId: "jetro-reverte",
  storageBucket: "jetro-reverte.firebasestorage.app",
  messagingSenderId: "623683672405",
  appId: "1:623683672405:web:41397be84dac269330f7dc",
  measurementId: "G-1LYCMX2Y0N"
};

// IMPORTANT: In a real production app, use environment variables
// for these keys to keep them secure and out of version control.

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

// Export services for use in other parts of the app
export { auth, db, app };