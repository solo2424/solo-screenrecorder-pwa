// dragVideo.js
export function initializeDraggableWebcam() {
    const draggableWebcam = document.getElementById('draggable-webcam');
    const videoContainer = document.getElementById('previewContainer'); // Make sure this ID matches your HTML

    if (!draggableWebcam) {
        console.error("Draggable webcam element not found. Ensure the element with id 'draggable-webcam' is present.");
        return;
    }

    if (!videoContainer) {
        console.error("Video container element not found. Ensure the element with id 'previewContainer' is present.");
        return;
    }

    let isDragging = false;
    let offsetX, offsetY;

    console.log("Initializing draggable webcam functionality");

    draggableWebcam.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - draggableWebcam.getBoundingClientRect().left;
        offsetY = e.clientY - draggableWebcam.getBoundingClientRect().top;
        console.log(`Drag started at (${offsetX}, ${offsetY})`);
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        let leftPosition = e.clientX - offsetX;
        let topPosition = e.clientY - offsetY;

        // Restrict movement within the video container
        leftPosition = Math.max(0, Math.min(leftPosition, videoContainer.offsetWidth - draggableWebcam.offsetWidth));
        topPosition = Math.max(0, Math.min(topPosition, videoContainer.offsetHeight - draggableWebcam.offsetHeight));

        draggableWebcam.style.left = leftPosition + 'px';
        draggableWebcam.style.top = topPosition + 'px';
        console.log(`Dragging to (${leftPosition}, ${topPosition})`);
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            console.log("Drag ended");
            isDragging = false;
        }
    });

    draggableWebcam.addEventListener('dragstart', (e) => {
        e.preventDefault();
        console.log("Default drag action prevented");
    });
}

document.addEventListener('DOMContentLoaded', initializeDraggableWebcam);
