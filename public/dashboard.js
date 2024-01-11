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

}  // End of realtime listener setup


function updateView() {
    dashboardContainer.innerHTML = '';
    if (currentView === 'thumbnail') {
        createThumbnailView(allRecordings);
    } else {
        createTableView(allRecordings);
    }
}

function setDefaultViewToThumbnails() {
    if (currentView !== 'thumbnail') {
        console.log('Setting default view to thumbnails');
        toggleView();
    }
}


//////////// Create Thumbnail View Code /////////////


function createThumbnailView(recordings) {
    const dashboardContainer = document.getElementById('dashboardContainer');
    const gridContainer = document.createElement('div');
    gridContainer.className = 'grid-container';

    recordings.forEach(recording => {
        const thumbnail = document.createElement('div');
        thumbnail.className = 'recording-thumbnail';

        const thumbnailImg = document.createElement('img');
        thumbnailImg.className = 'recording-thumbnail-img';
        thumbnailImg.src = recording.thumbnailUrl || 'images/default-thumbnail.png';
        thumbnailImg.alt = recording.name;
        thumbnailImg.addEventListener('click', () => displayRecordingDetails(recording));

        const infoDiv = document.createElement('div');
        infoDiv.className = 'recording-info';
        
        const titleDiv = document.createElement('div');
        titleDiv.className = 'recording-title truncate';
        titleDiv.textContent = recording.name;
        

        const dateDiv = document.createElement('div');
        dateDiv.className = 'recording-date truncate';
        dateDiv.textContent = formatDate(recording.createdAt);
        
        // Context menu container
        const contextMenuContainer = document.createElement('div');
        contextMenuContainer.className = 'context-menu-container';
        // contextMenuContainer.style.flexShrink = '0'; // Prevent the context menu from shrinking

        // Context menu button
        const contextMenuButton = document.createElement('button');
        contextMenuButton.className = 'context-menu-button';
        contextMenuButton.textContent = '⋮'; // Vertical ellipsis

        // Context menu content
        const contextMenuContent = document.createElement('div');

        // Event listener for context menu button
        contextMenuButton.addEventListener('click', function (event) {
            console.log("Context menu button clicked");
            showContextMenu(event, contextMenuButton, contextMenuContent, contextMenuContainer);
        });


        // Append context menu button and content to context menu container
        contextMenuContainer.appendChild(contextMenuButton);
        contextMenuContainer.appendChild(contextMenuContent);

        // Mouse leave event on context menu container
        contextMenuContainer.addEventListener('mouseleave', () => {
            console.log("Mouse left context menu container");
            contextMenuContent.style.display = 'none';
        });

        // Append the context menu container to the infoDiv
        infoDiv.appendChild(titleDiv);
        infoDiv.appendChild(dateDiv);
        infoDiv.appendChild(contextMenuContainer);

        // Append children to thumbnail div
        thumbnail.appendChild(thumbnailImg);
        thumbnail.appendChild(infoDiv);

        // Append thumbnail div to the grid container
        gridContainer.appendChild(thumbnail);
    });

    dashboardContainer.innerHTML = '';
    dashboardContainer.appendChild(gridContainer);
}

// function createListView(recordings) {
//     const listContainer = document.createElement('div');
//     listContainer.className = 'list-container';
//     recordings.forEach(recording => {
//         const listItem = document.createElement('div');
//         listItem.className = 'recording-list-item';
//         listItem.innerHTML = `
//             <div class="recording-thumbnail-container">
//                 <img class="recording-thumbnail-img" src="${recording.thumbnailUrl || 'images/default-thumbnail.png'}" alt="Thumbnail">
//             </div>
//             <div class="recording-info">
//                 <div class="recording-title">${recording.name}</div>
//                 <div class="recording-date">${formatDate(recording.createdAt)}</div>
//                 <div class="recording-size">${formatBytes(recording.size)}</div>
//             </div>
//         `;
//         listItem.addEventListener('click', () => displayRecordingDetails(recording));
//         listContainer.appendChild(listItem);
//     });
//     dashboardContainer.appendChild(listContainer);
// }


