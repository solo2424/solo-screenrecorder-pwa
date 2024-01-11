// public\login.js


import {
    auth,
    db,
    doc,
    setDoc,
    signInWithPopup,
    GoogleAuthProvider
} from './firebase.js';

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

// Function to handle Google sign-in
async function handleGoogleSignIn() {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        await saveUserData(result.user); // Save user data to Firestore
        hideLoginPopup(); // Hide the login popup
        console.log('Google Sign-In successful.');
    } catch (error) {
        console.error('Google Sign-In error:', error);
    }
}

// Function to hide the login popup
function hideLoginPopup() {
    const loginPopup = document.getElementById('loginPopup');
    if (loginPopup) {
        loginPopup.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const googleSignInButton = document.getElementById('googleSignIn');
    googleSignInButton?.addEventListener('click', handleGoogleSignIn);

    // Hide loginPopup when any button inside it is clicked
    const loginPopupButtons = document.querySelectorAll('#loginPopup button');
    loginPopupButtons.forEach(button => {
        button.addEventListener('click', hideLoginPopup);
    });
});
