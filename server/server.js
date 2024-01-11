// server\server.js

const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const cors = require('cors');
const fs = require('fs');  // Import the fs module

const app = express();

// Use CORS middleware
app.use(cors());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, '../public')));

// Function to ensure directory exists
function ensureDirExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

app.post('/combine', upload.array('videos', 2), (req, res) => {
    if (req.files.length !== 2) {
        return res.status(400).send("Two video files are required.");
    }

    const inputFile1 = req.files[0].path;
    const inputFile2 = req.files[1].path;

    // Ensure the output directory exists
    const outputDir = path.join(__dirname, 'output');
    ensureDirExists(outputDir);

    const outputFile = path.join(outputDir, `${Date.now()}.webm`);

    // Updated FFmpeg command with scaling and SAR adjustments
    const ffmpegCommand = `ffmpeg -i ${inputFile1} -i ${inputFile2} -filter_complex "[1:v]scale=1920:1080,setdar=16/9[v2];[0:v][v2]concat=n=2:v=1[v];[v]fps=30[out]" -map "[out]" ${outputFile}`;

    console.log("Executing FFmpeg command:", ffmpegCommand);

    exec(ffmpegCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`FFmpeg execution failed. Error: ${error.message}`);
            console.error(`Standard Error Output (stderr): ${stderr}`);
            return res.status(500).send("Server error");
        }
        console.log(`FFmpeg execution succeeded. Standard Output (stdout): ${stdout}`);
        console.log(`Input File 1: ${inputFile1}`);
        console.log(`Input File 2: ${inputFile2}`);
        console.log(`Output File: ${outputFile}`);
        res.download(outputFile);
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});
