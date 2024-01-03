// public\main.js

import RecorderController from './recorderController.js';
import { loadAndDisplayRecordings, setDefaultViewToThumbnails,} from './dashboard.js';

// import { loadDisplayCallback } from './recorderController.js';

const startBtn = document.getElementById('start');
const stopBtn = document.getElementById('stop');
const optionsOverlay = document.getElementById('optionsOverlay');
const confirmBtn = document.getElementById('confirmOptions');
const allOptions = document.querySelectorAll('.option');
const draggableWebcam = document.getElementById('draggable-webcam');

let isRecording = false;
let selectedAudioOption = null;
let selectedVideoOption = null;
const controller = new RecorderController();

allOptions.forEach(option => {
    option.addEventListener('click', () => {
        if (option.dataset.audio) {
            if (selectedAudioOption) {
                selectedAudioOption.classList.remove('selected');
            }
            selectedAudioOption = option;
        } else if (option.dataset.video) {
            if (selectedVideoOption) {
                selectedVideoOption.classList.remove('selected');
            }
            selectedVideoOption = option;
        }
        option.classList.add('selected');
    });
});

startBtn.addEventListener('click', () => {
    optionsOverlay.style.display = 'flex';
});

confirmBtn.addEventListener('click', async () => {
    if (!selectedAudioOption || !selectedVideoOption) {
        console.error('Please select both an audio and a video option');
        return;
    }

    const audioOption = selectedAudioOption.dataset.audio;
    const videoOption = selectedVideoOption.dataset.video;

    try {
        // Pass the selected options to the startRecording method
        await controller.startRecording({ audio: audioOption, video: videoOption });
        isRecording = true;

        // Update the preview source and play it
        const previewElement = document.getElementById('preview');
        if (controller.canvas) {
            previewElement.srcObject = controller.canvas.captureStream(30);
            previewElement.play();
        } else {
            console.error('No canvas found for preview');
        }
    } catch (error) {
        console.error('Error during recording setup:', error);
    }
});

// Event listener for "Confirm Option Start" button
confirmOptionStartBtn.addEventListener('click', () => {
    // Hide options overlay and dashboard
    optionsOverlay.style.display = 'none';
});


stopBtn.addEventListener('click', async () => {
    if (!isRecording) {
        console.error('No recording in progress');
        return;
    }

    try {
        const blob = await controller.stopRecording();
        saveAs(blob, 'recording.webm'); // Save the recording here
        isRecording = false;
    } catch (error) {
        console.error('Error during recording stop:', error);
    }
});


// Draggable webcam logic
let isDragging = false;
let offsetX, offsetY;

draggableWebcam.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - draggableWebcam.getBoundingClientRect().left;
    offsetY = e.clientY - draggableWebcam.getBoundingClientRect().top;
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    let left = e.clientX - offsetX;
    let top = e.clientY - offsetY;

    draggableWebcam.style.left = `${left}px`;
    draggableWebcam.style.top = `${top}px`;

    window.webcamX = left;
    window.webcamY = top;
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});
