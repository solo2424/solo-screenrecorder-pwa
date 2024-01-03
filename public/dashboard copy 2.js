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

let currentView = 'thumbnail';

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
    console.log(`View toggled to ${currentView}`);
    updateView();
}

function setDefaultViewToThumbnails() {
    if (currentView !== 'thumbnail') {
        toggleView();
    }
}



function updateView(recordings) {
    if (currentView === 'thumbnail') {
        createThumbnailView(recordings);
    } else {
        createListView(recordings);
    }
}

function createListView(recordings) {
    console.log('Creating List View');
    dashboardContainer.innerHTML = '';
    // Implement ListView here
}

function createThumbnailView(recordings) {
    console.log('Creating Thumbnail View');
    dashboardContainer.innerHTML = '';
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

async function loadAndDisplayRecordings(userId) {
    try {
        const recordings = await fetchUserRecordings(userId);
        updateView(recordings);
    } catch (error) {
        console.error('Error loading recordings:', error);
        dashboardContainer.innerHTML = '<p>Error loading recordings. Please try again later.</p>';
    }
}

function displayRecordingDetails(recording) {
    console.log(`Displaying details for recording: ${recording.name}`);
    recordingContainer.style.display = 'block';
    dashboardContainer.style.display = 'none';

    playerContainer.innerHTML = `<video controls src="${recording.url}"></video>`;
    detailsContainer.innerHTML = `
        <h3>${recording.name}</h3>
        <p>Date: ${formatDate(recording.createdAt)}</p>
        <p>Size: ${formatBytes(recording.size)}</p>
    `;
}

window.addEventListener('click', function (event) {
    if (!recordingContainer.contains(event.target) && recordingContainer.style.display === 'block') {
        recordingContainer.style.display = 'none';
        dashboardContainer.style.display = 'block';
    }
});

setDefaultViewToThumbnails();
export { loadAndDisplayRecordings, setDefaultViewToThumbnails };