function createTableView(recordings) {
    // Create table container and table elements
    const tableContainer = document.createElement('div');
    tableContainer.className = 'table-container';

    const table = document.createElement('table');
    table.className = 'recordings-table';

    // Create and fill the header of the table
    const thead = document.createElement('thead');
    table.appendChild(thead);
    const headerRow = document.createElement('tr');
    ['Thumbnail', 'Name', 'Date', 'Size', 'Actions'].forEach((headerText, index) => {
        const header = document.createElement('th');
        header.textContent = headerText;
        // Add an onclick event to sort the table
        header.onclick = function () { sortTable(table, index); };
        headerRow.appendChild(header);
    });
    thead.appendChild(headerRow);

    // Create and fill the body of the table
    const tbody = document.createElement('tbody');
    recordings.forEach(recording => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${recording.thumbnailUrl || 'images/default-thumbnail.png'}" alt="Thumbnail" class="table-thumbnail-img"></td>
            <td>${recording.name}</td>
            <td>${formatDate(recording.createdAt)}</td>
            <td>${formatBytes(recording.size)}</td>
            <td>
                <button onclick="deleteRecording('${recording.id}')">Delete</button>
                <a href="${recording.url}" target="_blank" download="${recording.name}">Download</a>
            </td>
        `;
        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    // Append table to table container and then to dashboard
    tableContainer.appendChild(table);
    dashboardContainer.innerHTML = '';
    dashboardContainer.appendChild(tableContainer);
}

function showContextMenu(event, contextMenuButton, contextMenuContent, contextMenuContainer) {
    event.stopPropagation();
    console.log("Showing context menu");

    const rect = contextMenuButton.getBoundingClientRect();
    console.log("Button rect:", rect);

    contextMenuContent.style.position = 'absolute';
    contextMenuContent.style.top = `${rect.bottom}px`;
    contextMenuContent.style.left = `${rect.left}px`;
    contextMenuContent.style.display = 'block';

    console.log("Context menu styles:", contextMenuContent.style.cssText);

    if (contextMenuContent.parentNode !== contextMenuContainer) {
        console.log("Appending context menu content to container");
        contextMenuContainer.appendChild(contextMenuContent);
    }
}





// Function to sort the table
function sortTable(table, columnIndex) {
    const thead = table.querySelector("thead");
    const headerCell = thead.querySelector(`th:nth-child(${columnIndex + 1})`);
    const isAscending = headerCell.classList.contains('asc');
    const rows = Array.from(table.querySelector("tbody").rows);

    // Toggle ascending class on the header cell
    if (isAscending) {
        headerCell.classList.remove('asc');
        headerCell.classList.add('desc');
    } else {
        headerCell.classList.remove('desc');
        headerCell.classList.add('asc');
    }

    // Define a sorting function based on text content and direction
    const sortedRows = rows.sort((rowA, rowB) => {
        const cellA = rowA.cells[columnIndex].textContent.trim();
        const cellB = rowB.cells[columnIndex].textContent.trim();

        // Adjust this comparison for different data types if needed
        const compare = cellA.localeCompare(cellB, undefined, { numeric: true });

        return isAscending ? compare : -compare;
    });

    // Remove existing rows and re-add the newly sorted rows
    while (table.querySelector("tbody").firstChild) {
        table.querySelector("tbody").removeChild(table.querySelector("tbody").firstChild);
    }

    // Append sorted rows to tbody
    sortedRows.forEach(row => {
        table.querySelector("tbody").appendChild(row);
    });
}



function renderRecordings(recordings) {
    console.log("Rendering recordings:", recordings);
    dashboardContainer.innerHTML = '';
    if (currentView === 'thumbnail') {
        createThumbnailView(recordings);
    } else if (currentView === 'list') {  // This condition was changed to match the 'list' view
        createTableView(recordings);  // Call the new createTableView function here
    }
}


///////////////////////// Loading Progress Code /////////////////////////


function showUploadProgress(percentage) {
    document.getElementById('uploadProgressModal').classList.remove('hidden');
    document.getElementById('uploadProgressBar').value = percentage;
    document.getElementById('progressPercentage').textContent = `${percentage}%`;
}

function hideUploadProgress() {
    document.getElementById('uploadProgressModal').classList.add('hidden');
}

// You will call this function with the actual upload progress
function updateUploadProgress(progressEvent) {
    const percentage = (progressEvent.bytesTransferred / progressEvent.totalBytes) * 100;
    showUploadProgress(percentage);
}

// This is an example to simulate upload progress
function simulateUpload() {
    const totalSize = 100; // Total size of the file
    let uploaded = 0; // Uploaded bytes

    const interval = setInterval(() => {
        uploaded += 5; // Increase the uploaded bytes
        const percentage = (uploaded / totalSize) * 100;
        updateUploadProgress({ bytesTransferred: uploaded, totalBytes: totalSize });

        if (uploaded >= totalSize) {
            clearInterval(interval);
            hideUploadProgress();
        }
    }, 500);
}

// Call simulateUpload to see the progress modal in action
simulateUpload();

// Modify the toggleView function to call renderRecordings
function toggleView() {
    console.log('Toggling view from', currentView);
    currentView = currentView === 'list' ? 'thumbnail' : 'list';
    console.log('New view is', currentView);
    renderRecordings(allRecordings);  // Call renderRecordings with allRecordings
}


function displayRecordingDetails(recording) {
    console.log(`Displaying details for recording: ${recording.name}`);
    recordingContainer.style.display = 'block';
    dashboardContainer.style.display = 'none';

    playerContainer.innerHTML = `
        <video controls style="max-height: 65.5vh; width: 100%; object-fit: contain; border-radius: 10px 10px 0 0;" src="${recording.url}"></video>
        <div id="detailsContainer" style="max-height: 40vh; padding-left: 10px; overflow-y: auto; align-self: flex-end;">
            <h3>${recording.name}</h3>
            <p>Date: ${formatDate(recording.createdAt)}</p>
            <p>Size: ${formatBytes(recording.size)}</p>
            <button id="deleteRecordingButton" class="delete-button">Delete</button>
            <a id="downloadRecordingButton" class="download-button">Download</a>
        </div>
    `;

    setTimeout(() => {
        const deleteButton = document.getElementById('deleteRecordingButton');
        const downloadButton = document.getElementById('downloadRecordingButton');
        if (deleteButton && downloadButton) {
            deleteButton.onclick = async function () {
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

            // Fetch the file data and create a Blob URL for the download link
            fetch(recording.url, )
                .then(response => response.blob())
                .then(blob => {
                    const url = URL.createObjectURL(blob);
                    downloadButton.href = url;
                    downloadButton.download = recording.name;
                })
                .catch(console.error);
                
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


// Update the event listener to use toggleView
viewToggleButton.addEventListener('click', () => {
    toggleView();
    // No need to call loadAndDisplayRecordings here since toggleView will re-render the current view
});




export { loadAndDisplayRecordings, setDefaultViewToThumbnails, deleteRecording, fetchAndDisplayRecordings };
