
import 'server-only';

import { initializeApp, getApps, cert, applicationDefault } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Service account from environment variables
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID || 'biblioangola',
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@biblioangola.iam.gserviceaccount.com',
  privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
};

let _auth: Auth | null = null;
let _firestore: Firestore | null = null;
let _initialized = false;

function ensureInitialized() {
  if (_initialized) return;
  
  try {
    if (!getApps().length) {
      console.log('[firebase-admin] Initializing with hardcoded service account');
      initializeApp({
        credential: cert(serviceAccount as any),
        projectId: serviceAccount.projectId,
      });
      console.log('[firebase-admin] Firebase Admin initialized successfully');
    }
    
    if (getApps().length > 0) {
      _auth = getAuth();
      _firestore = getFirestore();
      _initialized = true;
      console.log('[firebase-admin] Auth and Firestore services initialized');
    }
  } catch (error) {
    console.error('[firebase-admin] Initialization error (non-fatal for build):', error);
    // Don't throw during build - let it fail at runtime if needed
  }
}

// Initialize immediately
try {
  ensureInitialized();
} catch (error) {
  console.error('[firebase-admin] Fatal initialization error:', error);
}

// Export with non-null type assertions - these will throw at runtime if not initialized
export const auth = _auth as unknown as Auth;
export const firestore = _firestore as unknown as Firestore;
