SoloScreen Recorder - README
Overview
SoloScreen Recorder is a versatile web application designed for easy and efficient screen recording. This powerful tool offers users the capability to record their screen, webcam, or both, along with audio support. Tailored for a seamless user experience, the app integrates Firebase for authentication and storage, ensuring secure access and reliable file management.

Features
Screen Recording: Capture your entire screen or select specific application windows.
Webcam Recording: Record video from your webcam.
Audio Recording: Include audio in your recordings, either from the microphone or system audio.
Flexible Settings: Customize recording settings, including audio and video sources.
Firebase Integration: Secure user authentication and storage for recordings and thumbnails.
Interactive Dashboard: Manage recordings with options to view, download, or delete.
Real-Time Updates: Synchronized frontend display with backend changes.
User Authentication: Sign in with email/password or Google account.
Responsive Design: Optimized for various screen sizes, ensuring a consistent user experience.
Technical Details
Technologies Used
HTML/CSS/JavaScript: Core web technologies for structure, style, and functionality.
Firebase: For authentication, database, and storage solutions.
Web APIs: Utilizing navigator.mediaDevices for media capture.
Directory Structure
index.html: The main entry point of the application.
dashboard.js: Manages the dashboard functionality including the display and management of recordings.
firebase.js: Contains Firebase configuration and utility functions for user authentication and data handling.
main.js: Handles the main application logic, including the setup of recording options.
audioRecorder.js, webcamRecorder.js, screenRecorder.js: Specific recorders for different media types.
recorderController.js: Coordinates the recording process and interactions between different recorders.
fileSaver.js: Handles the saving and downloading of recorded files.
login.js, navbar.js, splashScreen.js: Manage user login, navigation, and initial loading screen.
optionsSettings.js: Configuration for recording options.
dashboard.css, login.css, navbar.css, splashScreen.css: Style sheets for various components.
Setup and Installation
Clone Repository: Clone the code repository to your local machine.
Firebase Setup: Configure Firebase project for authentication and storage.
Install Dependencies: No additional dependencies required.
Run Locally: Open index.html in a browser to start the application.
Usage Instructions
Sign In: Use Google account or email/password to sign in.
Choose Recording Type: Select from screen, webcam, or audio recording.
Recording: Start and stop recording as needed.
Manage Recordings: View, download, or delete recordings from the dashboard.
Contributions
Contributions to the SoloScreen Recorder are welcome. Please follow standard coding practices and submit pull requests for any new features or bug fixes.

License
SoloScreen Recorder is released under the MIT License. See the LICENSE file for more details.

For more information, visit SoloScreen Recorder's official website or contact the development team.

