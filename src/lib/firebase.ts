import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBnTpglZ_7KnlZxDb30aRKMikHBzb6rzF4",
    authDomain: "biblioangola.firebaseapp.com",
    projectId: "biblioangola",
    storageBucket: "biblioangola.appspot.com",
    messagingSenderId: "965265307414",
    appId: "1:965265307414:web:c32050e53982f9d8f70237",
    measurementId: "G-31QQ4L2L27",
};

// Ensure Firebase App is initialized only once (avoids app/duplicate-app errors)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);
const storage = getStorage(app);
const db = getFirestore(app);

// Set custom metadata for CORS
const storageCustomMetadata = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
};

async function deleteImageFromFirebase(imageUrl: string) {
    if (!imageUrl || !imageUrl.includes("firebasestorage.googleapis.com")) {
        console.warn("Invalid Firebase Storage URL, skipping deletion:", imageUrl);
        return;
    }

    try {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
        console.log("Image deleted successfully from Firebase Storage:", imageUrl);
    } catch (error: any) {
        console.error("Error deleting image from Firebase Storage:", imageUrl, error);
        // Handle cases where the file might not exist, or other errors
        if (error.code === 'storage/object-not-found') {
            console.warn("Image not found in Firebase Storage, might have been deleted already:", imageUrl);
        } else {
            throw error; // Re-throw other unexpected errors
        }
    }
}

export { app, auth, storage, db, storageCustomMetadata, deleteImageFromFirebase };
