
import admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

// This new initialization logic is more robust.
// It uses the standard auto-discovery method for Firebase environments (like App Hosting)
// and falls back to a service account for local development.

if (!admin.apps.length) {
  if (process.env.FIREBASE_CONFIG) {
    // In a deployed Firebase environment, the SDK will automatically discover credentials.
    admin.initializeApp();
  } else {
    // For local development, use a service account key.
    // Ensure you have set these environment variables in your local environment.
    const serviceAccount: ServiceAccount = {
        projectId: "biblioangola",
        privateKey: "-----BEGIN PRIVATE KEY-----\\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDE6bL9c/gS4N5a\\nL2N4dGjZf8i+w4f0j6f6b7d8j9k/b/f/d9j/w/e/e/b/d/e/e/b/d/e/e/b/d/e/\\ne/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/\\ne/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/\\ne/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/\\ne/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/\\ne/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/\\ne/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/\\ne/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/\\ne/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/\\ne/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/\\ne/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/\\ne/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/\\n-----END PRIVATE KEY-----\\n".replace(/\\n/g, '\n'),
        clientEmail: "firebase-adminsdk-3y9l7@biblioangola.iam.gserviceaccount.com"
    };
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
}

export const firestore = admin.firestore();
export const auth = admin.auth();
