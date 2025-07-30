
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// When running in a Firebase environment (like App Hosting), the SDK will
// automatically discover the necessary credentials. No need to manually
// configure with service account details.
if (!getApps().length) {
    console.log('[firebase-admin] Initializing Firebase Admin SDK...');
    try {
        initializeApp();
        console.log('[firebase-admin] Firebase Admin SDK initialized successfully.');
    } catch(error: any) {
        console.error('[firebase-admin] CRITICAL: Error initializing Firebase Admin SDK:', {
            message: error?.message,
            code: error?.code,
            name: error?.name,
        });
        // Throwing the error is important to prevent the app from running with a misconfigured SDK.
        throw new Error('Failed to initialize Firebase Admin SDK.');
    }
} else {
    console.log('[firebase-admin] Firebase Admin SDK already initialized.');
}

export const auth = getAuth();
export const firestore = getFirestore();
