// Import modules
import RecorderController from './recorderController.js';
import { saveAs } from './fileSaver.js';

// DOMContentLoaded event handler
document.addEventListener('DOMContentLoaded', () => {
    // Initialize controller
    const controller = new RecorderController();

    // Initialize dragging variables
    let isDragging = false;
    let offsetX, offsetY;

    // Initialize elements
    const draggableWebcam = document.getElementById('draggable-webcam');
    const videoContainer = document.getElementById('preview-container');
    const webcamPreview = document.getElementById('webcam-preview');

    // Log the initial status of elements
    console.log(`Initial status - draggableWebcam: ${draggableWebcam.offsetWidth}x${draggableWebcam.offsetHeight}`);
    console.log(`Initial status - videoContainer: ${videoContainer.offsetWidth}x${videoContainer.offsetHeight}`);

    // Setup dragging functionality
    draggableWebcam.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - draggableWebcam.getBoundingClientRect().left;
        offsetY = e.clientY - draggableWebcam.getBoundingClientRect().top;
    });

    // Declare these variables at the top-level
    window.webcamX = 0;
    window.webcamY = 0;

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        let leftPosition = e.clientX - offsetX;
        let topPosition = e.clientY - offsetY;

        const maxLeftPosition = videoContainer.offsetWidth - draggableWebcam.offsetWidth;
        const maxTopPosition = videoContainer.offsetHeight - draggableWebcam.offsetHeight;

        // Log the calculated maximum positions
        console.log(`Calculated Max Left: ${maxLeftPosition}`);
        console.log(`Calculated Max Top: ${maxTopPosition}`);

        // Restrict movement within the video-container
        if (leftPosition < 0) leftPosition = 0;
        if (leftPosition > maxLeftPosition) leftPosition = maxLeftPosition;
        if (topPosition < 0) topPosition = 0;
        if (topPosition > maxTopPosition) topPosition = maxTopPosition;

        draggableWebcam.style.left = leftPosition + 'px';
        draggableWebcam.style.top = topPosition + 'px';

        // Update webcam position on canvas
        window.webcamX = leftPosition;
        window.webcamY = topPosition;
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    draggableWebcam.addEventListener('dragstart', (e) => {
        e.preventDefault();
    });

    // Start recording handler
    document.getElementById('start').addEventListener('click', async () => {
        try {
            console.log('Starting recording...');
            await controller.startRecording();
            webcamPreview.srcObject = controller.webcamStream;  // Set the webcam video
            console.log('Recording started');
        } catch (error) {
            console.error('Error starting recording:', error);
        }
    });

    // Stop recording handler
    document.getElementById('stop').addEventListener('click', async () => {
        try {
            console.log('Stopping recording...');
            const blob = await controller.stopRecording();
            console.log('Blob from recording:', blob);
            if (!blob) {
                console.error('Invalid blob, saving recording failed');
                return;
            }
            saveAs(blob, 'recording.webm');
            console.log('Recording stopped and file saved');
        } catch (error) {
            console.error('Error stopping recording:', error);
        }
    });
});
