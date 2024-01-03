// public\splashScreen.js

document.addEventListener('DOMContentLoaded', () => {
    const startFreeBtn = document.getElementById('start-free');
    const splashContainer = document.getElementById('splash-container');
    const loginPopup = document.getElementById('loginPopup');
    const continueAsGuestBtnPopup = document.getElementById('continue-as-guest-popup');

    if (startFreeBtn && splashContainer && loginPopup && continueAsGuestBtnPopup) {
        startFreeBtn.addEventListener('click', () => {
            splashContainer.style.display = 'none';
            loginPopup.classList.remove('hidden');
        });

        continueAsGuestBtnPopup.addEventListener('click', () => {
            loginPopup.classList.add('hidden');
            splashContainer.style.display = 'block';
        });
    }
});
