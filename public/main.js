// public\main.js

import {
    auth,
    onAuthStateChanged,
    updateUIOnAuthStateChange,
} from './firebase.js';
import RecorderController from './recorderController.js';
import { loadAndDisplayRecordings, setDefaultViewToThumbnails,} from './dashboard.js';

// import { loadDisplayCallback } from './recorderController.js';

// DOM elements
const newRecordingBtn = document.getElementById('new-recording');
const confirmOptionStartBtn = document.getElementById('confirmOptionStart');
const stopRecordingBtn = document.getElementById('stop-recording');
const previewEl = document.getElementById('preview');
const optionsOverlay = document.getElementById('optionsOverlay');
const previewContainer = document.getElementById('previewContainer');
const dashboardContainer = document.getElementById('dashboardContainer');
const videoOptionsButtons = document.querySelectorAll('.option[data-video]');
const audioOptionsButtons = document.querySelectorAll('.option[data-audio]');

// Initialize RecorderController
const controller = new RecorderController(previewEl, loadAndDisplayRecordings);

// Set the default view to thumbnails when the app initializes
setDefaultViewToThumbnails();

// Selected options
let selectedVideoOption = 'only-screen'; // Default value
let selectedAudioOption = 'none';        // Default value


// Event listener for auth state changes to handle user sign-in and sign-out
onAuthStateChanged(auth, (user) => {
    updateUIOnAuthStateChange(user);
    if (user) {
        console.log('User signed in:', user.uid);
        handleDashboardVisibilityChange(); // Refresh recordings
        dashboardContainer.style.display = 'block'; // Show the dashboard container
        setDefaultViewToThumbnails();
        loadAndDisplayRecordings(user.uid);
    } else {
        console.log('User signed out');
        dashboardContainer.style.display = 'none'; // Hide the dashboard container
    }
});


function handleDashboardVisibilityChange() {
    if (dashboardContainer.style.display === 'block') {
        const user = auth.currentUser;
        if (user) {
            console.log('Dashboard is visible. Fetching latest recordings for user:', user.uid);
            loadAndDisplayRecordings(user.uid);
        }
    }
}


/////////////////// Recording Options ////////////////////


// Handle option selection
function handleOptionSelection(buttons, optionType) {
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            buttons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            if (optionType === 'video') {
                selectedVideoOption = button.getAttribute('data-video');
            } else if (optionType === 'audio') {
                selectedAudioOption = button.getAttribute('data-audio');
            }
            console.log(`${optionType} option selected: ${button.getAttribute('data-' + optionType)}`);
        });
    });
}

// Apply event listeners to option buttons
handleOptionSelection(videoOptionsButtons, 'video');
handleOptionSelection(audioOptionsButtons, 'audio');

// Event listener for "New Recording" button
newRecordingBtn.addEventListener('click', () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
        optionsOverlay.style.display = 'block';
        previewContainer.style.display = 'none';
        dashboardContainer.style.display = 'none'; // Hide dashboard during recording setup
        stopRecordingBtn.style.display = 'none';
        recordingContainer.style.display = 'none';
        console.log('New recording setup initiated for user:', currentUser.uid);
    } else {
        console.error('No authenticated user found');
    }
});

// Event listener for "Confirm Option Start" button
confirmOptionStartBtn.addEventListener('click', () => {
    // Hide options overlay and dashboard
    optionsOverlay.style.display = 'none';
    dashboardContainer.style.display = 'none';

    // Start recording with selected options
    controller.startRecording({
        video: selectedVideoOption,
        audio: selectedAudioOption
    });

    // Make previewContainer and stopRecordingBtn visible
    previewContainer.style.display = 'block';
    stopRecordingBtn.style.display = 'block';
    newRecordingBtn.style.display = 'none';
    dashboardContainer.style.display = 'none';

    console.log('Recording started with options:', {
        video: selectedVideoOption,
        audio: selectedAudioOption
    });
});

// Event listener for the "Stop Recording" button
stopRecordingBtn.addEventListener('click', async () => {
    console.log('Stop recording button clicked');

    await controller.stopRecording(); // Stops the recording and handles the uploading

    // After recording has stopped, check if the user is logged in
    const currentUser = auth.currentUser;
    if (currentUser) {
        // Refresh the dashboard with the latest recordings
        console.log('Refreshing the dashboard for user:', currentUser.uid);
        await loadAndDisplayRecordings(currentUser.uid);
    }

    // Update UI to reflect the end of recording
    previewContainer.style.display = 'none';
    newRecordingBtn.style.display = 'block';
    dashboardContainer.style.display = 'block';
});

