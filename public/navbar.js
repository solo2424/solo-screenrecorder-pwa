// public/navbar.js
import { auth, db, doc, getDoc } from './firebase.js';

document.addEventListener('DOMContentLoaded', function () {
    // Fetch and display the navbar
    fetch('navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-placeholder').innerHTML = data;
            addNavbarEventListeners();
            updateUserProfileInfo();
        })
        .catch(error => console.error('Error loading the navbar:', error));
});

function addNavbarEventListeners() {
    // Add click event listener to profile image to toggle the profile menu
    const profileImage = document.getElementById('navbarProfileImage');
    profileImage.addEventListener('click', function () {
        var profileMenu = document.getElementById('navbarProfileMenu');
        profileMenu.style.display = profileMenu.style.display === 'block' ? 'none' : 'block';
    });

    // Add click event listener to sign out link
    const signOutLink = document.querySelector('.navbar-profile-menu-item.sign-out');
    signOutLink.addEventListener('click', function (event) {
        event.preventDefault();
        signOutUser();
    });
}

async function updateUserProfileInfo() {
    const user = auth.currentUser;
    if (user) {
        const userRef = doc(db, 'users', user.uid);
        try {
            const userProfile = await getDoc(userRef);
            if (userProfile.exists()) {
                const userData = userProfile.data();
                const profileImage = document.getElementById('navbarProfileImage');
                const userNameItem = document.createElement('a');
                userNameItem.className = 'navbar-profile-menu-item';
                userNameItem.textContent = `${userData.firstName} ${userData.lastName}`;
                const userEmailItem = document.createElement('a');
                userEmailItem.className = 'navbar-profile-menu-item';
                userEmailItem.textContent = userData.email;

                const profileMenu = document.getElementById('navbarProfileMenu');
                profileMenu.insertBefore(userEmailItem, profileMenu.firstChild);
                profileMenu.insertBefore(userNameItem, userEmailItem);
                profileMenu.insertBefore(document.createElement('hr'), userEmailItem);

                profileImage.src = userData.profileImage;
            }
        } catch (error) {
            console.error('Error retrieving user profile:', error);
        }
    }
}

function signOutUser() {
    auth.signOut().then(() => {
        console.log('User signed out');
        window.location.replace('/');
    }).catch((error) => {
        console.error('Error signing out:', error);
    });
}


// Close the dropdown if the user clicks outside of it
window.onclick = function (event) {
    if (!event.target.matches('.navbar-profile-image')) {
        var profileMenu = document.getElementById('navbarProfileMenu');
        if (profileMenu && profileMenu.style.display === 'block') {
            profileMenu.style.display = 'none';
        }
    }
};
