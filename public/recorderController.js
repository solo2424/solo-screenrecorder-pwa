// public/recorderController.js


import { auth, uploadRecording } from './firebase.js';

export default class RecorderController {
    constructor(previewElement, loadDisplayCallback) {
        this.previewElement = previewElement;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.lastRecordingBlob = null;
        this.screenStream = null;
        this.webcamStream = null;
        this.audioStream = null;
        this.combinedStream = null;
        this.canvas = null;
        this.isRecording = false;
        this.loadDisplayCallback = loadDisplayCallback; // Assign the passed function
        console.log('RecorderController initialized');
    }




    async startRecording(options) {
        if (this.isRecording) {
            console.log('Recording is already in progress.');
            return;
        }
        this.isRecording = true;
        console.log('Starting recording with options:', options);
        const videoConstraints = this.getVideoConstraints(options.video);
        const audioConstraints = this.getAudioConstraints(options.audio);
        try {
            if (videoConstraints) {
                this.screenStream = await navigator.mediaDevices.getDisplayMedia({ video: videoConstraints });
            }
            if (audioConstraints) {
                this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
            }
            this.combinedStream = new MediaStream([
                ...(this.screenStream ? this.screenStream.getTracks() : []),
                ...(this.audioStream ? this.audioStream.getTracks() : []),
            ]);
            this.mediaRecorder = new MediaRecorder(this.combinedStream);
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };
            this.mediaRecorder.onstop = this.onRecordingStop.bind(this);
            this.mediaRecorder.start(10);
            this.updatePreview(this.combinedStream);
            console.log('Recording started');
        } catch (error) {
            console.error('Error starting recording:', error);
            this.resetRecorder();
        }
    }


    async stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop(); // This will trigger the `onstop` event
            this.isRecording = false;
            previewContainer.style.display = 'none';
            console.log('Recording stopped');

            // Stop all media tracks
            if (this.screenStream) {
                this.screenStream.getTracks().forEach(track => {
                    console.log('Stopping screenStream track:', track);
                    track.stop();
                });
            }
            if (this.webcamStream) {
                this.webcamStream.getTracks().forEach(track => {
                    console.log('Stopping webcamStream track:', track);
                    track.stop();
                });
            }
            if (this.audioStream) {
                this.audioStream.getTracks().forEach(track => {
                    console.log('Stopping audioStream track:', track);
                    track.stop();
                });
            }
        } else {
            console.log('No recording in progress to stop.');
        }
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
        // Clear the recorded chunks
        this.recordedChunks = [];
        // Stop all media tracks
        if (this.screenStream) {
            this.screenStream.getTracks().forEach(track => track.stop());
        }
        if (this.webcamStream) {
            this.webcamStream.getTracks().forEach(track => track.stop());
        }
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
    
    getVideoConstraints(videoOption) {
        switch (videoOption) {
            case 'only-screen':
                return { width: 1280, height: 720 };
            case 'screen-camera':
                return { width: 1280, height: 720 }; // Adjust as needed for combined stream
            case 'only-camera':
                return { width: 640, height: 360 };
            default:
                return null;
        }
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