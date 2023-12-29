// public\dragVideo.js

let isDragging = false;
let offsetX, offsetY;

const draggableWebcam = document.getElementById('draggable-webcam');
const videoContainer = document.getElementById('preview-container'); // Changed to preview-container

draggableWebcam.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - draggableWebcam.getBoundingClientRect().left;
    offsetY = e.clientY - draggableWebcam.getBoundingClientRect().top;
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    let leftPosition = e.clientX - offsetX;
    let topPosition = e.clientY - offsetY;

    // Restrict movement within the video-container
    if (leftPosition < 0) {
        leftPosition = 0;
    }
    if (leftPosition + draggableWebcam.offsetWidth > videoContainer.offsetWidth) {
        leftPosition = videoContainer.offsetWidth - draggableWebcam.offsetWidth;
    }
    if (topPosition < 0) {
        topPosition = 0;
    }
    if (topPosition + draggableWebcam.offsetHeight > videoContainer.offsetHeight) {
        topPosition = videoContainer.offsetHeight - draggableWebcam.offsetHeight;
    }

    draggableWebcam.style.left = leftPosition + 'px';
    draggableWebcam.style.top = topPosition + 'px';
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

// Prevents the default drag image from appearing
draggableWebcam.addEventListener('dragstart', (e) => {
    e.preventDefault();
});


// public/recorderController.js

export default class RecorderController {
    constructor() {
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.screenStream = null;
        this.webcamStream = null;
    }

    async startRecording() {
        try {
            console.log('Starting recording...');

            // High-quality video constraints
            const screenConstraints = {
                video: { width: 1280, height: 720 }
            };
            const webcamConstraints = {
                video: { width: 640, height: 360 }
            };

            this.screenStream = await navigator.mediaDevices.getDisplayMedia(screenConstraints);
            this.webcamStream = await navigator.mediaDevices.getUserMedia(webcamConstraints);

            const canvas = document.createElement('canvas');
            canvas.width = 1280;
            canvas.height = 720;
            const ctx = canvas.getContext('2d');

            const screenVideo = document.createElement('video');
            screenVideo.srcObject = this.screenStream;
            await screenVideo.play();

            const webcamVideo = document.createElement('video');
            webcamVideo.srcObject = this.webcamStream;
            await webcamVideo.play();

            // Initialize these variables at the top-level as null
            window.webcamX = null;
            window.webcamY = null;

            // ... (other code)

            const drawVideos = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);

                // Draw the webcam according to draggable webcam's position only if webcamX and webcamY are not null
                if (window.webcamX !== null && window.webcamY !== null) {
                    ctx.drawImage(webcamVideo, window.webcamX, window.webcamY, 320, 240); // Use window.webcamX and window.webcamY
                }

                requestAnimationFrame(drawVideos);
            };

            drawVideos();

            const canvasStream = canvas.captureStream(30);

            // MediaRecorder configuration for better compatibility
            const options = { mimeType: 'video/webm; codecs=vp9' };
            this.mediaRecorder = new MediaRecorder(canvasStream, options);

            this.mediaRecorder.ondataavailable = (e) => this.recordedChunks.push(e.data);
            this.mediaRecorder.onstop = () => console.log('Recording stopped');

            this.mediaRecorder.start();

            document.querySelector('#preview').srcObject = canvasStream;

            console.log('Recording started');
        } catch (error) {
            console.error('Error starting recording:', error);
            throw error;
        }
    }

    async stopRecording() {
        return new Promise((resolve, reject) => {
            console.log('stopRecording() called');

            if (!this.mediaRecorder) {
                console.error('MediaRecorder is not defined');
                reject('MediaRecorder is not defined');
                return;
            }

            console.log('Stopping media recorder...');
            this.mediaRecorder.stop();
            console.log('Media recorder stopped');

            console.log('Waiting for onstop handler...');
            this.mediaRecorder.onstop = () => {
                console.log('onstop handler triggered');

                const blob = new Blob(this.recordedChunks, { type: 'video/webm' });

                this.screenStream.getTracks().forEach((track) => track.stop());
                this.webcamStream.getTracks().forEach((track) => track.stop());
                console.log('Media streams stopped');

                resolve(blob);
            };
        });
    }
}
