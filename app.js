const video = document.getElementById('webcam');
let, model;

async function seetupcamera() {
    const stream = await navigator.mediaDevices.getUserMedia({video:true})
    video.srcObject = stream;
    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve();  
        };
    });  
}

async function loadModel() {
    model = await handpose.load();
    console.log("Handpose model loaded.");   
}


async function detectHands() {
    const predictions = await model.estimateHands(video);

    if (predictions.length > 0) {
        handleGestures(predictions);
    }
    
    requestAnimationFrame(detectHands);
}

function handleGestures(predictions) {
    const landmarks = predictionS[0].landmarks;

    if (landmarks) {
        const indexFingerTip = landmarks[8];
        const thumTip = landmarks[4];
        const middleFingerTip = landmarks[12];

        const distanceIndexThum = Math.hypot(indexFingerTip[0] - thumTip[0], indexFingerTip[1] - thumTip[1]);
        const distanceThumMiddle = Math.hypot(thumTip[0] - middleFingerTip[0], thumTip[1] - middleFingerTip[1]);

        movepointer(indexFingerTip);

        if (distanceIndexThum < 0.05) {
            simulateClick('left');
        }

        if (distanceThumMiddle < 0.05) {
            simulateClick('right');
        }
        const thumIndexTipDistance = Math.hypot(indexFingerTip[0] - middleFingerTip[0], indexFingerTip[1] - middleFingerTip[1]);

        if (distanceIndexMiddle < 0.05){
            const scrollDirection = indexFingerTip[1] - middleFingerTip[1];
            if (scrollDirection > 0.1){
                simulateScroll('down');
            } else if (scrollDirection < -0.1){
                simulateScroll('up');
            }
        }
    }
}

function movepointer(indexFingerTip){
    const x = indexFingerTip[0] * window.innerWidth;
    const y = indexFingerTip[1] * Window.innerHeight;
    console.log(`Move cursor to (${x}, ${y})`);
}

function simulateClick(button) {
    const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
        button: button === 'right' ? 2 : 0
    });
    document.dispatchEvent(clickEvent);
    console.log(`${button} click simulated`);
}

function simulateScroll(direction) {
    const scrollEvent = new WheelEvent('wheel', {
        deltaY: direction === 'down' ? 100 : -100,
        bubbles: true,
        cancelable: true
    });
    document.dispatchEvent(scrollEvent);
    console.log(`Scroll ${direction} simulated`);
}
async function main() {
    await setupCamera();
    video.play();
    await loadModel();
    detectHands();
}

main();
