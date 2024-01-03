// public/recorderController.js

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
        this.previewElement = document.querySelector('#preview');
        this.webcamElement = document.querySelector('#draggable-webcam'); // Assuming you have a draggable element with this id
    }

    async startRecording(options) {
        try {
            console.log('Starting recording with options:', options);
            this.canvas = document.createElement('canvas');
            this.canvas.width = 1280;
            this.canvas.height = 720;
            const ctx = this.canvas.getContext('2d');

            const screenConstraints = { video: { width: 1280, height: 720 } };
            const webcamConstraints = { video: { width: 320, height: 180 } };

            if (options.video === 'only-screen' || options.video === 'screen-camera') {
                this.screenStream = await navigator.mediaDevices.getDisplayMedia(screenConstraints);
            }
            if (options.video === 'screen-camera' || options.video === 'only-camera') {
                this.webcamStream = await navigator.mediaDevices.getUserMedia(webcamConstraints);
            }
            if (options.audio === 'microphone') {
                this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            }

            let screenVideo, webcamVideo;
            if (this.screenStream) {
                screenVideo = document.createElement('video');
                screenVideo.srcObject = this.screenStream;
                await screenVideo.play();
            }
            if (this.webcamStream) {
                webcamVideo = document.createElement('video');
                webcamVideo.srcObject = this.webcamStream;
                await webcamVideo.play();
            }

            const drawVideos = () => {
                ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                if (this.screenStream && (options.video !== 'only-camera')) {
                    ctx.drawImage(screenVideo, 0, 0, this.canvas.width, this.canvas.height);
                }
                if (this.webcamStream && (options.video !== 'only-screen')) {
                    if (options.video === 'only-camera') {
                        ctx.drawImage(webcamVideo, 0, 0, this.canvas.width, this.canvas.height);
                    } else {
                        const x = this.webcamElement.offsetLeft;
                        const y = this.webcamElement.offsetTop;
                        const radius = 10; // Adjust the corner radius as needed
                        ctx.save();
                        ctx.beginPath();
                        ctx.moveTo(x + radius, y);
                        ctx.lineTo(x + webcamVideo.videoWidth - radius, y);
                        ctx.quadraticCurveTo(x + webcamVideo.videoWidth, y, x + webcamVideo.videoWidth, y + radius);
                        ctx.lineTo(x + webcamVideo.videoWidth, y + webcamVideo.videoHeight - radius);
                        ctx.quadraticCurveTo(x + webcamVideo.videoWidth, y + webcamVideo.videoHeight, x + webcamVideo.videoWidth - radius, y + webcamVideo.videoHeight);
                        ctx.lineTo(x + radius, y + webcamVideo.videoHeight);
                        ctx.quadraticCurveTo(x, y + webcamVideo.videoHeight, x, y + webcamVideo.videoHeight - radius);
                        ctx.lineTo(x, y + radius);
                        ctx.quadraticCurveTo(x, y, x + radius, y);
                        ctx.closePath();
                        ctx.clip();
                        ctx.drawImage(webcamVideo, x, y, webcamVideo.videoWidth, webcamVideo.videoHeight);
                        ctx.restore();
                    }
                }
                requestAnimationFrame(drawVideos);
            };
            drawVideos();

            const canvasStream = this.canvas.captureStream(30);
            if (this.audioStream) {
                const audioTrack = this.audioStream.getAudioTracks()[0];
                canvasStream.addTrack(audioTrack);
            }

            const recorderOptions = { mimeType: 'video/webm; codecs=vp9' };
            this.mediaRecorder = new MediaRecorder(canvasStream, recorderOptions);
            this.mediaRecorder.ondataavailable = (e) => this.recordedChunks.push(e.data);
            this.mediaRecorder.onstop = () => console.log('Recording stopped');
            this.mediaRecorder.start();

            this.previewElement.srcObject = canvasStream;
            console.log('Recording started');
        } catch (error) {
            console.error('Error starting recording:', error);
            this.resetRecorder();
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
            this.mediaRecorder.onstop = () => {
                console.log('onstop handler triggered');
                const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
                if (this.screenStream) {
                    this.screenStream.getTracks().forEach(track => track.stop());
                    console.log('Screen stream stopped');
                }
                if (this.webcamStream) {
                    this.webcamStream.getTracks().forEach(track => track.stop());
                    console.log('Webcam stream stopped');
                }
                console.log('Media streams stopped');
                resolve(blob);
            };
        });
    }



    async saveRecording(blob) {
        console.log('Saving recording...');
        try {
            const fileSaver = await import('./fileSaver.js');
            fileSaver.saveAs(blob, 'recording.webm');
            console.log('Recording saved');
        } catch (error) {
            console.error('Error saving recording:', error);
        }
    }
}
