
import 'server-only';

import { initializeApp, getApps, cert, applicationDefault } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let _auth: Auth | null = null;
let _firestore: Firestore | null = null;

function ensureInitialized() {
  if (!_auth || !_firestore) {
    if (!getApps().length) {
      const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      try {
        if (serviceAccountKey) {
          const decodedKey = Buffer.from(serviceAccountKey, 'base64').toString('utf8');
          const serviceAccount = JSON.parse(decodedKey);
          console.log('[firebase-admin] Initializing with FIREBASE_SERVICE_ACCOUNT_KEY');
          initializeApp({
            credential: cert({
              projectId: serviceAccount.project_id,
              clientEmail: serviceAccount.client_email,
              privateKey: String(serviceAccount.private_key || '').replace(/\\n/g, '\n'),
            }),
            projectId: serviceAccount.project_id,
          });
        } else if (
          process.env.FIREBASE_PROJECT_ID &&
          process.env.FIREBASE_CLIENT_EMAIL &&
          process.env.FIREBASE_PRIVATE_KEY
        ) {
          console.log('[firebase-admin] Initializing with FIREBASE_* environment variables');
          initializeApp({
            credential: cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
              privateKey: String(process.env.FIREBASE_PRIVATE_KEY).replace(/\\n/g, '\n'),
            }),
            projectId: process.env.FIREBASE_PROJECT_ID,
          });
        } else {
          // Fallback to Application Default Credentials (ADC). Explicitly set projectId to avoid
          // environments where it cannot be inferred automatically.
          const projectId =
            process.env.FIREBASE_PROJECT_ID ||
            process.env.GOOGLE_CLOUD_PROJECT ||
            process.env.GCLOUD_PROJECT ||
            process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
            'biblioangola';
          console.log('[firebase-admin] Initializing with applicationDefault() credentials. projectId =', projectId);
          initializeApp({ credential: applicationDefault(), projectId });
        }
      } catch (error) {
        console.error('[firebase-admin] Initialization error:', error);
        throw error;
      }
    }
    _auth = getAuth();
    _firestore = getFirestore();
  }
}

export const auth = new Proxy({} as Auth, {
  get(_target, prop) {
    ensureInitialized();
    // @ts-expect-error: Proxy dynamic access to Auth methods/props
    return _auth![prop];
  },
});

export const firestore = new Proxy({} as Firestore, {
  get(_target, prop) {
    ensureInitialized();
    // @ts-expect-error: Proxy dynamic access to Firestore methods/props
    return _firestore![prop];
  },
});
