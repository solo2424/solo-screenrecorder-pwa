// public\firebase.js

// Import the Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithPopup,
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    getDocs,
    collection,
    query,
    addDoc,
    deleteDoc,
    onSnapshot,
    Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";



// Firebase configuration for the current app
const firebaseConfig = {
    apiKey: "AIzaSyD3UKOn3QK-Lz7zoFQ0M09haqLBhcTM6O4",
    authDomain: "soloscreenrecord.firebaseapp.com",
    projectId: "soloscreenrecord",
    storageBucket: "soloscreenrecord.appspot.com",
    messagingSenderId: "20152278571",
    appId: "1:20152278571:web:5efcc44d226944c218546e",
    measurementId: "G-044X5DLD71"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase auth
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase storage
const storage = getStorage(app);

// Function to update UI based on authentication state
const updateUIOnAuthStateChange = (user) => {
    const splashContainer = document.getElementById('splash-container');
    const sidebar = document.querySelector('.sidebar');

    if (user) {
        splashContainer.style.display = 'none';
        sidebar.style.display = 'block';
        fetchUserData(user.uid);
        fetchAndDisplayRecordings(user.uid); // Add this line
    } else {
        splashContainer.style.display = 'flex';
        sidebar.style.display = 'none';
    }
};

// Listen for auth state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, call fetchAndDisplayRecordings here
        fetchAndDisplayRecordings(user.uid);
    } else {
        // No user is signed in.
        console.log("No authenticated user.");
    }
});

// Function to fetch user data from Firestore
async function fetchUserData(userId) {
    const userRef = doc(db, 'users', userId);
    try {
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
            const userData = docSnap.data();
            updateNavbarUser(userData);
        } else {
            console.log("No such user data in Firestore!");
        }
    } catch (error) {
        console.error("Error fetching user data from Firestore:", error);
    }
}

// Function to update the navbar with user's data
function updateNavbarUser(userData) {
    const navbarProfileImage = document.getElementById('navbarProfileImage');
    const navbarUserNameSpan = document.getElementById('navbar-user-name');
    const sidebarUserNameSpan = document.getElementById('sidebar-user-name');

    if (navbarProfileImage) {
        navbarProfileImage.src = userData.profileImage;
    }
    if (navbarUserNameSpan) {
        navbarUserNameSpan.textContent = userData.firstName;
    }
    if (sidebarUserNameSpan) {
        sidebarUserNameSpan.textContent = userData.firstName;
    }
}


// Command to Fetch User's Recordings from Firebase.

async function fetchAndDisplayRecordings(userId) {
    const querySnapshot = await getDocs(collection(db, `users/${userId}/recordings`));
    const recordings = querySnapshot.docs.map(doc => doc.data());

    if (recordings.length === 0) {
        // If there are no recordings, display a message
        dashboardContainer.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
                <p>Get started with your first recording.</p>
                <button id="startRecordingButton">Start Recording</button>
            </div>
        `;
        const startRecordingButton = document.getElementById('startRecordingButton');
        startRecordingButton.onclick = () => {
            // Call the function that shows the optionsOverlay here
            showOptionsOverlay();
        };
    } else {
        // If there are recordings, display them
        // Add your existing code to display the recordings here
    }
}


// Function to upload a recording to Firebase Storage
async function uploadRecording(userId, blob) {
    try {
        console.log("Uploading recording for user:", userId);

        // Construct the file name using the current timestamp
        const now = new Date();
        const formattedDate = now.toISOString().split('.')[0];
        const fileName = `ssr-${formattedDate}.webm`;
        const storageRef = ref(storage, `recordings/${userId}/${fileName}`);

        // Upload the recording
        const uploadResult = await uploadBytes(storageRef, blob);
        console.log("Recording uploaded to Storage:", uploadResult.metadata.fullPath);

        // Get the download URL for the video
        const downloadURL = await getDownloadURL(uploadResult.ref);
        console.log("Recording download URL:", downloadURL);

        // Extract metadata from the upload result
        const { size, timeCreated, updated } = uploadResult.metadata;

        // Generate a thumbnail for the video and get its download URL
        const thumbnailURL = await generateAndUploadThumbnail(userId, blob, now.getTime());

        // Save the recording metadata, including the thumbnail URL, to Firestore
        const docRef = await addDoc(collection(db, `users/${userId}/recordings`), {
            name: fileName,
            size: size,
            url: downloadURL,
            thumbnailUrl: thumbnailURL, // Save the thumbnail URL
            createdAt: timeCreated,
            lastModified: updated,
        });
        console.log("Recording metadata saved to Firestore with thumbnail:", docRef.id);
    } catch (error) {
        console.error("Error uploading recording and thumbnail:", error);
    }
}

// Realtime listener for user recordings (adjusted function)
function onRecordingsChanged(userId, callback) {
    const recordingsRef = collection(db, `users/${userId}/recordings`);

    // Attach a listener for realtime updates
    onSnapshot(recordingsRef, (snapshot) => {
        const updatedRecordings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(updatedRecordings);
    }, (error) => {
        console.error("Error listening for recording updates:", error);
    });
}

// Function to generate a thumbnail image from the video blob
async function generateAndUploadThumbnail(userId, videoBlob, timestamp) {
    // Create a video element in memory
    const videoElement = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    return new Promise((resolve, reject) => {
        // Load the video blob into the video element
        videoElement.src = URL.createObjectURL(videoBlob);
        videoElement.addEventListener('loadeddata', () => {
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
            videoElement.play();
        });
        videoElement.addEventListener('play', () => {
            // Use requestAnimationFrame to ensure the frame is captured after the video starts playing
            requestAnimationFrame(() => {
                // Add a delay before capturing the frame
                setTimeout(() => {
                    try {
                        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                        canvas.toBlob(async (thumbnailBlob) => {
                            const thumbnailName = `thumbnail-${timestamp}.jpg`;
                            const thumbnailRef = ref(storage, `thumbnails/${userId}/${thumbnailName}`);
                            const thumbnailUploadResult = await uploadBytes(thumbnailRef, thumbnailBlob);
                            const thumbnailDownloadURL = await getDownloadURL(thumbnailUploadResult.ref);
                            resolve(thumbnailDownloadURL);
                        }, 'image/jpeg');
                    } catch (error) {
                        reject(error);
                    }
                }, 10000); // Delay in milliseconds
            });
        });
    });
}

// Add this function to `firebase.js`
async function fetchUserRecordings(userId) {
    const recordings = [];
    const querySnapshot = await getDocs(collection(db, `users/${userId}/recordings`));
    querySnapshot.forEach((doc) => {
        recordings.push({ id: doc.id, ...doc.data() });
    });
    return recordings;
}


// Export functions and variables
export {
    auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut,
    db,
    doc,
    setDoc,
    getDoc,
    getDocs,
    collection,
    query,
    onSnapshot,
    deleteDoc,
    fetchAndDisplayRecordings,
    uploadRecording,
    fetchUserRecordings,
    onRecordingsChanged,
    updateUIOnAuthStateChange
};

