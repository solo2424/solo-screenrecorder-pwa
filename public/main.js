// public\main.js

import { auth, onAuthStateChanged } from './firebase.js';
import RecorderController from './recorderController.js';

// DOM elements
const newRecordingBtn = document.getElementById('new-recording');
const confirmOptionStartBtn = document.getElementById('confirmOptionStart');
const stopRecordingBtn = document.getElementById('stop-recording');
const previewEl = document.getElementById('preview');
const optionsOverlay = document.getElementById('optionsOverlay');
const previewContainer = document.getElementById('previewContainer');
const userNameSpans = document.querySelectorAll('.user-name'); // Use querySelectorAll to update all instances
const splashContainer = document.getElementById('splash-container');
const dashboardContainer = document.getElementById('dashboard-container');
const appContainer = document.getElementById('app-container');
const loginPopup = document.getElementById('loginPopup');
const sidebar = document.querySelector('.sidebar');
const controller = new RecorderController(previewEl);

// Listen for auth state changes and update UI
onAuthStateChanged(auth, (user) => {
    toggleUIBasedOnAuthState(user);
});

// Toggle UI elements based on user state
function toggleUIBasedOnAuthState(user) {
    if (user) {
        splashContainer.style.display = 'none';
        dashboardContainer.style.display = 'block';
        appContainer.style.display = 'block';
        loginPopup.classList.add('hidden');
        sidebar.style.display = 'block';
        userNameSpans.forEach(span => span.textContent = user.displayName || 'User');
    } else {
        splashContainer.style.display = 'flex';
        dashboardContainer.style.display = 'none';
        appContainer.style.display = 'none';
        loginPopup.classList.remove('hidden');
        sidebar.style.display = 'block';
        userNameSpans.forEach(span => span.textContent = 'Guest');
    }
}
// Listen for auth state changes
listenForAuthChanges(toggleUIBasedOnAuthState);

// Handle recording option selection
function handleOptionSelection(buttons, optionType) {
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            buttons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            console.log(`${optionType} option selected: ${button.getAttribute('data-' + optionType)}`);
        });
    });
}

// Apply event listeners to option buttons
handleOptionSelection(videoOptionsButtons, 'video');
handleOptionSelection(audioOptionsButtons, 'audio');

// Function to get selected recording options
function getSelectedOptions() {
    const selectedVideoOption = document.querySelector('.option[data-video].selected')?.getAttribute('data-video');
    const selectedAudioOption = document.querySelector('.option[data-audio].selected')?.getAttribute('data-audio');
    return { video: selectedVideoOption, audio: selectedAudioOption };
}

// Event listeners for recording buttons
[newRecordingBtn, confirmOptionStartBtn].forEach(button => {
    button.addEventListener('click', () => {
        const isStarting = button === confirmOptionStartBtn;
        optionsOverlay.style.display = isStarting ? 'none' : 'block';
        previewContainer.style.display = isStarting ? 'block' : 'none';
        stopRecordingBtn.style.display = isStarting ? 'block' : 'none';
        newRecordingBtn.style.display = isStarting ? 'none' : 'block';

        if (isStarting) {
            const selectedOptions = getSelectedOptions();
            console.log('Starting recording with selected options:', selectedOptions);
            controller.startRecording(selectedOptions);
        } else {
            console.log('New recording setup initiated.');
        }
    });
});

// Event listener for stop recording button
stopRecordingBtn.addEventListener('click', () => {
    console.log('Stop recording button clicked');
    controller.stopRecording();
    newRecordingBtn.style.display = 'block'; // Show the new recording button after stopping the recording
});
