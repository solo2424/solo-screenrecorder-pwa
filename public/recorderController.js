// public\recorderController.js

export default class RecorderController {
    constructor() {
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.screenStream = null;
        this.webcamStream = null;
    }

    async startRecording(videoOptions) {
        try {
            console.log('Starting recording...');
            console.log('Video options:', videoOptions);

            let previewElement;

            if (videoOptions === 'only-camera' || videoOptions === 'screen-camera') {
                // get webcam stream
                const webcamConstraints = {
                    video: { width: 640, height: 360 },
                    audio: false
                };

                this.webcamStream = await navigator.mediaDevices.getUserMedia(webcamConstraints);
                previewElement = document.querySelector('#webcam-preview');
                previewElement.srcObject = this.webcamStream;

            }

            if (videoOptions === 'only-screen' || videoOptions === 'screen-camera') {
                // get screen share stream
                const screenConstraints = {
                    video: {
                        cursor: 'always',
                        width: 640,
                        height: 360
                    },
                    audio: false
                };

                this.screenStream = await navigator.mediaDevices.getDisplayMedia(screenConstraints);
                previewElement = document.querySelector('#preview');
                previewElement.srcObject = this.screenStream;
            }

            // add null check
            if (!previewElement) {
                throw new Error('Preview element not set');
            }

            console.log('Using preview element:', previewElement);

            // create media stream and configure media recorder
            const videoTrack = previewElement.srcObject.getVideoTracks()[0];
            const mediaStream = new MediaStream([videoTrack]);

            const options = { mimeType: 'video/webm; codecs=vp9' };
            this.mediaRecorder = new MediaRecorder(mediaStream, options);

            this.mediaRecorder.ondataavailable = (e) => this.recordedChunks.push(e.data);
            this.mediaRecorder.onstop = () => console.log('Recording stopped');

            this.mediaRecorder.start();

            console.log('Recording started');

        } catch (error) {
            console.error('Error starting recording:', error);
            throw error;
        }
    }

    async stopRecording() {
        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder) {
                reject('Media Recorder undefined');
                return;
            }

            this.mediaRecorder.stop();

            this.mediaRecorder.onstop = () => {
                // Create blob and clear recorded chunks
                const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
                this.recordedChunks = [];

                if (this.webcamStream) {
                    this.webcamStream.getTracks().forEach(track => track.stop());
                }

                if (this.screenStream) {
                    this.screenStream.getTracks().forEach(track => track.stop());
                }

                resolve(blob);
            };
        });
    }
}