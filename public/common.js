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

// Call fetchAndDisplayRecordings when the page loads
window.onload = () => {
    const user = auth.currentUser;
    if (user) {
        fetchAndDisplayRecordings(user.uid);
    } else {
        console.error('No authenticated user.');
    }
};

export { fetchAndDisplayRecordings };