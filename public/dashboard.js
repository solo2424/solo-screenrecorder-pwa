// dashboard.js

import { deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Import the necessary functions from firebase.js
import {
    fetchUserRecordings,
    auth,
    db,
    onAuthStateChanged,
    collection,
    onSnapshot
} from './firebase.js';

import { fetchAndDisplayRecordings } from "./firebase.js";

// DOM elements
const dashboardContainer = document.getElementById('dashboardContainer');
const recordingContainer = document.getElementById('recordingContainer');
const playerContainer = document.getElementById('playerContainer');
const viewToggleButton = document.getElementById('view-toggle');

let currentView = 'thumbnail';
let allRecordings = [];

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}

function toggleView() {
    console.log('Toggling view from', currentView);
    currentView = currentView === 'list' ? 'thumbnail' : 'list';
    console.log('New view is', currentView);
    updateView(allRecordings);
}

function initializeDashboard(userId) {
    console.log("Initializing dashboard for user:", userId);
    setupRealtimeRecordingsListener(userId);
    fetchAndDisplayRecordings(userId)
}



// Realtime listener setup would look like this:
function setupRealtimeRecordingsListener(userId) {
    const recordingsCol = collection(db, `users/${userId}/recordings`);
    onSnapshot(recordingsCol, (snapshot) => {
        const recordings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderRecordings(recordings);
    }, (error) => {
        console.error("Error setting up real-time listener:", error);
    });
}  



function renderRecordings(recordings) {
    console.log("Rendering recordings:", recordings);
    dashboardContainer.innerHTML = '';
    if (currentView === 'thumbnail') {
        createThumbnailView(recordings);
    } else {
        createListView(recordings);
    }
}




function updateView() {
    dashboardContainer.innerHTML = '';
    if (currentView === 'thumbnail') {
        createThumbnailView(allRecordings);
    } else {
        createListView(allRecordings);
    }
}

function setDefaultViewToThumbnails() {
    if (currentView !== 'thumbnail') {
        console.log('Setting default view to thumbnails');
        toggleView();
    }
}

function createThumbnailView(recordings) {
    const gridContainer = document.createElement('div');
    gridContainer.className = 'grid-container';
    recordings.forEach(recording => {
        const thumbnail = document.createElement('div');
        thumbnail.className = 'recording-thumbnail';
        thumbnail.innerHTML = `
            <img class="recording-thumbnail-img" src="${recording.thumbnailUrl || 'images/default-thumbnail.png'}" alt="${recording.name}">
            <div class="recording-info">
                <div class="recording-title">${recording.name}</div>
                <div class="recording-date">${formatDate(recording.createdAt)}</div>
            </div>
        `;
        thumbnail.addEventListener('click', () => displayRecordingDetails(recording));
        gridContainer.appendChild(thumbnail);
    });
    dashboardContainer.appendChild(gridContainer);
}

function createListView(recordings) {
    const listContainer = document.createElement('div');
    listContainer.className = 'list-container';
    recordings.forEach(recording => {
        const listItem = document.createElement('div');
        listItem.className = 'recording-list-item';
        listItem.innerHTML = `
            <div class="recording-info">
                <div class="recording-title">${recording.name}</div>
                <div class="recording-date">${formatDate(recording.createdAt)}</div>
                <div class="recording-size">${formatBytes(recording.size)}</div>
            </div>
        `;
        listItem.addEventListener('click', () => displayRecordingDetails(recording));
        listContainer.appendChild(listItem);
    });
    dashboardContainer.appendChild(listContainer);
}

