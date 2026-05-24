import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAJq_mvymnkYksKtV2Fo7-H-H9sltwMYkQ",
  authDomain: "cafe-canvas-yash.firebaseapp.com",
  databaseURL: "https://cafe-canvas-yash-default-rtdb.firebaseio.com",
  projectId: "cafe-canvas-yash",
  storageBucket: "cafe-canvas-yash.firebasestorage.app",
  messagingSenderId: "156842449955",
  appId: "1:156842449955:web:de4f0fe0b5e74bd1dc6596",
};

// Initialize Firebase (ensuring singleton usage during local hot reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);

// Initialize Analytics only in browser
let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, analytics, auth, db, rtdb };

