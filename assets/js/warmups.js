const timerMinutes = document.getElementById("timer-minutes");
const timerSeconds = document.getElementById("timer-seconds");
const timerDisplay = document.getElementById("timer");
const timerInput = document.getElementById("timer-input");
const timerBlock = document.getElementById("timer-block");
const scoreBlock = document.getElementById("score-block");
const skipButton = document.getElementById("skip");
const nextButton = document.getElementById("next");
const startButton = document.getElementById("start");
const resetButton = document.getElementById("reset");
const scoreButtons = document.getElementById("score-buttons");
const checkmark = document.getElementById("checkmark")
const badButton = document.getElementById("bad");
const okayButton = document.getElementById("okay");
const goodButton = document.getElementById("good");

let generatorShowing = true;

let timerState = "idle";
let currentTimeInSeconds = 300;
let timerInterval = null;
let timerAudioContext = null;

function sanitizeTimerInput(input, maxValue) {
    if (!input) {
        return;
    }

    const digits = input.value.replace(/\D/g, "");

    if (!digits) {
        input.value = "";
        return;
    }

    const numericValue = Math.min(Math.max(Number(digits), 0), maxValue);
    input.value = String(numericValue).padStart(2, "0");
}

function formatTime(totalSeconds) {
    const safeSeconds = Math.max(0, totalSeconds);
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function playTimerElapsedSound() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
        return;
    }

    if (!timerAudioContext) {
        timerAudioContext = new AudioContextClass();
    }

    if (timerAudioContext.state === "suspended") {
        timerAudioContext.resume();
    }

    const oscillator = timerAudioContext.createOscillator();
    const gainNode = timerAudioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, timerAudioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(440, timerAudioContext.currentTime + 0.35);

    gainNode.gain.setValueAtTime(0.0001, timerAudioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.2, timerAudioContext.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, timerAudioContext.currentTime + 0.45);

    oscillator.connect(gainNode);
    gainNode.connect(timerAudioContext.destination);

    oscillator.start();
    oscillator.stop(timerAudioContext.currentTime + 0.5);
}

function getInitialSeconds() {
    const minutes = Number(timerMinutes?.value || 0);
    const seconds = Number(timerSeconds?.value || 0);
    return minutes * 60 + seconds;
}

function updateTimerDisplay() {
    if (timerDisplay) {
        timerDisplay.textContent = formatTime(currentTimeInSeconds);
    }
}

function updateTimerVisibility() {
    const isActive = timerState === "running" || timerState === "paused";

    if (timerDisplay) {
        timerDisplay.classList.toggle("hidden", timerState === "idle" || timerState === "elapsed");
    }

    if (timerInput) {
        timerInput.classList.toggle("hidden", isActive);
    }

    if (timerBlock) {
        timerBlock.classList.toggle("hidden", timerState === "elapsed");
    }

    if (scoreBlock) {
        scoreBlock.classList.toggle("hidden", timerState !== "elapsed");
    }

    if (skipButton) {
        skipButton.classList.toggle("hidden", timerState === "elapsed");
    }

    if (nextButton) {
        nextButton.classList.toggle("hidden", timerState !== "elapsed");
    }
}

function updateTimerButton() {
    if (!startButton) {
        return;
    }

    if (timerState === "running") {
        startButton.id = "pause";
        startButton.textContent = "Pause";
    } else {
        startButton.id = "start";
        startButton.textContent = "Start";
    }
}

function startTimer() {
    if (timerState === "running") {
        return;
    }

    if (timerState === "idle") {
        currentTimeInSeconds = getInitialSeconds();
    }

    timerState = "running";
    updateTimerButton();
    updateTimerDisplay();
    updateTimerVisibility();

    if (timerInterval) {
        clearInterval(timerInterval);
    }

    timerInterval = setInterval(() => {
        currentTimeInSeconds -= 1;
        updateTimerDisplay();

        if (currentTimeInSeconds <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            timerState = "elapsed";
            currentTimeInSeconds = 0;
            playTimerElapsedSound();
            updateTimerDisplay();
            updateTimerButton();
            updateTimerVisibility();
        }
    }, 1000);
}

function pauseTimer() {
    if (timerState !== "running") {
        return;
    }

    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    timerState = "paused";
    updateTimerButton();
    updateTimerVisibility();
}

function resetTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    timerState = "idle";
    timerMinutes.value = "05";
    timerSeconds.value = "00";
    currentTimeInSeconds = 300;
    updateTimerDisplay();
    updateTimerButton();
    updateTimerVisibility();
}

