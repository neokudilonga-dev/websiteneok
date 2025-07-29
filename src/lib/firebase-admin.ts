import admin from 'firebase-admin';

// Check if the app is already initialized to prevent errors in development environments
// where the module might be re-loaded.
if (!admin.apps.length) {
  admin.initializeApp();
}

export const firestore = admin.firestore();
export const auth = admin.auth();
