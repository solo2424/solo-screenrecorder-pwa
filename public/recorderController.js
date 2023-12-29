
// public/recorderController.js
export default class RecorderController {
    constructor(previewElement) {
        this.previewElement = previewElement;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.screenStream = null;
        this.webcamStream = null;
        this.audioStream = null;
        this.combinedStream = null;
        this.canvas = null;
        this.isRecording = false;
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
    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop(); // This will trigger the `onstop` event
            this.isRecording = false;
            previewContainer.style.display = 'none';
            console.log('Recording stopped');
        } else {
            console.log('No recording in progress to stop.');
        }
    }
    onRecordingStop() {
        // Create a blob from the recorded chunks
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        // Save the recording
        this.saveRecording(blob);
        // Reset the recorder state
        this.resetRecorder();
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
        console.log('Saving recording');
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
}