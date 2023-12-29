// public\firebase.js


// Import the Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithPopup,
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDocs,
    collection,
    query
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase configuration for the current app
const firebaseConfig = {
    apiKey: "AIzaSyD3UKOn3QK-Lz7zoFQ0M09haqLBhcTM6O4",
    authDomain: "soloscreenrecord.firebaseapp.com",
    projectId: "soloscreenrecord",
    storageBucket: "soloscreenrecord.appspot.com",
    messagingSenderId: "20152278571",
    appId: "1:20152278571:web:5efcc44d226944c218546e",
    measurementId: "G-044X5DLD71"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase auth
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

// Exported function to listen for auth state changes
const listenForAuthChanges = (callback) => {
    onAuthStateChanged(auth, callback);
};

// Export functions
export {
    auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut,
    db,
    doc,
    setDoc,
    getDocs,
    collection,
    query,
    listenForAuthChanges
};
