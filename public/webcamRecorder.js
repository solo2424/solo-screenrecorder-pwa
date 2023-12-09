// public/webcamRecorder.js

// This class is responsible for webcam recording.
export default class WebcamRecorder {

    // Constructor initializes the mediaRecorder, mediaStream, chunks, and onStop callback.
    constructor() {
        this.mediaRecorder = null;
        this.mediaStream = null;
        this.chunks = [];
        this.onStop = null; // New: To handle the stop event.
    }

    // This method starts the webcam recording.
    async startRecording() {
        console.log('Starting webcam recording...');

        // Webcam recording constraints.
        const constraints = {
            video: true,
            audio: false
        };

        try {
            // Get the media stream.
            this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

            // Initialize media recorder.
            this.mediaRecorder = new MediaRecorder(this.mediaStream);

            // On data available event.
            this.mediaRecorder.ondataavailable = event => {
                this.chunks.push(event.data);
            };

            // Handle the stop event.
            this.mediaRecorder.onstop = () => {
                if (this.onStop) {
                    this.onStop();
                }
            };

            // Start recording.
            this.mediaRecorder.start();
            console.log('Webcam recording started');

        } catch (error) {
            console.error('Error while starting webcam recording:', error);
            throw new Error('Could not start recording');
        }
    }

    // This method stops the webcam recording.
    async stopRecording() {
        console.log('Stopping webcam recording...');

        // Wrap in a Promise.
        return new Promise((resolve, reject) => {
            this.onStop = () => {
                try {
                    // Stop recording and create blob.
                    const blob = new Blob(this.chunks, { type: 'video/webm' });
                    this.chunks = [];
                    console.log('Webcam recording stopped');
                    resolve(blob); // Resolve the promise.

                } catch (error) {
                    console.error('Error while stopping webcam recording:', error);
                    reject(error); // Reject the promise.
                }
            };

            // Stop the media recorder.
            this.mediaRecorder.stop();

            // Stop all media tracks.
            if (this.mediaStream) {
                this.mediaStream.getTracks().forEach(track => track.stop());
            }
        });
    }
}
