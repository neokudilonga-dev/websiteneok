
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// When deployed to App Hosting, these env vars will be automatically populated.
// For local development, they need to be set in an .env.local file.
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // The private key must be a single line in the .env file, with \n for newlines.
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!getApps().length) {
    console.log('[firebase-admin] - Initializing Firebase Admin SDK...');
    try {
        initializeApp({
            credential: cert(serviceAccount),
        });
        console.log('[firebase-admin] - Firebase Admin SDK initialized successfully.');
    } catch(error: any) {
        console.error('[firebase-admin] - CRITICAL: Error initializing Firebase Admin SDK:', error);
    }
} else {
    console.log('[firebase-admin] - Firebase Admin SDK already initialized.');
}

export const auth = getAuth();
export const firestore = getFirestore();
