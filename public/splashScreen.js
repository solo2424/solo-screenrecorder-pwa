// public\splashScreen.js

// Script to handle splash screen actions
document.addEventListener('DOMContentLoaded', () => {
    const startFreeBtn = document.getElementById('start-free');
    const splashContainer = document.getElementById('splash-container');
    const loginPopup = document.getElementById('loginPopup');
    const continueAsGuestBtnPopup = document.getElementById('continue-as-guest-popup');
    const dashboardContainer = document.getElementById('dashboard-container');
    const appContainer = document.getElementById('app-container');
    const sidebar = document.querySelector('.sidebar');
    // Add any other containers that need to be hidden

    // Function to toggle visibility of containers
    function toggleContainers(display) {
        dashboardContainer.style.display = display;
        appContainer.style.display = display;
        sidebarContainer.style.display = display;
        // Set the display property for any other containers
    }

    if (startFreeBtn && splashContainer && loginPopup && continueAsGuestBtnPopup) {
        startFreeBtn.addEventListener('click', () => {
            splashContainer.style.display = 'none';
            loginPopup.classList.remove('hidden');
            sidebar.style.display = 'none'; // Hide the sidebar
            toggleContainers('none'); // Hide other containers
        });

        continueAsGuestBtnPopup.addEventListener('click', () => {
            loginPopup.classList.add('hidden');
            splashContainer.style.display = 'block';
            sidebar.style.display = 'none'; // Hide the sidebar
            toggleContainers('block'); // Show other containers
        });
    }

    
    window.showLoginPopup = function () {
        const splashContainer = document.getElementById('splash-container');
        const loginPopup = document.getElementById('loginPopup');

        if (splashContainer && loginPopup) {
            splashContainer.style.display = 'none';
            loginPopup.style.display = 'block'; // Change to display the loginPopup
        } else {
            console.error('Splash container or login popup not found');
        }
    };
});

