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


// ensure Play button shows correct initial label
playBtn.textContent = "Play";


let stream;
let cameraActive = false;
let isPlaying = false;

let speed = 60; // pixels per second
let lastTime = null;
let rafId = null;

textEditor.value = localStorage.getItem("savedScript") || "";


function animate(time) {
    if (!lastTime) lastTime = time;
    const delta = (time - lastTime) / 1000; // seconds
    lastTime = time;
    // position -= speed * delta;
    textSection.scrollTop += speed * delta;
    // if (textWrapper) textWrapper.style.transform = `translateY(${position}px)`;
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
    EditorScreen.style.display = "none";

    localStorage.setItem(
        "savedScript",
        textEditor.value
    );
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

            toggle_Scroll();

        } catch(error){
            console.error(error);
            alert("Could not access camera.");
        }
    }
    else{
        toggle_Scroll();

        cameraActive = false

        stream.getTracks().forEach(track => track.stop());
        stream = null
        video.srcObject = null;

        startBtn.textContent = "Start Recording"
        startBtn.style.background = "white"
        startBtn.style.color = "black"

    }

});


