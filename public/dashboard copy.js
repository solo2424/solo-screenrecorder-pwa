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

const dashboardContainer = document.getElementById('dashboardContainer');
let currentView = 'thumbnail'; // Set thumbnail view as default

// Function to toggle between list and thumbnail view
window.toggleView = () => {
    currentView = currentView === 'list' ? 'thumbnail' : 'list';
    updateView(); // Call a function to update the UI based on the current view
};

export function setDefaultViewToThumbnails() {
    // Check if the current view is not already 'thumbnail' and toggle if needed
    if (currentView !== 'thumbnail') {
        currentView = 'thumbnail';
        // Call the function to update the UI to thumbnail view
        updateView(); // Assuming updateView() switches the view and updates the UI
    }
}

// Function to initialize the dashboard
function initializeDashboard(userId) {
    const recordingsRef = collection(db, `users/${userId}/recordings`);
    onSnapshot(recordingsRef, (querySnapshot) => {
        const updatedRecordings = [];
        querySnapshot.forEach((doc) => {
            updatedRecordings.push({ id: doc.id, ...doc.data() });
        });
        // Use the current view to decide which view to create
        if (currentView === 'list') {
            createListView(updatedRecordings);
        } else {
            createThumbnailView(updatedRecordings);
        }
    });
}

// Function to update the dashboard view
function updateView() {
    if (currentView === 'thumbnail') {
        // Clear existing content
        dashboardContainer.innerHTML = '';
        // Add any necessary classes to dashboardContainer for thumbnail view
        // Possibly call a function to create and show the thumbnails
        createThumbnailView();
    } else {
        // Handle switching to list view if necessary
    }
}


// Function to create a list view
function createListView(recordings) {
    console.log('Creating List View');
    dashboardContainer.innerHTML = ''; // Clear the container
    // ... Complete implementation for creating a list view...
}

// Function to create a thumbnail view
function createThumbnailView(recordings) {
    console.log('Creating Thumbnail View');
    dashboardContainer.innerHTML = ''; // Clear the container
    const thumbnailContainer = document.createElement('div');
    thumbnailContainer.className = 'thumbnail-container';
    recordings.forEach(recording => {
        const thumbnail = document.createElement('div');
        thumbnail.className = 'recording-thumbnail';
        thumbnail.innerHTML = `
            <img class="recording-thumbnail-img" src="${recording.thumbnailUrl}" alt="${recording.name}">
            <div class="recording-info">
                <div class="recording-title">${recording.name}</div>
                <div class="recording-date">${formatDate(recording.createdAt)}</div>
            </div>
        `;
        thumbnailContainer.appendChild(thumbnail);
    });
    dashboardContainer.appendChild(thumbnailContainer);
}


// Function to load and display recordings
async function loadAndDisplayRecordings(userId) {
    try {
        console.log(`Loading recordings for user: ${userId}`);
        const recordings = await fetchUserRecordings(userId);
        console.log('Recordings fetched successfully:', recordings);
        createSortableTable(recordings);
    } catch (error) {
        console.error('Failed to load recordings:', error);
        dashboardContainer.innerHTML = '<p>Error loading recordings. Please try again later.</p>';
    }
}

// Function to create a sortable table with recordings data
function createSortableTable(recordings) {
    // Create table elements
    const table = document.createElement('table');
    table.className = 'recordings-table';
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    table.appendChild(thead);
    table.appendChild(tbody);

    // Define table headers, including a 'Thumbnail' column
    const headers = ['Thumbnail', 'Name', 'Size', 'Link', 'Created Date', 'Last Modified'];
    const headerRow = document.createElement('tr');
    headers.forEach(headerText => {
        const header = document.createElement('th');
        header.textContent = headerText;
        headerRow.appendChild(header);
    });
    thead.appendChild(headerRow);

    // Populate the table body with recordings data
    recordings.forEach(recording => {
        const row = document.createElement('tr');

        // Add a cell with the thumbnail
        const thumbnailCell = document.createElement('td');
        const thumbnailImg = document.createElement('img');
        thumbnailImg.src = recording.thumbnailUrl; // Assuming 'thumbnailUrl' is part of your recording object
        thumbnailImg.className = 'table-thumbnail'; // Use class to style the image
        thumbnailCell.appendChild(thumbnailImg);
        row.appendChild(thumbnailCell);

        // Other cells for data
        row.innerHTML += `
        <td>${recording.name || 'Unnamed'}</td>
        <td>${formatBytes(recording.size)}</td>
        <td><a href="${recording.url}" target="_blank">Link</a></td>
        <td>${formatDate(recording.createdAt)}</td>
        <td>${formatDate(recording.lastModified)}</td>
    `;
        tbody.appendChild(row);
    });


    // Clear existing content and append the table to the dashboard container
    dashboardContainer.innerHTML = '';
    dashboardContainer.appendChild(table);
}


// Function to initialize sorting for the table
function initializeTableSorting(table) {
    const headers = table.querySelectorAll('th[data-sortable="true"]');
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const columnIndex = Array.from(header.parentNode.children).indexOf(header);
            const isAscending = header.classList.toggle('ascending');
            sortTableByColumn(table, columnIndex, isAscending);
        });
    });
}

// Function to sort the table by a specific column
function sortTableByColumn(table, columnIndex, ascending) {
    const tbody = table.tBodies[0];
    const rows = Array.from(tbody.querySelectorAll('tr'));

    const sortedRows = rows.sort((a, b) => {
        const aText = a.cells[columnIndex].textContent.trim();
        const bText = b.cells[columnIndex].textContent.trim();
        return ascending ? aText.localeCompare(bText) : bText.localeCompare(aText);
    });

    // Re-add the sorted rows to the tbody
    tbody.innerHTML = '';
    tbody.append(...sortedRows);
}

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



// Export the function to be called from main.js
export { loadAndDisplayRecordings };
