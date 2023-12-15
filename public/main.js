// public/main.js

// Import modules 
import RecorderController from './recorderController.js';
import { saveAs } from './fileSaver.js';

// DOM elements  
const startBtn = document.getElementById('start');
const stopBtn = document.getElementById('stop');
const optionsOverlay = document.getElementById('optionsOverlay');
const confirmBtn = document.getElementById('confirmOptions');
const videoOptions = document.querySelectorAll('.option');

// State
let isRecording = false;

// Initialize 
const controller = new RecorderController();

// Video options
videoOptions.forEach(option => {
    option.addEventListener('click', () => {
        videoOptions.forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');
    });
});

// Start recording 
startBtn.addEventListener('click', () => {
    optionsOverlay.style.display = 'flex';
});

// Confirm options
confirmBtn.addEventListener('click', async () => {

    // Get selected video option
    const selectedOption = document.querySelector('.option.selected');
    console.log(selectedOption);

    if (!selectedOption) {
        console.log('No video option selected');
        return;
    }

    const videoOption = selectedOption.dataset.video;
    console.log(videoOption);

    try {
        await controller.startRecording(videoOption);
        isRecording = true;

    } catch (error) {
        console.error(error);
    }

    optionsOverlay.style.display = 'none';
});

// Stop recording
stopBtn.addEventListener('click', async () => {

    if (!isRecording) {
        return;
    }

    try {

        const blob = await controller.stopRecording();
        console.log('Stopped recording, blob: ', blob);

        if (blob) {
            saveAs(blob, 'recording.webm');
        } else {
            console.log('Empty blob');
        }

        isRecording = false;

    } catch (error) {
        console.error(error);
    }

});