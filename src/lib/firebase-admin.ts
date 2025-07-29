
import admin from 'firebase-admin';

// Check if the app is already initialized to prevent errors
if (!admin.apps.length) {
  // When deployed to App Hosting, the SDK will automatically discover the
  // necessary credentials and configuration.
  admin.initializeApp();
}

export const firestore = admin.firestore();
export const auth = admin.auth();
