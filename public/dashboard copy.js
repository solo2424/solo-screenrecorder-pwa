// dashboard.js
// Import the necessary functions from firebase.js
import {
    fetchUserRecordings,
    auth,
    db,
    onAuthStateChanged,
    collection,
    onSnapshot
} from './firebase.js';

// DOM elements
const dashboardContainer = document.getElementById('dashboardContainer');
const recordingContainer = document.getElementById('recordingContainer');
const playerContainer = document.getElementById('playerContainer');
const detailsContainer = document.getElementById('detailsContainer');
const toggleViewButton = document.getElementById('viewToggle');
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
    currentView = currentView === 'list' ? 'thumbnail' : 'list';
    updateView(allRecordings);
}

function initializeDashboard(userId) {
    const recordingsRef = collection(db, `users/${userId}/recordings`);
    onSnapshot(recordingsRef, (querySnapshot) => {
        allRecordings = [];
        querySnapshot.forEach((doc) => {
            allRecordings.push({ id: doc.id, ...doc.data() });
        });
        updateView(allRecordings);
    });
}

function updateView(recordings) {
    dashboardContainer.innerHTML = '';
    if (currentView === 'thumbnail') {
        createThumbnailView(recordings);
    } else {
        createListView(recordings);
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

    // Populate playerContainer with video and details
    playerContainer.innerHTML = `
        <video controls width="100%" height="70%" src="${recording.url}" style="border-radius: 10px 10px 0 0;"></video>
        <div id="detailsContainer" style="position: absolute; bottom: 0; width: 100%; height: 30%; background-color: rgb(255, 255, 255); border-radius: 0 0 10px 10px; padding: 10px; box-sizing: border-box; overflow: auto;">
            <h3>${recording.name}</h3>
            <p>Date: ${formatDate(recording.createdAt)}</p>
            <p>Size: ${formatBytes(recording.size)}</p>
        </div>
    `;
}


toggleViewButton.addEventListener('click', toggleView);

async function loadAndDisplayRecordings(userId) {
    try {
        const recordings = await fetchUserRecordings(userId);
        allRecordings = recordings;
        updateView(allRecordings);
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

export { loadAndDisplayRecordings };
