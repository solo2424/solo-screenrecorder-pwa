// public/navbar.js
import { auth, db, doc, getDoc } from './firebase.js';

async function updateUserProfileInfo() {
    if (!auth.currentUser) {
        console.log('No user is currently signed in.');
        return;
    }

    try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userProfile = await getDoc(userRef);

        if (userProfile.exists()) {
            const userData = userProfile.data();
            displayUserProfile(userData);
            console.log('User profile displayed:', userData);
        } else {
            console.log('User profile does not exist in Firestore.');
        }
    } catch (error) {
        console.error('Error retrieving user profile:', error);
    }
}


function attachNavbarListeners() {
    // Add listeners for profile image and sign-out link
    const profileImage = document.getElementById('navbarProfileImage');
    const signOutLink = document.querySelector('.navbar-profile-menu-item.sign-out');

    if (profileImage) {
        profileImage.addEventListener('click', toggleProfileMenu);
    }

    if (signOutLink) {
        signOutLink.addEventListener('click', signOutUser);
    }
}

function displayUserProfile(userData) {
    const profileImage = document.getElementById('profilePicture');
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');

    if (profileImage && userName && userEmail) {
        profileImage.src = userData.profileImage || 'images/soloVisionLogo.png';
        profileImage.style.display = 'block';
        userName.textContent = `${userData.firstName} ${userData.lastName}`;
        userEmail.textContent = userData.email;
    } else {
        console.error('Error: Required DOM elements not found for user profile display.');
    }
}


function toggleProfileMenu() {
    const profileMenu = document.getElementById('navbarProfileMenu');
    profileMenu.style.display = profileMenu.style.display === 'block' ? 'none' : 'block';
}

function signOutUser() {
    auth.signOut().then(() => {
        window.location.replace('/');
    }).catch(error => {
        console.error('Error signing out:', error);
    });
}

window.onclick = function (event) {
    if (!event.target.matches('.navbar-profile-image')) {
        var dropdowns = document.getElementsByClassName("navbar-profile-menu");
        for (var dropdown of dropdowns) {
            if (dropdown.style.display === 'block') {
                dropdown.style.display = 'none';
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load the navbar and attach listeners
        const navbarResponse = await fetch('navbar.html');
        const navbarText = await navbarResponse.text();
        document.getElementById('navbar-placeholder').innerHTML = navbarText;
        attachNavbarListeners();

        // Update the user profile info if a user is signed in
        const user = auth.currentUser;
        if (user) {
            console.log('Authenticated user:', user);
            await updateUserProfileInfo(user);
        }
    } catch (error) {
        console.error('Error during navbar initialization:', error);
    }

    updateUserProfileInfo();

    const profileImage = document.getElementById('navbarProfileImage');
    if (profileImage) {
        profileImage.addEventListener('click', toggleProfileMenu);
    }

    const signOutLink = document.querySelector('.navbar-profile-menu-item.sign-out');
    if (signOutLink) {
        signOutLink.addEventListener('click', signOutUser);
    }
});