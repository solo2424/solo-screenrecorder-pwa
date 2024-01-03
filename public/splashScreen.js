// public\splashScreen.js

// Script to handle splash screen actions
console.log('Splash screen script loaded.');

document.addEventListener('DOMContentLoaded', () => {
    const startFreeBtn = document.getElementById('start-free');
    const splashContainer = document.getElementById('splash-container');
    const loginPopup = document.getElementById('loginPopup');
    const continueAsGuestBtnPopup = document.getElementById('continue-as-guest-popup');
    const appContainer = document.getElementById('app-container');

    startFreeBtn.addEventListener('click', () => {
        splashContainer.style.display = 'none'; // Hide the splash screen
        loginPopup.classList.remove('hidden');   // Show the login popup
    });

    continueAsGuestBtnPopup.addEventListener('click', () => {
        loginPopup.classList.add('hidden');  // Hide the login popup
        appContainer.style.display = 'block'; // Show the main app container
    });

    // Add other event listeners and logic as necessary
});

