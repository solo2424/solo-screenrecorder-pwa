// Video option buttons
const screenOnlyButton = document.querySelector('[data-video="only-screen"]');
const screenCameraButton = document.querySelector('[data-video="screen-camera"]');
const onlyCameraButton = document.querySelector('[data-video="only-camera"]');

// Audio option buttons
const noneButton = document.querySelector('[data-audio="none"]');
const microphoneButton = document.querySelector('[data-audio="microphone"]');
const systemButton = document.querySelector('[data-audio="system"]');
const systemMicButton = document.querySelector('[data-audio="system-mic"]');

// Confirm options button and overlay
const confirmOptionsButton = document.getElementById('confirmOptions');
const optionsOverlay = document.getElementById('optionsOverlay');

// Setting default selected options
window.selectedAudioOption = 'none';
window.selectedVideoOption = 'only-camera';

// Helper function to log selected options
function logSelectedOptions() {
    console.log('Selected options:', {
        audio: window.selectedAudioOption,
        video: window.selectedVideoOption
    });
}

// Event listeners for video options
screenOnlyButton.addEventListener('click', () => {
    window.selectedVideoOption = 'only-screen';
    logSelectedOptions();
});

screenCameraButton.addEventListener('click', () => {
    window.selectedVideoOption = 'screen-camera';
    logSelectedOptions();
});

onlyCameraButton.addEventListener('click', () => {
    window.selectedVideoOption = 'only-camera';
    logSelectedOptions();
});

// Event listeners for audio options
noneButton.addEventListener('click', () => {
    window.selectedAudioOption = 'none';
    logSelectedOptions();
});

microphoneButton.addEventListener('click', () => {
    window.selectedAudioOption = 'microphone';
    logSelectedOptions();
});

systemButton.addEventListener('click', () => {
    window.selectedAudioOption = 'system';
    logSelectedOptions();
});

systemMicButton.addEventListener('click', () => {
    window.selectedAudioOption = 'system-mic';
    logSelectedOptions();
});


