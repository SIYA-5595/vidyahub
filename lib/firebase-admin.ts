import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

function initAdmin() {
  if (admin.apps.length > 0) return;

  try {
    // Strategy 1: serviceAccountKey.json file on disk
    const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      admin.initializeApp({ 
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id
      });
      console.log('[firebase-admin] Initialized via serviceAccountKey.json');
      return;
    }

    // Strategy 2: Individual env vars (set in .env.local / hosting env)
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const rawKey = process.env.FIREBASE_PRIVATE_KEY;

    // Only attempt cert init if all three values look real/non-placeholder
    const isPlaceholder = (v?: string) => !v || v.includes('your_') || v.includes('YOUR_') || v.length < 20;

    if (!isPlaceholder(projectId) && !isPlaceholder(clientEmail) && !isPlaceholder(rawKey)) {
      const privateKey = rawKey!.replace(/\\n/g, '\n');
      admin.initializeApp({
        credential: admin.credential.cert({ projectId: projectId!, clientEmail, privateKey }),
      });
      console.log('[firebase-admin] Initialized via environment variables');
      return;
    }

    // Strategy 3: Project-ID-only fallback (build-time / CI — limited functionality)
    if (projectId && !isPlaceholder(projectId)) {
      admin.initializeApp({ projectId });
      console.warn('[firebase-admin] Initialized with projectId only — Admin Auth features will NOT work until real credentials are set.');
    } else {
      // No credentials at all — initialize a stub so imports don't crash at build time
      admin.initializeApp({ projectId: 'placeholder-project' });
      console.warn('[firebase-admin] No valid credentials found. Running in stub mode — set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env.local');
    }
  } catch (error) {
    console.error('[firebase-admin] Initialization error:', error);
    // Ensure at least one app exists so .firestore()/.auth() calls don't throw a "no-app" error
    if (!admin.apps.length) {
      admin.initializeApp({ projectId: 'placeholder-project' });
    }
  }
}

initAdmin();

export const adminDb = admin.firestore();
try {
  adminDb.settings({ ignoreUndefinedProperties: true });
} catch (e) {
  // Settings can only be applied once, ignore if already applied
}

export const adminAuth = admin.auth();
export const Timestamp = admin.firestore.Timestamp;
export default admin;
