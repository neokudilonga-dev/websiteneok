
import 'server-only';

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let auth: ReturnType<typeof getAuth>;
let firestore: ReturnType<typeof getFirestore>;

// Initialize Firebase Admin SDK only in server environments
if (typeof window === 'undefined' && (process.env.NEXT_RUNTIME === 'nodejs' || process.env.NEXT_RUNTIME === 'edge')) {
  if (!getApps().length) {
    console.log('[firebase-admin] Initializing Firebase Admin SDK...');
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountKey) {
      throw new Error("The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.");
    }
    
    // Parse the service account key string into a JSON object
    const serviceAccount = JSON.parse(serviceAccountKey);
    
    initializeApp({
      credential: cert(serviceAccount),
    });
    
    console.log('[firebase-admin] Firebase Admin SDK initialized successfully.');
  }
  auth = getAuth();
  firestore = getFirestore();
} else {
  // Provide mock objects for client-side or non-server environments
  auth = {} as ReturnType<typeof getAuth>;
  firestore = {} as ReturnType<typeof getFirestore>;
}

export { auth, firestore };
