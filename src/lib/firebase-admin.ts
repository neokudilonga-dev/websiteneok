import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    // Explicitly initialize with the project ID for App Hosting environment
    admin.initializeApp({
      projectId: process.env.GCP_PROJECT,
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export const firestore = admin.firestore();
