// Import the necessary modules from TensorFlow.js and MediaPipe
const videoElement = document.getElementById('webcam');
const canvasElement = document.createElement('canvas');
const canvasCtx = canvasElement.getContext('2d');

let model;
let videoWidth, videoHeight;
let handDetector;

// Load the MediaPipe hand model and setup the webcam feed
async function setupWebcam() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoElement.srcObject = stream;

    await new Promise((resolve) => {
        videoElement.onloadedmetadata = () => {
            resolve(videoElement);
        };
    });

    videoWidth = videoElement.videoWidth;
    videoHeight = videoElement.videoHeight;

    videoElement.width = videoWidth;
    videoElement.height = videoHeight;
    canvasElement.width = videoWidth;
    canvasElement.height = videoHeight;

    document.body.appendChild(canvasElement);
}

// Initialize the hand detection model
async function loadModel() {
    model = await handpose.load();
    console.log("Handpose model loaded");
    detectHands();
}

// Main loop to detect hands and control the mouse
async function detectHands() {
    while (true) {
        const predictions = await model.estimateHands(videoElement);
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

        if (predictions.length > 0) {
            const hand = predictions[0].landmarks;

            // Index finger tip and middle finger tip coordinates
            const indexFingerTip = hand[8];
            const middleFingerTip = hand[12];
            const thumbTip = hand[4];

            // Move the mouse pointer
            const x = indexFingerTip[0];
            const y = indexFingerTip[1];
            moveMouse(x, y);

            // Detect left click (thumb + index finger)
            const distanceThumbIndex = calculateDistance(thumbTip, indexFingerTip);
            if (distanceThumbIndex < 30) {
                performClick('left');
            }

            // Detect right click (thumb + middle finger)
            const distanceThumbMiddle = calculateDistance(thumbTip, middleFingerTip);
            if (distanceThumbMiddle < 30) {
                performClick('right');
            }

            // Detect scrolling (index finger + middle finger)
            const scrollDistance = calculateDistance(indexFingerTip, middleFingerTip);
            if (scrollDistance < 30) {
                scrollVertically(indexFingerTip, middleFingerTip);
            }

            // Draw the hand landmarks on the canvas
            drawHand(hand);
        }

        await tf.nextFrame();
    }
}

// Move the mouse pointer based on hand coordinates
function moveMouse(x, y) {
    // Scale the coordinates to the screen dimensions
    const screenX = (x / videoWidth) * window.innerWidth;
    const screenY = (y / videoHeight) * window.innerHeight;

    // Move the pointer (this simulates the movement)
    canvasElement.style.cursor = 'none';  // Hide the cursor
    canvasElement.style.left = `${screenX}px`;
    canvasElement.style.top = `${screenY}px`;
}

// Perform a click (left or right)
function performClick(button) {
    const event = new MouseEvent(button === 'left' ? 'click' : 'contextmenu', {
        bubbles: true,
        cancelable: true,
        view: window
    });
    document.dispatchEvent(event);
}

// Calculate the Euclidean distance between two points
function calculateDistance(point1, point2) {
    const dx = point1[0] - point2[0];
    const dy = point1[1] - point2[1];
    return Math.sqrt(dx * dx + dy * dy);
}

// Scroll the page vertically
function scrollVertically(point1, point2) {
    const dy = point2[1] - point1[1];
    window.scrollBy(0, dy * 0.1);  // Adjust the scroll speed here
}

// Draw the hand landmarks on the canvas
function drawHand(hand) {
    for (let i = 0; i < hand.length; i++) {
        const x = hand[i][0];
        const y = hand[i][1];
        canvasCtx.beginPath();
        canvasCtx.arc(x, y, 5, 0, 2 * Math.PI);
        canvasCtx.fillStyle = 'silver';
        canvasCtx.fill();
    }
}

// Start the application
setupWebcam().then(loadModel);
