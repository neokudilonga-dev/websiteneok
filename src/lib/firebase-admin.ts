
import admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

// Hardcoded service account details based on user-provided config
// In a real production app, these would be in secure environment variables
const serviceAccount: ServiceAccount = {
  projectId: "biblioangola",
  privateKey: "-----BEGIN PRIVATE KEY-----\\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDE6bL9c/gS4N5a\\nL2N4dGjZf8i+w4f0j6f6b7d8j9k/b/f/d9j/w/e/e/b/d/e/e/b/d/e/e/b/d/e/\\ne/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/\\ne/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/\\ne/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/\\ne/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/\\ne/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/\\ne/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/\\ne/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/\\ne/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/\\ne/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/\\ne/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/\\ne/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/e/b/d/e/\\n-----END PRIVATE KEY-----\\n".replace(/\\n/g, '\n'),
  clientEmail: "firebase-adminsdk-3y9l7@biblioangola.iam.gserviceaccount.com"
};


// Check if the app is already initialized to prevent errors
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

export const firestore = admin.firestore();
export const auth = admin.auth();
