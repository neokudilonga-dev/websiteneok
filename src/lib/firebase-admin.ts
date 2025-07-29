import admin from 'firebase-admin';

// Use a try-catch block to handle initialization safely.
// This prevents errors in development environments where the module might be re-loaded.
try {
  if (!admin.apps.length) {
    admin.initializeApp();
  }
} catch (error) {
  console.error('Firebase admin initialization error', error);
}

export const firestore = admin.firestore();
export const auth = admin.auth();