function setupTimerInput(input, maxValue, nextInput) {
    if (!input) {
        return;
    }

    input.addEventListener("keydown", (e) => {
        const allowedKeys = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End"];

        if (allowedKeys.includes(e.key) || /^\d$/.test(e.key)) {
            return;
        }

        e.preventDefault();
    });

    input.addEventListener("input", () => {
        const typedDigits = input.value.replace(/\D/g, "").length;
        sanitizeTimerInput(input, maxValue);

        if (nextInput && typedDigits >= 2) {
            nextInput.focus();
            nextInput.select();
        }
    });
}

setupTimerInput(timerMinutes, 60, timerSeconds);
setupTimerInput(timerSeconds, 59);

if (startButton) {
    startButton.addEventListener("click", () => {
        if (timerState === "running") {
            pauseTimer();
        } else {
            startTimer();
        }
    });
}

if (resetButton) {
    resetButton.addEventListener("click", resetTimer);
}

function initializeWarmupsPage() {
    updateTimerDisplay();
    updateTimerButton();
    updateTimerVisibility();
    badButton.addEventListener("click", toggleCheckmark);
    okayButton.addEventListener("click", toggleCheckmark);
    goodButton.addEventListener("click", toggleCheckmark);
    badButton.addEventListener("click", badButtonClick);
    okayButton.addEventListener("click", okayButtonClick);
    goodButton.addEventListener("click", goodButtonClick);
    
    skipButton.addEventListener("click", generateExercise);
    nextButton.addEventListener("click", generateExercise);

    generateExercise();
}

Promise.resolve(window.firstTimeLoadReady)
    .catch(() => undefined)
    .then(() => {
        initializeWarmupsPage();
    });


function toggleCheckmark(event){
    if(scoreButtons){
        scoreButtons.classList.toggle("hidden");
    }
    if(checkmark){
        checkmark.classList.toggle("hidden")
    }
}

function badButtonClick(event){
    checkmark.innerHTML = "That's fine!"
    adjustCurrentExerciseRange(-1);
}

function okayButtonClick(event){
    checkmark.innerHTML = "Great!"
}

function goodButtonClick(event){
    checkmark.innerHTML = "Good job!"
    adjustCurrentExerciseRange(1);
}

function getStoredInnerButtonRecords() {
    try {
        const storedRecords = JSON.parse(localStorage.getItem("inner-button-selections") || "[]");
        return Array.isArray(storedRecords) ? storedRecords : [];
    } catch (error) {
        return [];
    }
}

function saveStoredInnerButtonRecords(records) {
    localStorage.setItem("inner-button-selections", JSON.stringify(records));
}

function adjustCurrentExerciseRange(delta) {
    const title = document.getElementById("title");
    if (!title) {
        return;
    }

    const currentLabel = title.textContent.trim();
    if (!currentLabel || currentLabel === "No exercises selected. Please select at least one exercise in the settings.") {
        return;
    }

    const storedRecords = getStoredInnerButtonRecords();
    const recordIndex = storedRecords.findIndex((record) => {
        return record && typeof record === "object" && record.label === currentLabel;
    });

    if (recordIndex === -1) {
        return;
    }

    const currentRecord = storedRecords[recordIndex];
    const currentRange = Number(currentRecord.range);
    const safeCurrentRange = Number.isFinite(currentRange) ? currentRange : 1;
    const updatedRange = Math.min(5, Math.max(1, safeCurrentRange + delta));

    storedRecords[recordIndex] = {
        ...currentRecord,
        range: String(updatedRange),
    };

    saveStoredInnerButtonRecords(storedRecords);
}

function getExerciseWeight(exercise) {
    const rangeValue = Number(exercise?.range);

    if (!Number.isFinite(rangeValue)) {
        return 1;
    }

    return Math.max(1, 6 - rangeValue);
}

function pickWeightedExercise(exercisePool) {
    const weightedPool = exercisePool
        .map((exercise) => {
            return {
                exercise,
                weight: getExerciseWeight(exercise),
            };
        })
        .filter((entry) => entry.weight > 0);

    if (weightedPool.length === 0) {
        return null;
    }

    const totalWeight = weightedPool.reduce((sum, entry) => sum + entry.weight, 0);
    let randomWeight = Math.random() * totalWeight;

    for (const entry of weightedPool) {
        randomWeight -= entry.weight;

        if (randomWeight <= 0) {
            return entry.exercise;
        }
    }

    return weightedPool[weightedPool.length - 1].exercise;
}

function findCustomExerciseByLabel(customExercises, label) {
    const normalizedLabel = typeof label === "string" ? label.trim().toLowerCase() : "";

    if (!normalizedLabel) {
        return null;
    }

    return customExercises.find((exercise) => {
        return exercise && typeof exercise === "object" && typeof exercise.name === "string"
            && exercise.name.trim().toLowerCase() === normalizedLabel;
    }) || null;
}


