// public/login.js


import {
    auth,
    db,
    doc,
    setDoc,
    getDoc,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged
} from './firebase.js';

import { toggleUIBasedOnAuthState } from './main.js';


// Function to save user data to Firestore
async function saveUserData(user) {
    const userRef = doc(db, 'users', user.uid);
    const userProfile = {
        firstName: user.displayName ? user.displayName.split(' ')[0] : '',
        lastName: user.displayName ? user.displayName.split(' ').slice(1).join(' ') : '',
        email: user.email,
        profileImage: user.photoURL || 'default_profile_image_url'
    };
    try {
        await setDoc(userRef, userProfile, { merge: true });
        console.log('User data saved to Firestore:', userProfile);
    } catch (error) {
        console.error('Error saving user data to Firestore:', error);
    }
}

// Listen for auth state changes
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log('User signed in:', user);
        await saveUserData(user);
    } else {
        console.log('No user is signed in.');
    }
});

// Function to handle Google sign-in
async function handleGoogleSignIn() {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        // Update the UI based on the authenticated user
        toggleUIBasedOnAuthState(result.user);
        console.log('Google Sign-In successful.');
    } catch (error) {
        console.error('Google Sign-In error:', error);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const googleSignInButton = document.getElementById('googleSignIn');
    googleSignInButton?.addEventListener('click', handleGoogleSignIn);
});
