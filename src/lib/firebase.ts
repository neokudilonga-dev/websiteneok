import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBnTpglZ_7KnlZxDb30aRKMikHBzb6rzF4",
    authDomain: "biblioangola.firebaseapp.com",
    projectId: "biblioangola",
    storageBucket: "biblioangola.appspot.com",
    messagingSenderId: "965265307414",
    appId: "1:965265307414:web:c32050e53982f9d8f70237",
    measurementId: "G-31QQ4L2L27",
};

const app = initializeApp(firebaseConfig);
export { app };
