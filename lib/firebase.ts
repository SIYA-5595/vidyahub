import { initializeApp, getApps, getApp } from "firebase/app";
<<<<<<< HEAD
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  persistentMultipleTabManager,
  persistentLocalCache,
} from "firebase/firestore";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env
    .NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID as string,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID as string,
};

// Initialize Firebase (Singleton pattern for Next.js)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Initialize Firestore with modern persistent cache
let db: ReturnType<typeof getFirestore>;

if (typeof window !== "undefined") {
  // Browser: use persistent multi-tab cache
  const existingDb = (app as unknown as { _db: typeof db })._db;
  if (existingDb) {
    db = existingDb;
  } else {
    try {
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      }, process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID || "(default)");
      (app as unknown as { _db: typeof db })._db = db;
    } catch (e) {
      db = getFirestore(app, process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID || "(default)");
    }
  }
} else {
  // Server-side rendering: no persistence
  db = getFirestore(app, process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID || "(default)");
}

// Initialize Analytics conditionally
let analytics: Analytics | undefined;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) analytics = getAnalytics(app);
  });
}

export { app, auth, db, analytics };
=======
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
>>>>>>> 7b5adfad5317e2e395ba8d84302ecc9d67bc1901
