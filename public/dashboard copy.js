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

        // Context menu structure
        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';

        const contextMenuButton = document.createElement('button');
        contextMenuButton.className = 'context-menu-button';
        contextMenuButton.textContent = '⋮'; // Vertical ellipsis

        // Context menu content
        const contextMenuContent = document.createElement('div');
        contextMenuContent.className = 'context-menu-content';

        // Event listener for context menu button
        contextMenuButton.addEventListener('click', (event) => {
            console.log("Context menu button clicked");
            showContextMenu(event, contextMenuButton, contextMenuContent);
        });

        contextMenuButton.addEventListener('mouseover', (event) => {
            console.log("Mouse over context menu button");
            showContextMenu(event, contextMenuButton, contextMenuContent);
        });

        // Hide context menu on mouse leave
        contextMenuContent.addEventListener('mouseleave', () => {
            console.log("Mouse left context menu content");
            contextMenuContent.style.display = 'none';
            if (contextMenuContent.parentNode === document.body) {
                document.body.removeChild(contextMenuContent);
            }
        });


        // Existing click event listener
        contextMenuButton.onclick = (event) => showContextMenu(event, contextMenuButton, contextMenuContent);
        contextMenuButton.onmouseover = (event) => showContextMenu(event, contextMenuButton, contextMenuContent);


        const deleteLink = document.createElement('a');
        deleteLink.href = '#';
        deleteLink.textContent = 'Delete';
        deleteLink.onclick = async (event) => {
            event.preventDefault();
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

        const downloadLink = document.createElement('a');
        downloadLink.textContent = 'Download';
        // Fetch the file data and create a Blob URL for the download link
        fetch(recording.url, { cache: 'no-store' })
            .then(response => response.blob())
            .then(blob => {
                const url = URL.createObjectURL(blob);
                downloadLink.href = url;
                downloadLink.download = recording.name;
            })
            .catch(console.error);


        // Append children to context menu content
        contextMenuContent.appendChild(deleteLink);
        contextMenuContent.appendChild(downloadLink);

        // Append context menu button and content to context menu div
        contextMenu.appendChild(contextMenuButton);
        contextMenu.appendChild(contextMenuContent);

        // Add CSS styles to align children vertically in the middle
        infoDiv.style.display = 'flex';
        infoDiv.style.flexDirection = 'row';
        infoDiv.style.justifyContent = 'space-between';
        infoDiv.style.alignItems = 'center'; // Add this line

        // Create a new div to wrap the name and date
        const textDiv = document.createElement('div');
        textDiv.style.display = 'flex';
        textDiv.style.flexDirection = 'column';
        textDiv.style.flexGrow = '1';
        textDiv.style.flexShrink = '1';
        textDiv.style.overflow = 'hidden'; // Add this line

        // Append the name and date to the new div
        textDiv.appendChild(titleDiv);
        textDiv.appendChild(dateDiv);

        // Append the new div and the context menu to the infoDiv
        infoDiv.appendChild(textDiv);
        infoDiv.appendChild(contextMenu);



        // Append children to thumbnail div
        thumbnail.appendChild(thumbnailImg);
        thumbnail.appendChild(infoDiv);

        // Append thumbnail div to the grid container
        gridContainer.appendChild(thumbnail);

        // Format the recording name and date
        titleDiv.textContent = ` ${recording.name}`;
        dateDiv.textContent = ` ${formatDate(recording.createdAt)}`;

        titleDiv.className = 'recording-title truncate';
        dateDiv.className = 'recording-date truncate';

        gridContainer.appendChild(thumbnail);

    }
