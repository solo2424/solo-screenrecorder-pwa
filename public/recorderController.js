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

                // Save the current drawing state
                ctx.save();

                // Create a rounded rectangle path for the webcam.
                ctx.beginPath();
                ctx.arc(window.webcamX + 16, window.webcamY + 16, 16, Math.PI, 1.5 * Math.PI);
                ctx.lineTo(window.webcamX + 304, window.webcamY);
                ctx.arc(window.webcamX + 304, window.webcamY + 16, 16, 1.5 * Math.PI, 2 * Math.PI);
                ctx.lineTo(window.webcamX + 320, window.webcamY + 164);
                ctx.arc(window.webcamX + 304, window.webcamY + 164, 16, 0, 0.5 * Math.PI);
                ctx.lineTo(window.webcamX + 16, window.webcamY + 180);
                ctx.arc(window.webcamX + 16, window.webcamY + 164, 16, 0.5 * Math.PI, Math.PI);
                ctx.closePath();
                ctx.clip();

                // Draw the webcam according to draggable webcam's position
                ctx.drawImage(webcamVideo, window.webcamX, window.webcamY, 320, 180);

                // Restore the drawing state, effectively removing the clipping region
                ctx.restore();

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
