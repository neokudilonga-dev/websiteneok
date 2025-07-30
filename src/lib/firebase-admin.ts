
import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// This initialization is for non-auth server-side logic (e.g., fetching data in server components).
// It relies on Application Default Credentials, which is standard for App Hosting.
// Auth-related API routes now handle their own specific initialization to prevent conflicts.

if (!getApps().some(app => app.name === 'default')) {
    console.log('[firebase-admin] Initializing default Firebase Admin SDK in lib...');
    try {
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

const app = getApps().length > 0 ? getApp('default') : null;

// The auth instance from here should NOT be used for session login, as that requires specific credentials.
const auth = app ? getAuth(app) : ({} as ReturnType<typeof getAuth>);
const firestore = app ? getFirestore(app) : ({} as ReturnType<typeof getFirestore>);


export { auth, firestore };

    