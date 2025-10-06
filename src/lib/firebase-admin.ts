
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
        if (
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
        } else if (serviceAccountKey) {
          // Robustly decode service account from env:
          // - Handles base64 of JSON (preferred)
          // - Handles accidental double-base64 by re-decoding when detected
          // - Falls back to raw JSON string
          let serviceAccount: any;

          const looksLikeBase64 = (s: string) => /^[A-Za-z0-9+/=]+$/.test(s) && s.length % 4 === 0;
          const normalizeEscapes = (s: string) => s.replace(/\\(?!["\\\/bfnrtu])/g, '\\\\');

          const candidate = String(serviceAccountKey);
          // First attempt: decode base64
          try {
            const onceDecoded = Buffer.from(candidate, 'base64').toString('utf8');
            console.log('[firebase-admin] Decoded service account (base64 -> utf8). Length:', onceDecoded.length);
            // If the decoded result still looks like base64, decode one more time
            const maybeDoubleDecoded = looksLikeBase64(onceDecoded)
              ? Buffer.from(onceDecoded, 'base64').toString('utf8')
              : onceDecoded;
            if (maybeDoubleDecoded !== onceDecoded) {
              console.log('[firebase-admin] Detected double-base64; performed second decode. Length:', maybeDoubleDecoded.length);
            }
            serviceAccount = JSON.parse(normalizeEscapes(maybeDoubleDecoded));
            console.log('[firebase-admin] Parsed service account JSON successfully.');
          } catch {
            // Fallback: raw JSON parse
            console.warn('[firebase-admin] Base64 decode path failed. Falling back to raw JSON parse.');
            serviceAccount = JSON.parse(normalizeEscapes(candidate));
          }

          // Normalize private_key: supports PEM with escaped newlines or base64-encoded PEM
          let privateKey = String(serviceAccount.private_key || '');
          if (/BEGIN (RSA )?PRIVATE KEY/.test(privateKey)) {
            privateKey = privateKey.replace(/\\n/g, '\n');
          } else {
            try {
              privateKey = Buffer.from(privateKey, 'base64').toString('utf8');
            } catch {
              privateKey = privateKey.replace(/\\n/g, '\n');
            }
          }

          initializeApp({
            credential: cert({
              projectId: serviceAccount.project_id,
              clientEmail: serviceAccount.client_email,
              privateKey,
            }),
            projectId: serviceAccount.project_id,
          });
          console.log('[firebase-admin] Initialized app with service account (env key).');
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
