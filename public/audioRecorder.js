// public\audioRecorder.js

export default class AudioRecorder {
    constructor() {
        console.log("Initializing AudioRecorder");
        this.mediaRecorder = null;
        this.audioChunks = [];
    }

    async getAudioStream(audioOption) {
        console.log(`Called getAudioStream with audioOption: ${audioOption}`);

        let audioConstraints = {};

        if (audioOption === 'microphone') {
            audioConstraints = { audio: true };
        }
        // Add more conditions here based on your audio options...

        try {
            console.log("Requesting audio stream");
            const audioStream = await navigator.mediaDevices.getUserMedia(audioConstraints);
            console.log("Successfully obtained audio stream");
            return audioStream;
        } catch (error) {
            console.error("Error in getAudioStream:", error);
            throw error;
        }
    }

    startRecording(audioStream) {
        console.log("Starting audio recording");

        try {
            this.mediaRecorder = new MediaRecorder(audioStream);
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                console.log("Audio data available, pushing to chunks");
                this.audioChunks.push(event.data);
            };

            this.mediaRecorder.onstop = () => {
                console.log("Audio recording stopped");
            };

            this.mediaRecorder.start();
            console.log("Audio recording started");

        } catch (error) {
            console.error("Error in startRecording:", error);
            throw error;
        }
    }

    stopRecording() {
        console.log("Stopping audio recording");

        try {
            if (this.mediaRecorder) {
                this.mediaRecorder.stop();
                console.log("Audio recording stopped");
            } else {
                console.log("MediaRecorder not initialized");
            }
        } catch (error) {
            console.error("Error in stopRecording:", error);
            throw error;
        }
    }

    getRecordedAudio() {
        console.log("Getting recorded audio");

        try {
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
            console.log("Successfully created audio blob");
            return audioBlob;
        } catch (error) {
            console.error("Error in getRecordedAudio:", error);
            throw error;
        }
    }
}