async function generateExercise() {
    const title = document.getElementById("title");
    const group = document.getElementById("group");
    const subgroup = document.getElementById("subgroup");
    const img = document.querySelector("#exercise #img-and-buttons img");
    const imgContainer = document.querySelector("#exercise #img-and-buttons");
    const instructionsh1 = document.querySelector("#exercise #instructions-and-goal #instructions h1");
    const instructionsmd = document.querySelector("#exercise #instructions-and-goal #instructions div#instructions-content");
    if (!title || !img || !instructionsmd || !group || !subgroup || !imgContainer || !instructionsh1) {
        return;
    }
    const storedSelections = getStoredInnerButtonSelections();
    const customExercises = getStoredCustomExercises();
    console.log("customExercises:", customExercises);

    if (storedSelections.length === 0) {
        title.textContent = "No exercises selected. Please select at least one exercise in the settings.";
        group.textContent = "";
        subgroup.textContent = "";
        img.src = "";
        imgContainer.classList.add("hidden");
        instructionsmd.textContent = "";
        instructionsh1.textContent = "";
        return;
    }

    const exercisePool = storedSelections.filter(obj => obj.selected === true);

    console.log("Exercise Pool:", exercisePool);

    const currentExerciseLabel = title.textContent.trim();
    const availableExercisePool = exercisePool.filter((exercise) => {
        return exercise?.label?.trim() !== currentExerciseLabel;
    });
    const poolToUse = availableExercisePool.length > 0 ? availableExercisePool : exercisePool;
    const selectedExercise = pickWeightedExercise(poolToUse);

    if (!selectedExercise) {
        title.textContent = "No exercises selected. Please select at least one exercise in the settings.";
        group.textContent = "";
        subgroup.textContent = "";
        img.src = "";
        imgContainer.classList.add("hidden");
        instructionsmd.textContent = "";
        instructionsh1.textContent = "";
        return;
    }

    console.log("Selected Exercise:", selectedExercise);
    const label = selectedExercise.label;
    const customExercise = selectedExercise?.isCustomExercise
        ? findCustomExerciseByLabel(customExercises, label)
        : null;

    if (selectedExercise?.isCustomExercise) {
        if (!customExercise) {
            title.textContent = "Exercise data not found";
            group.textContent = "";
            subgroup.textContent = "";
            img.src = "";
            imgContainer.classList.add("hidden");
            instructionsmd.textContent = "";
            return;
        }

        title.textContent = label.trim();
        group.textContent = "Custom exercises";
        subgroup.textContent = "";
        img.src = typeof customExercise.image === "string" ? customExercise.image.trim() : "";
        imgContainer.classList.toggle("hidden", !img.src);
        instructionsmd.innerHTML = typeof customExercise.instructions === "string"
            ? DOMPurify.sanitize(marked.parse(customExercise.instructions))
            : "";
        resetTimer();
        if(!checkmark.classList.contains("hidden")){
            toggleCheckmark();
        }
        return;
    }

    const trimmedLabel = label.replace(/\s+/g, "_").trim().toLowerCase();
    const response = await fetch(`assets/json/warmups/${trimmedLabel}.json`);
    const data = await response.json();
    if (!data) {
        title.textContent = "Exercise data not found";
        group.textContent = "";
        subgroup.textContent = "";
        instructionsmd.textContent = "";
        return;
    }
    title.textContent = label.trim();
    group.textContent = data.group + " > ";
    subgroup.textContent = data.subgroup;
    img.src = data.thumbnail;
    const markdownResponse = await fetch("assets/markdown/warmups/" + data.group.toLowerCase().trim() + "/" + trimmedLabel + ".md");
    const markdownContent = await markdownResponse.text();
    instructionsmd.innerHTML = marked.parse(markdownContent);
    resetTimer();
    if(!checkmark.classList.contains("hidden")){
        toggleCheckmark();
    }
    
}

function getStoredInnerButtonSelections() {
    try {
        const storedSelections = JSON.parse(localStorage.getItem("inner-button-selections") || "[]");
        if (!Array.isArray(storedSelections)) {
            return [];
        }

        return storedSelections
            .filter((selection) => {
                return selection && typeof selection === "object" && typeof selection.label === "string";
            })
            .map((selection) => {
                return {
                    ...selection,
                    selected: Boolean(selection.selected),
                    isCustomExercise: Boolean(selection.isCustomExercise),
                };
            });
    } catch (error) {
        return [];
    }
}

function getStoredCustomExercises() {
    try {
        const storedExercises = JSON.parse(localStorage.getItem("custom-exercises") || "[]");
        return Array.isArray(storedExercises) ? storedExercises : [];
    } catch (error) {
        return [];
    }
}