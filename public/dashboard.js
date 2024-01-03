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
let currentView = 'thumbnail'; // Set thumbnail view as default
let recordingsGlobal = []; // To hold the recordings globally

// Utility function to format bytes into a readable format
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Utility function to format dates
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString(); // Adjust formatting as needed
}

// Function to initialize the dashboard
function initializeDashboard(userId) {
    console.log('Initializing dashboard for user:', userId);
    const recordingsRef = collection(db, `users/${userId}/recordings`);
    onSnapshot(recordingsRef, (querySnapshot) => {
        recordingsGlobal = [];
        querySnapshot.forEach((doc) => {
            recordingsGlobal.push({ id: doc.id, ...doc.data() });
        });
        console.log('Recordings snapshot fetched:', recordingsGlobal);
        updateView(); // Call a function to update the UI based on the current view
    });
}

// Function to update the dashboard view
function updateView() {
    console.log(`Updating view to: ${currentView}`);
    if (currentView === 'thumbnail') {
        console.log('Creating Thumbnail View');
        createThumbnailView();
    } else {
        console.log('Creating List View');
        createListView();
    }
}

// Function to create a list view
function createListView() {
    console.log('Generating List View');
    dashboardContainer.innerHTML = ''; // Clear the container
    const table = document.createElement('table');
    table.className = 'recordings-table';
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    table.appendChild(thead);
    table.appendChild(tbody);

    // Define table headers
    const headers = ['Thumbnail', 'Name', 'Size', 'Date', 'Action'];
    const headerRow = document.createElement('tr');
    headers.forEach(headerText => {
        const header = document.createElement('th');
        header.textContent = headerText;
        headerRow.appendChild(header);
    });
    thead.appendChild(headerRow);

    // Populate the table body with recordings data
    recordingsGlobal.forEach(recording => {
        const row = document.createElement('tr');

        // Add a cell with the thumbnail
        const thumbnailCell = document.createElement('td');
        const thumbnailImg = document.createElement('img');
        thumbnailImg.src = recording.thumbnailUrl || 'images/default-thumbnail.png'; // Fallback to a default image if necessary
        thumbnailImg.className = 'table-thumbnail';
        thumbnailCell.appendChild(thumbnailImg);
        row.appendChild(thumbnailCell);

        // Other cells for data
        const nameCell = document.createElement('td');
        nameCell.textContent = recording.name || 'Unnamed';
        row.appendChild(nameCell);

        const sizeCell = document.createElement('td');
        sizeCell.textContent = formatBytes(recording.size);
        row.appendChild(sizeCell);

        const dateCell = document.createElement('td');
        dateCell.textContent = formatDate(recording.createdAt);
        row.appendChild(dateCell);

        const actionCell = document.createElement('td');
        const viewButton = document.createElement('button');
        viewButton.textContent = 'View';
        viewButton.onclick = () => displayRecordingDetails(recording);
        actionCell.appendChild(viewButton);
        row.appendChild(actionCell);

        tbody.appendChild(row);

        // Set data-id attribute on the view button
        viewButton.setAttribute('data-id', recording.id);
    });

    // Set event listeners for the 'View' buttons in the list view
    const viewButtons = dashboardContainer.querySelectorAll('.view-button');
    viewButtons.forEach(button => {
        button.addEventListener('click', function () {
            const recordingId = this.getAttribute('data-id');
            const recording = recordingsGlobal.find(r => r.id === recordingId);
            displayRecordingDetails(recording);
        });
    });


    // Clear existing content and append the table to the dashboard container
    dashboardContainer.innerHTML = '';
    dashboardContainer.appendChild(table);
    
}

// Function to create a thumbnail view
function createThumbnailView() {
    console.log('Generating Thumbnail View');
    dashboardContainer.innerHTML = ''; // Clear the container
    const gridContainer = document.createElement('div');
    gridContainer.className = 'grid-container';

    recordingsGlobal.forEach(recording => {
        const thumbnail = document.createElement('div');
        thumbnail.className = 'recording-thumbnail';
        thumbnail.innerHTML = `
            <img class="recording-thumbnail-img" src="${recording.thumbnailUrl || 'images/default-thumbnail.png'}" alt="${recording.name}">
            <div class="recording-info">
                <div class="recording-title">${recording.name}</div>
                <div class="recording-date">${formatDate(recording.createdAt)}</div>
            </div>
        `;

        // Find the image within the thumbnail div and set the data-id attribute
        const thumbnailImg = thumbnail.querySelector('.recording-thumbnail-img');
        thumbnailImg.setAttribute('data-id', recording.id);

        gridContainer.appendChild(thumbnail);
    });

    dashboardContainer.appendChild(gridContainer);


    // Set event listeners for thumbnails to show recording details
    const thumbnails = dashboardContainer.querySelectorAll('.recording-thumbnail-img');
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function () {
            const recordingId = this.getAttribute('data-id');
            const recording = recordingsGlobal.find(r => r.id === recordingId);
            displayRecordingDetails(recording);
        });
    });

}

// Event listener for the toggle view button
toggleViewButton.addEventListener('click', () => {
    currentView = currentView === 'list' ? 'thumbnail' : 'list';
    updateView();
    console.log(`View toggled to: ${currentView}`);
});

// Function to load and display recordings
async function loadAndDisplayRecordings(userId) {
    try {
        console.log(`Loading recordings for user: ${userId}`);
        const recordings = await fetchUserRecordings(userId);
        console.log('Recordings fetched successfully:', recordings);
        recordingsGlobal = recordings; // Update the global recordings array
        updateView(); // Update the view with the new recordings
    } catch (error) {
        console.error('Failed to load recordings:', error);
        dashboardContainer.innerHTML = '<p>Error loading recordings. Please try again later.</p>';
    }
}

// Function to toggle between thumbnail and list view
function toggleView() {
    currentView = currentView === 'thumbnail' ? 'list' : 'thumbnail';
    console.log('Toggled view to:', currentView);
    updateView();
}

// Function to set the default view to thumbnails
function setDefaultViewToThumbnails() {
    if (currentView !== 'thumbnail') {
        currentView = 'thumbnail';
        console.log('Default view set to thumbnails');
        updateView();
    }
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

// Initialize dashboard
onAuthStateChanged(auth, user => {
    if (user) {
        console.log('User is signed in:', user.uid);
        initializeDashboard(user.uid);
        loadAndDisplayRecordings(user.uid);
        // Ensure the dashboardContainer is displayed and recordingContainer is hidden by default
        dashboardContainer.style.display = 'block';
        recordingContainer.style.display = 'none';
    } else {
        console.log('No user is signed in.');
    }
});

// Exports
export { loadAndDisplayRecordings, toggleView, setDefaultViewToThumbnails };
