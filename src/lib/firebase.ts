import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate required environment variables
const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
    throw new Error(`Missing required Firebase environment variables: ${missingEnvVars.join(', ')}`);
}

// Ensure Firebase App is initialized only once (avoids app/duplicate-app errors)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);
const storage = getStorage(app);
const db = getFirestore(app);

// For debugging purposes in development
if (typeof window !== 'undefined') {
    (window as any).firebaseStorage = storage;
}

// Note: CORS for Firebase Storage must be configured via Google Cloud Console or gsutil.
// See: https://firebase.google.com/docs/storage/web/download-files#cors_configuration

async function deleteImageFromFirebase(imageUrl: string) {
    if (!imageUrl || !imageUrl.includes("firebasestorage.googleapis.com")) {
        // Invalid Firebase Storage URL, skipping deletion
        return;
    }

    try {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
        // Image deleted successfully from Firebase Storage
    } catch (error: any) {
        console.error("Error deleting image from Firebase Storage:", imageUrl, error);
        // Handle cases where the file might not exist, or other errors
        if (error.code === 'storage/object-not-found') {
            // Image not found in Firebase Storage, might have been deleted already
        } else {
            throw error; // Re-throw other unexpected errors
        }
    }
}

export { app, auth, storage, db, deleteImageFromFirebase };
