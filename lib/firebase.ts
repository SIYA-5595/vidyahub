import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, initializeFirestore, Firestore, setLogLevel } from "firebase/firestore";

setLogLevel('debug');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

if (typeof window !== "undefined") {
  console.log("[Firebase] Initializing Nexus Node:", {
    projectId: firebaseConfig.projectId,
    appId: firebaseConfig.appId?.split(":").slice(-1)[0], // last part for brevity
    hasApiKey: !!firebaseConfig.apiKey
  });
}
  
// Initialize Firebase
const apps = getApps();
let app: any;
let db: Firestore;
let auth: Auth;

if (typeof window !== "undefined") {
  const g = window as any;
  
  // App Singleton - Detect and purge project ID mismatches (crucial for local dev switches)
  const existingDefault = apps.find(a => a.name === "[DEFAULT]");
  if (existingDefault && existingDefault.options.projectId !== firebaseConfig.projectId) {
    console.warn(`[Firebase] Project mismatch: ${existingDefault.options.projectId} != ${firebaseConfig.projectId}. Re-initializing...`);
    // Delete existing instances to force fresh creation
    delete g._firebase_app;
    delete g._firebase_db;
    delete g._firebase_auth;
  }

  if (!g._firebase_app) {
    g._firebase_app = initializeApp(firebaseConfig);
  }
  app = g._firebase_app;

  // Auth Singleton
  if (!g._firebase_auth) {
    g._firebase_auth = getAuth(app);
  }
  auth = g._firebase_auth;

  // Firestore Singleton
  if (!g._firebase_db) {
    try {
      g._firebase_db = initializeFirestore(app, {
        ignoreUndefinedProperties: true,
        experimentalForceLongPolling: true, // Crucial for connection stability fixed earlier
      });
      console.log("[Firebase] Firestore Initialized with protocol: Long-Polling");
    } catch (e) {
      g._firebase_db = getFirestore(app);
    }
  }
  db = g._firebase_db;

  if (process.env.NODE_ENV === "development" && !g._firebase_logged) {
    console.log(`[Firebase] Optimized Nexus Connection: ${firebaseConfig.projectId}`);
    g._firebase_logged = true;
  }
} else {
  // Server-side
  const existingDefault = apps.find(a => a.name === "[DEFAULT]");
  app = existingDefault || initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
}

export { app, db, auth };
