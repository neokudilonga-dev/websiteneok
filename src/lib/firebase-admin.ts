
import * as admin from 'firebase-admin';

let app: admin.app.App | undefined;

function ensureInitialized() {
  console.log('[firebase-admin] ensureInitialized called.');
  if (!app) {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      console.error('[firebase-admin] ERROR: FIREBASE_SERVICE_ACCOUNT_KEY is not set.');
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set.');
    }
    try {
      console.log('[firebase-admin] Attempting to parse FIREBASE_SERVICE_ACCOUNT_KEY.');
      const rawServiceAccount = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString();
      console.log('[firebase-admin] Raw Service Account String:', rawServiceAccount);
      const serviceAccount = JSON.parse(rawServiceAccount);
      // Correctly handle the private_key by replacing escaped newlines
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      console.log('[firebase-admin] Private Key before credential.cert:', serviceAccount.private_key);
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('[firebase-admin] Firebase Admin SDK initialized successfully.');
    } catch (error) {
      console.error('[firebase-admin] ERROR: Failed to initialize Firebase Admin SDK:', error);
      throw error;
    }
  }
}

ensureInitialized();

const firestore = admin.firestore();
const auth = admin.auth();

export { firestore, auth };
