import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: 'AIzaSyBnTpglZ_7KnlZxDb30aRKMikHBzb6rzF4',
    authDomain: 'biblioangola.firebaseapp.com',
    projectId: 'biblioangola',
    storageBucket: 'biblioangola.firebasestorage.app',
    messagingSenderId: '965265307414',
    appId: '1:965265307414:web:c32050e53982f9d8f70237',
    measurementId: 'G-31QQ4L2L27',
};

// Firebase is initialized with hardcoded config for development
console.log('Firebase initialized with hardcoded configuration for development');
console.log('Firebase config:', firebaseConfig);

// For debugging purposes in development
if (typeof window !== 'undefined') {
  console.log('[firebase-client] Running in browser environment');
  console.log('[firebase-client] Firebase app initialized:', !!getApps().length);
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