function displayRecordingDetails(recording) {
    console.log(`Displaying details for recording: ${recording.name}`);
    recordingContainer.style.display = 'block';
    dashboardContainer.style.display = 'none';

    playerContainer.innerHTML = `
        <video controls width="100%" height="70%" src="${recording.url}" style="border-radius: 10px 10px 0 0;"></video>
        <div id="detailsContainer">
            <h3>${recording.name}</h3>
            <p>Date: ${formatDate(recording.createdAt)}</p>
            <p>Size: ${formatBytes(recording.size)}</p>
            <button id="deleteRecordingButton" class="delete-button">Delete</button>
            <a href="${recording.url}" download="${recording.name}" id="downloadRecordingButton" class="download-button">Download</a>
        </div>
    `;

    setTimeout(() => {
        const deleteButton = document.getElementById('deleteRecordingButton');
        const downloadButton = document.getElementById('downloadRecordingButton');
        if (deleteButton && downloadButton) {
            deleteButton.onclick = async function() {
                // Prompt the user for confirmation
                const confirmation = confirm("Are you sure you want to delete this recording?");
                if (confirmation) {
                    // If the user confirms, proceed with the deletion
                    try {
                        await deleteRecording(recording.id);
                        console.log("Recording deleted successfully");

                        // Hide the recordingContainer and show the dashboardContainer
                        recordingContainer.style.display = 'none';
                        dashboardContainer.style.display = 'block';
                    } catch (error) {
                        console.error("Error deleting recording:", error);
                    }
                }
            };
            downloadButton.href = recording.url;
            downloadButton.download = recording.name;
        } else {
            console.error("Buttons not found in DOM.");
        }
    }, 0);
}


// Adjust the deleteRecording function to use the current user
async function deleteRecording(recordingId) {
    const user = auth.currentUser;
    if (!user) {
        console.error('No authenticated user.');
        return;
    }
    console.log("Attempting to delete recording:", recordingId);

    const recordingRef = doc(db, `users/${user.uid}/recordings`, recordingId);
    try {
        await deleteDoc(recordingRef);
        console.log('Recording deleted:', recordingId);
        fetchAndDisplayRecordings(user.uid);
    } catch (error) {
        console.error('Error deleting recording:', error);
    }

    try {
        console.log('Recording deleted, refreshing dashboard:', recordingId);
        await fetchAndDisplayRecordings(user.uid);
    } catch (error) {
        console.error('Error fetching recordings after deletion:', error);
    }

}





async function loadAndDisplayRecordings(userId) {
    try {
        const recordings = await fetchUserRecordings(userId);
        allRecordings = recordings;
        updateView();
    } catch (error) {
        console.error('Failed to load recordings:', error);
        dashboardContainer.innerHTML = '<p>Error loading recordings. Please try again later.</p>';
    }
}

onAuthStateChanged(auth, user => {
    if (user) {
        initializeDashboard(user.uid);
        loadAndDisplayRecordings(user.uid);
        dashboardContainer.style.display = 'block';
        recordingContainer.style.display = 'none';
    } else {
        console.log('No user is signed in.');
    }
});

// Add an event listener to hide recordingContainer when clicking outside of it
document.addEventListener('click', function (event) {
    const clickedElement = event.target;
    const isThumbnailClick = clickedElement.closest('.recording-thumbnail');
    const isNavbarUserClick = clickedElement.closest('.navbar-user'); // Use the class for the user section of the navbar

    // Check if the click is outside of the recordingContainer, not on a thumbnail, and not on the navbar user section
    if (!isThumbnailClick && !recordingContainer.contains(clickedElement) && !isNavbarUserClick && recordingContainer.style.display === 'block') {
        recordingContainer.style.display = 'none';
        dashboardContainer.style.display = 'block';
    }
});

// When the dashboard is shown, ensure the latest recordings are fetched
document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible') {
        console.log('Page is now visible, checking for user and fetching recordings.');
        const user = auth.currentUser;
        if (user) {
            await fetchAndDisplayRecordings(user.uid);
        }
    }
});


// Currently works to toggle - (Sidebar Button) Add the event listener for the view toggle button
viewToggleButton.addEventListener('click', toggleView);

export { loadAndDisplayRecordings, setDefaultViewToThumbnails, deleteRecording, fetchAndDisplayRecordings };
