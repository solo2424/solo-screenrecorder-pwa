// public/screenRecorder.js

// This class is responsible for screen recording.
export default class ScreenRecorder {

    constructor() {
        this.mediaRecorder = null;
        this.mediaStream = null;
        this.chunks = [];
        this.onStop = null;
    }

    async startRecording() {
        console.log('Starting screen recording...');

        const constraints = {
            video: {
                cursor: 'always'
            },
            audio: false
        };

        try {
            this.mediaStream = await navigator.mediaDevices.getDisplayMedia(constraints);

            this.mediaRecorder = new MediaRecorder(this.mediaStream);

            this.mediaRecorder.ondataavailable = event => {
                this.chunks.push(event.data);
            };

            this.mediaRecorder.onstop = () => {
                if (this.onStop) {
                    this.onStop();
                }
            };

            this.mediaRecorder.start();
            console.log('Screen recording started');

        } catch (error) {
            console.error('Error starting screen recording:', error);
            throw new Error('Could not start recording');
        }
    }

    async stopRecording() {
        console.log('Stopping screen recording...');

        return new Promise((resolve, reject) => {
            this.onStop = () => {
                try {
                    console.log('Creating blob from recorded chunks.');
                    const blob = new Blob(this.chunks, { type: 'video/webm' });
                    console.log('Blob created:', blob);

                    // Clear chunks for future recordings
                    this.chunks = [];

                    console.log('Screen recording stopped');
                    resolve(blob); // Resolve promise with blob

                } catch (error) {
                    console.error('Error stopping screen recording:', error);
                    reject(error);
                }
            };

            // Stop media recorder and media stream
            console.log('Stopping MediaRecorder.');
            this.mediaRecorder.stop();

            console.log('Stopping media stream tracks.');
            this.mediaStream.getTracks().forEach(track => track.stop());
        });
    }
}