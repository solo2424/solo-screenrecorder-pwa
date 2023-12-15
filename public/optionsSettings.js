// public/optionsSettings.js

// Video options
const screenOnlyButton = document.querySelector('[data-video="only-screen"]');
const screenCameraButton = document.querySelector('[data-video="screen-camera"]');
const onlyCameraButton = document.querySelector('[data-video="only-camera"]');

// Audio options
const noneButton = document.querySelector('[data-audio="none"]');
const microphoneButton = document.querySelector('[data-audio="microphone"]');
const systemButton = document.querySelector('[data-audio="system"]');
const systemMicButton = document.querySelector('[data-audio="system-mic"]');

// Confirm options
const confirmOptionsButton = document.getElementById('confirmOptions');
const optionsOverlay = document.getElementById('optionsOverlay');

const webcamPreview = document.getElementById('webcam-preview');
const videoContainer = document.getElementById('video-container');

let videoOptions = 'only-camera'; // Default video option

// Function to show webcam preview and hide screen recording elements
const showWebcamPreview = () => {
    webcamPreview.style.display = 'block';
    videoContainer.style.display = 'none';
    videoOptions = 'only-camera';
};

// Function to show screen recording elements and hide webcam preview
const showScreenRecording = () => {
    webcamPreview.style.display = 'none';
    videoContainer.style.display = 'block';
    videoOptions = 'only-screen';
};

// Event listeners for video options
screenOnlyButton.addEventListener('click', () => {
    // Logic for "Screen Only" option
    showScreenRecording();
});

screenCameraButton.addEventListener('click', () => {
    // Logic for "Screen + Camera" option
    showScreenRecording();
});

onlyCameraButton.addEventListener('click', () => {
    // Logic for "Only Camera" option
    showWebcamPreview();
});

// Event listeners for audio options
noneButton.addEventListener('click', () => {
    // Logic for "None" option
    // Handle audio recording settings
});

microphoneButton.addEventListener('click', () => {
    // Logic for "Microphone" option
    // Handle audio recording settings
});

systemButton.addEventListener('click', () => {
    // Logic for "System" option
    // Handle audio recording settings
});

systemMicButton.addEventListener('click', () => {
    // Logic for "System + Mic" option
    // Handle audio recording settings
});

// Event listener for confirm options
confirmOptionsButton.addEventListener('click', () => {
    // Logic for confirming options
    optionsOverlay.style.display = 'none'; // Hide the options overlay

    // Start recording based on the selected video option
    recorderController.startRecording(videoOptions);
});
