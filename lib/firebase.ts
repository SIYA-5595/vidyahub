import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, initializeFirestore, Firestore, setLogLevel, enableIndexedDbPersistence } from "firebase/firestore";

setLogLevel('silent'); // Reducing console noise for the user

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
    appId: firebaseConfig.appId?.split(":").slice(-1)[0],
    hasApiKey: !!firebaseConfig.apiKey
  });
}
  
const apps = getApps();
let app: any;
let db: Firestore;
let auth: Auth;

if (typeof window !== "undefined") {
  const g = window as any;
  
  const existingDefault = apps.find(a => a.name === "[DEFAULT]");
  if (existingDefault && existingDefault.options.projectId !== firebaseConfig.projectId) {
    console.warn(`[Firebase] Project mismatch detected. Resetting singleton.`);
    delete g._firebase_app;
    delete g._firebase_db;
    delete g._firebase_auth;
  }

  if (!g._firebase_app) {
    g._firebase_app = initializeApp(firebaseConfig);
  }
  app = g._firebase_app;

  if (!g._firebase_auth) {
    g._firebase_auth = getAuth(app);
  }
  auth = g._firebase_auth;

  if (!g._firebase_db) {
    try {
      g._firebase_db = initializeFirestore(app, {
        ignoreUndefinedProperties: true,
        experimentalForceLongPolling: true,
      });
      
      // Enable Offline Persistence for a smoother experience
      enableIndexedDbPersistence(g._firebase_db).catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn("[Firebase] Persistence failed: Multiple tabs open");
        } else if (err.code === 'unimplemented') {
          console.warn("[Firebase] Persistence failed: Browser doesn't support it");
        }
      });

      console.log("[Firebase] Firestore Protocol: Long-Polling + Persistence");
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
