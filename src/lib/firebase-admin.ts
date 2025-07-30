
import { initializeApp, getApps, cert, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// This file is now primarily for server-side logic outside of API routes.
// The main authentication API route handles its own initialization to ensure
// the correct credentials are used and to provide better error handling.

if (!getApps().length) {
    console.log('[firebase-admin] Initializing default Firebase Admin SDK in lib...');
    try {
        // This initialization will use Application Default Credentials.
        // It's used by server components and other API routes.
        initializeApp();
        console.log('[firebase-admin] Default Firebase Admin SDK initialized successfully in lib.');
    } catch(error: any) {
        console.error('[firebase-admin] CRITICAL: Error initializing default Firebase Admin SDK in lib:', {
            message: error?.message,
            code: error?.code,
            name: error?.name,
        });
    }
} else {
    console.log('[firebase-admin] Default Firebase Admin SDK already initialized in lib.');
}

const getDefaultApp = () => {
    // Ensure we don't crash if the app failed to initialize.
    return getApps().length > 0 ? getApp() : null;
}

const app = getDefaultApp();

const auth = app ? getAuth(app) : ({} as ReturnType<typeof getAuth>);
const firestore = app ? getFirestore(app) : ({} as ReturnType<typeof getFirestore>);


export { auth, firestore };
