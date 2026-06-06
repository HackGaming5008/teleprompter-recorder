const video = document.getElementById("Camera");
const startBtn = document.getElementById("startRecording");


const saveBtn = document.getElementById("editSaveBtn");
const editCloseBtn = document.getElementById("editCloseBtn");
const editDiscardBtn = document.getElementById("editDiscardBtn");
const EditorScreen = document.getElementById("editorScreen");
const textEditor = document.getElementById("textEditor");
const textSection = document.getElementById("textSection");

const editorBtn = document.getElementById("editorBtn");
const playBtn = document.getElementById("playBtn");

// ensure Play button shows correct initial label
playBtn.textContent = "Play";

let textWrapper = null;

let stream;
let cameraActive = false;
let isPlaying = false;

let position = 0;
let speed = 60; // pixels per second
let lastTime = null;
let rafId = null;

function animate(time) {
    if (!lastTime) lastTime = time;
    const delta = (time - lastTime) / 1000; // seconds
    lastTime = time;
    position -= speed * delta;
    if (textWrapper) textWrapper.style.transform = `translateY(${position}px)`;
    rafId = requestAnimationFrame(animate);
}

// Toggle play/pause and start/stop the animation loop
playBtn.addEventListener("click", () => {
    isPlaying = !isPlaying;
    if (isPlaying) {
        playBtn.textContent = "Pause";
        textSection.style.overflow = "hidden";
        // start animation
        lastTime = null;
        rafId = requestAnimationFrame(animate);
    } else {
        playBtn.textContent = "Play";
        textSection.style.overflow = "auto";

        // stop animation
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
        lastTime = null;
    }
});

// Open editor screen when Editor button clicked
editorBtn.addEventListener("click", () => {
    EditorScreen.style.display = "flex";
});

// Clear text when Close/Clear button clicked
if (editCloseBtn) {
    editCloseBtn.addEventListener("click", () => {
        textEditor.value = "";
    });
}

// Hide editor when Discard clicked
if (editDiscardBtn) {
    editDiscardBtn.addEventListener("click", () => {
        EditorScreen.style.display = "none";
    });
}

saveBtn.addEventListener("click", async () => {
    // create or update inner wrapper so we animate the content only
    if (textSection.firstElementChild && textSection.firstElementChild.id === 'textContentWrapper'){
        textWrapper = textSection.firstElementChild;
    } else {
        textSection.innerHTML = '';
        textWrapper = document.createElement('div');
        textWrapper.id = 'textContentWrapper';
        textSection.appendChild(textWrapper);
    }
    textWrapper.textContent = textEditor.value;
    // reset scroll position and stop playback
    position = 0;
    if (textWrapper) textWrapper.style.transform = `translateY(${position}px)`;
    isPlaying = false;
    playBtn.textContent = "Play";
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    lastTime = null;
    EditorScreen.style.display = "none";
});

startBtn.addEventListener("click", async () =>{
    if (!cameraActive) {
        try{
            cameraActive = true

            stream = await navigator.mediaDevices.getUserMedia({
                video:{
                    facingMode: "user"
                },
                audio: true
            });

            video.srcObject = stream;

            startBtn.textContent = "Stop Recording"
            startBtn.style.background = "#b32727"
            startBtn.style.color = "white"

        } catch(error){
            console.error(error);
            alert("Could not access camera.");
        }
    }
    else{

        cameraActive = false

        stream.getTracks().forEach(track => track.stop());
        stream = null
        video.srcObject = null;

        startBtn.textContent = "Start Recording"
        startBtn.style.background = "white"
        startBtn.style.color = "black"
    }

});