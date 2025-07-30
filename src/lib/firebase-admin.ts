
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// When running in a Firebase environment (like App Hosting), the SDK will
// automatically discover the necessary credentials. For local development,
// you would typically use a service account file.
// Since we are moving initialization to the API routes to catch errors,
// this file can be simplified or used only for non-API route server-side logic.
if (!getApps().length) {
    console.log('[firebase-admin] Initializing Firebase Admin SDK in lib...');
    try {
        // This will work in a deployed App Hosting environment.
        // For local development, it requires GOOGLE_APPLICATION_CREDENTIALS to be set.
        initializeApp();
        console.log('[firebase-admin] Firebase Admin SDK initialized successfully in lib.');
    } catch(error: any) {
        console.error('[firebase-admin] CRITICAL: Error initializing Firebase Admin SDK in lib:', {
            message: error?.message,
            code: error?.code,
            name: error?.name,
        });
        // We don't throw an error here to allow the application to start,
        // but API routes that depend on an initialized app will fail.
    }
} else {
    console.log('[firebase-admin] Firebase Admin SDK already initialized in lib.');
}

// Exporting the services will now throw an error if the app isn't initialized.
// It's safer to get the services only after ensuring initialization.
let auth: ReturnType<typeof getAuth>;
let firestore: ReturnType<typeof getFirestore>;

try {
    auth = getAuth();
    firestore = getFirestore();
} catch (error) {
    console.error('[firebase-admin] Failed to get services. App might not be initialized.');
    // @ts-ignore
    auth = {};
    // @ts-ignore
    firestore = {};
}

export { auth, firestore };
