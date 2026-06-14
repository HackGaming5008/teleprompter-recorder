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
const speedSlider = document.getElementById("speedSlider");
const fontSize = document.getElementById("fontSize");

// ensure Play button shows correct initial label
playBtn.textContent = "Play";


let stream;
let cameraActive = false;
let isPlaying = false;

let speed = 60; // pixels per second
speedSlider.value = speed;
let lastTime = null;
let rafId = null;


let mediaRecorder;
let recordedChunks = [];
let isRecording = false;

textEditor.value = localStorage.getItem("savedScript") || "";
textSection.textContent = textEditor.value;

window.addEventListener("load", startCam);

async function startCam() {
    try{
        cameraActive = true

        stream = await navigator.mediaDevices.getUserMedia({
            video:{
                facingMode: "user"
            },
            audio: true
        });

        video.srcObject = stream;

    } catch(error){
        console.error(error);
        alert(error.message);
    }
};




const savedFontSize =
    localStorage.getItem("fontSize");

if(savedFontSize){
    fontSize.value = savedFontSize;
    textSection.style.fontSize = savedFontSize;
}

function startRecording(){
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) =>{
        if (event.data.size > 0){
            recordedChunks.push(event.data);

        }
    }

    mediaRecorder.onstop = saveRecording;
    mediaRecorder.start();
    isRecording = true;
};

function saveRecording() {

    const blob = new Blob(
        recordedChunks,
        { type: "video/webm" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download =
        `recording_${Date.now()}.webm`;

    document.body.appendChild(a);

    a.click();

    a.remove();

    URL.revokeObjectURL(url);

    recordedChunks = [];
}

function animate(time) {
    if (!lastTime) lastTime = time;
    const delta = (time - lastTime) / 1000; // seconds
    lastTime = time;
    textSection.scrollTop += speed * delta;
    rafId = requestAnimationFrame(animate);
};

function toggle_Scroll(){
    isPlaying = !isPlaying;
    if (isPlaying) {
        playBtn.textContent = "Pause";
        // textSection.style.overflow = "hidden";
        // start animation
        lastTime = null;
        if (!rafId){
            rafId = requestAnimationFrame(animate);
        }
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
};

fontSize.addEventListener("change", () => {

    textSection.style.fontSize =
        fontSize.value;

    localStorage.setItem(
        "fontSize",
        fontSize.value
    );
});

speedSlider.addEventListener("input", () => { 
    speed= Number(speedSlider.value);
});


// Toggle play/pause and start/stop the animation loop
playBtn.addEventListener("click", () => {
    toggle_Scroll()
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
    isPlaying = false;
    playBtn.textContent = "Play";
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    lastTime = null;
    
    localStorage.setItem(
        "savedScript",
        textEditor.value
    );
    textSection.textContent = textEditor.value;
    
    textSection.scrollTop = 0;
    EditorScreen.style.display = "none";
});

startBtn.addEventListener("click", () =>{
    if (!isRecording){
        startRecording();
    
        startBtn.textContent = "Stop Recording"
        startBtn.style.background = "#b32727"
        startBtn.style.color = "white"
    
        toggle_Scroll();
    }
    else{
        mediaRecorder.stop();
        isRecording = false;
        toggle_Scroll();
        startBtn.textContent = "Start Recording"
        startBtn.style.background = "#ffffff"
        startBtn.style.color = "black"
    }


});


