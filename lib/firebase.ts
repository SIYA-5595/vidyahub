import { initializeApp, getApps, getApp } from "firebase/app";
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
