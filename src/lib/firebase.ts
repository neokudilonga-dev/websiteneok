import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBnTpglZ_7KnlZxDb30aRKMikHBzb6rzF4",
    authDomain: "biblioangola.firebaseapp.com",
    projectId: "biblioangola",
    storageBucket: "biblioangola.firebasestorage.app",
    messagingSenderId: "965265307414",
    appId: "1:965265307414:web:c32050e53982f9d8f70237",
    measurementId: "G-31QQ4L2L27",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

// Set custom metadata for CORS
const storageCustomMetadata = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
};

export { app, auth, storage, storageCustomMetadata };
