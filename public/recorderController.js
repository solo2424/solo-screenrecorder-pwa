// public/recorderController.js


import { auth, uploadRecording } from './firebase.js';

export default class RecorderController {
    constructor() {
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.screenStream = null;
        this.webcamStream = null;
        this.audioStream = null;
        this.canvas = null;
        this.previewElement = document.querySelector('#preview');
        this.webcamElement = document.querySelector('#draggable-webcam');
    }

    async startRecording(options) {
        try {
            console.log('Starting recording with options:', options);
            this.canvas = document.createElement('canvas');
            this.canvas.width = 1280;
            this.canvas.height = 720;
            const ctx = this.canvas.getContext('2d');

            // Setting up constraints for screen and webcam
            const screenConstraints = { video: { width: 1280, height: 720 } };
            const webcamConstraints = { video: { width: 320, height: 180 } };

            // Obtaining media streams based on selected options
            if (options.video === 'only-screen' || options.video === 'screen-camera') {
                this.screenStream = await navigator.mediaDevices.getDisplayMedia(screenConstraints);
            }
            if (options.video === 'screen-camera' || options.video === 'only-camera') {
                this.webcamStream = await navigator.mediaDevices.getUserMedia(webcamConstraints);
            }
            if (options.audio === 'microphone') {
                this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            }

            // Setup for drawing webcam and screen videos
            this.setupVideoPlayback(ctx, options);

            const canvasStream = this.canvas.captureStream(30);
            if (this.audioStream) {
                const audioTrack = this.audioStream.getAudioTracks()[0];
                canvasStream.addTrack(audioTrack);
            }

            const recorderOptions = { mimeType: 'video/webm; codecs=vp9' };
            this.mediaRecorder = new MediaRecorder(canvasStream, recorderOptions);
            this.mediaRecorder.ondataavailable = (e) => this.recordedChunks.push(e.data);
            this.mediaRecorder.onstop = () => console.log('Recording stopped');
            this.isRecording = true; // Set the flag to true when recording starts

            this.mediaRecorder.start();

            this.previewElement.srcObject = canvasStream;
            console.log('Recording started');
        } catch (error) {
            console.error('Error starting recording:', error);
            throw error;
        }
    }

    setupVideoPlayback(ctx, options) {
        let screenVideo, webcamVideo;
        if (this.screenStream) {
            screenVideo = document.createElement('video');
            screenVideo.srcObject = this.screenStream;
            screenVideo.play().then(() => console.log('Screen video playback started'));
        }
        if (this.webcamStream) {
            webcamVideo = document.createElement('video');
            webcamVideo.srcObject = this.webcamStream;
            webcamVideo.play().then(() => console.log('Webcam video playback started'));
        }

        const drawVideos = () => {
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            if (this.screenStream && (options.video !== 'only-camera')) {
                ctx.drawImage(screenVideo, 0, 0, this.canvas.width, this.canvas.height);
            }
            if (this.webcamStream && (options.video !== 'only-screen')) {
                const x = this.webcamElement.offsetLeft;
                const y = this.webcamElement.offsetTop;
                ctx.drawImage(webcamVideo, x, y, webcamVideo.videoWidth, webcamVideo.videoHeight);
            }
            requestAnimationFrame(drawVideos);
        };
        drawVideos();
    }




    async stopRecording() {
        return new Promise((resolve, reject) => {
            if (this.mediaRecorder && this.isRecording) {
                // Set onstop event handler
                this.mediaRecorder.onstop = async () => {
                    console.log('Recording stopped');

                    // Create blob from recorded chunks
                    const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
                    this.lastRecordingBlob = blob;

                    // Stop all media tracks
                    [this.screenStream, this.webcamStream, this.audioStream].forEach(stream => {
                        if (stream) {
                            stream.getTracks().forEach(track => track.stop());
                        }
                    });

                    // Hide the preview container
                    previewContainer.style.display = 'none';

                    // Resolve the promise with the recorded blob
                    resolve(blob);

                    // Call additional functions as needed (e.g., save recording, update UI)
                    await this.onRecordingStop(); // Ensure this function is async
                };

                // Stop the media recorder
                this.mediaRecorder.stop();
                this.isRecording = false;

            } else {
                console.log('No recording in progress to stop.');
                reject('No recording in progress');
            }
        });
    }

    onRecordingStop() {
        this.lastRecordingBlob = new Blob(this.recordedChunks, { type: 'video/webm' });
        console.log('Recording stopped. Blob created.');

        const currentUser = auth.currentUser;
        if (currentUser) {
            this.saveRecordingToFirebase(this.lastRecordingBlob)
                .then(() => {
                    console.log('Recording saved and dashboard refreshed');
                    if (this.loadDisplayCallback) {
                        this.loadDisplayCallback(currentUser.uid);
                    }
                })
                .catch((error) => {
                    console.error('Error saving recording:', error);
                });
        } else {
            console.error('Error: No user logged in.');
        }
    }

    async saveRecordingToFirebase(blob) {
        const currentUser = auth.currentUser;
        if (currentUser) {
            try {
                await uploadRecording(currentUser.uid, blob);
                console.log('Recording uploaded successfully. Refreshing dashboard...');
                if (this.loadDisplayCallback && typeof this.loadDisplayCallback === 'function') {
                    await this.loadDisplayCallback(currentUser.uid);
                }
            } catch (error) {
                console.error('Error during recording upload:', error);
            }
        } else {
            console.log('User is not logged in. Cannot upload recording.');
        }
    }

    getLastRecordingBlob() {
        return this.lastRecordingBlob;
    }


    resetRecorder() {
        this.recordedChunks = [];
        [this.screenStream, this.webcamStream, this.audioStream].forEach(stream => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        });
        console.log('Recorder reset');

        if (this.audioStream) {
            this.audioStream.getTracks().forEach(track => track.stop());
        }
        // Update the UI if necessary
        // For example, hide the "Stop Recording" button and show the "Start Recording" button
        const stopRecordingBtn = document.getElementById('stop-recording');
        if (stopRecordingBtn) {
            stopRecordingBtn.style.display = 'none';
        }
        const startRecordingBtn = document.getElementById('new-recording');
        if (startRecordingBtn) {
            startRecordingBtn.style.display = 'block';
        }
    }
    async saveRecording(blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'recording.webm';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        console.log('Recording saved');
    }

    updatePreview(stream) {
        if (this.previewElement) {
            this.previewElement.srcObject = stream;
            this.previewElement.play();
            console.log('Preview updated');
        } else {
            console.error('No preview element available for updating preview.');
        }
    }
    
    getVideoConstraints() {
        // Define a standard 4:3 aspect ratio resolution.
        const standardResolution = { width: 960, height: 720 }; // This is a common 4:3 resolution.

        // Apply the standard resolution constraints for all recording types.
        return {
            width: { ideal: standardResolution.width },
            height: { ideal: standardResolution.height },
            aspectRatio: { ideal: 4 / 3 } // Explicitly state the desired aspect ratio.
        };
    }



    getAudioConstraints(audioOption) {
        switch (audioOption) {
            case 'microphone':
                return true;
            case 'system':
                return false; // System audio capture is not typically supported by browsers
            case 'system-mic':
                return true; // Combine system audio with microphone if possible
            default:
                return null;
        }
    }

    // Add getLastRecordingBlob method
    getLastRecordingBlob() {
        console.log('Retrieving last recording blob:', this.lastRecordingBlob);
        return this.lastRecordingBlob;
    }
}