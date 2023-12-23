// public\dashboard.js

import { auth } from './firebase.js';


document.addEventListener('DOMContentLoaded', () => {
    // Define the elements
    const dashboardContainer = document.getElementById('dashboard-container');
    const userNameDisplay = document.getElementById('user-name');
    const newRecordingButton = document.getElementById('new-recording');

    // Check for user authentication status
    auth.onAuthStateChanged((user) => {
        if (user && dashboardContainer && userNameDisplay) {
            dashboardContainer.classList.remove('hidden');
            userNameDisplay.textContent = user.displayName || user.email;
            document.getElementById('splash-container').style.display = 'none';
            document.getElementById('loginPopup').style.display = 'none';
            document.getElementById('app-container').style.display = 'block';
        } else if (dashboardContainer) {
            dashboardContainer.classList.add('hidden');
            document.getElementById('splash-container').style.display = 'block';
            document.getElementById('loginPopup').style.display = 'flex';
        }
    });

    // Add event listener to the new recording button if it exists
    if (newRecordingButton) {
        newRecordingButton.addEventListener('click', () => {
            console.log('New recording started.');
        });
    }
});
