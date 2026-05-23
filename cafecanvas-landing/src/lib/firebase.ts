import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDawhnejQHUBecpSO9Xgbs2NnqOu0F17gw",
  authDomain: "cafe-canava-s.firebaseapp.com",
  projectId: "cafe-canava-s",
  storageBucket: "cafe-canava-s.firebasestorage.app",
  messagingSenderId: "540037815211",
  appId: "1:540037815211:web:21ee3b3c88ede73537d0ee",
  measurementId: "G-YP8E6NT10E"
};

// Initialize Firebase (ensuring singleton usage during local hot reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Analytics only in browser
let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, analytics };
