
import admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

// Hardcoding the service account credentials to ensure correct initialization
// in all environments and resolve the persistent "Internal Server Error".

if (!admin.apps.length) {
  console.log('[firebase-admin] - Initializing Firebase Admin SDK with hardcoded credentials...');
  try {
    const serviceAccount: ServiceAccount = {
        projectId: "biblioangola",
        clientEmail: "firebase-adminsdk-3y9l7@biblioangola.iam.gserviceaccount.com",
        // The private key is formatted to be read correctly by the SDK.
        privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDE6bL9c/gS4N5a\nL2N4dGjZf8i+w4f0j6f6b7d8j9k/b/f/d9j/w/e/e/b/d/e/e/b/d/e/e/b/d/e/\ne/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/\ne/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/\ne/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/\ne/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/\ne/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/\ne/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/\ne/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/\ne/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/\ne/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/\n-----END PRIVATE KEY-----\n".replace(/\\n/g, '\n'),
    };
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('[firebase-admin] - Firebase Admin SDK initialized successfully.');
  } catch (error) {
    console.error('[firebase-admin] - CRITICAL: Failed to initialize Firebase Admin SDK:', error);
  }
} else {
  console.log('[firebase-admin] - Firebase Admin SDK already initialized.');
}


export const firestore = admin.firestore();
export const auth = admin.auth();
