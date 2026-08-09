document.addEventListener("DOMContentLoaded", setupAll);

const configuredInnerButtons = new WeakSet();
const modalView = document.querySelector("#modal-view");

function setupAll(){
    setupDirectoryButtons();
    setupInteriorButtons();
    restoreCustomExercises();
    restoreInnerButtonSelections();
    restoreInnerButtonRanges();
    syncMiddleButtonSelections();
    setupNewExerciseButton();
    setupModalView();
    setupExportImportButtons();
}

function getButtonIndicator(button) {
    const container = Array.from(button.childNodes).find((child) => {
        return child.nodeType === Node.ELEMENT_NODE && child.tagName === "DIV";
    });

    if (!container || !container.firstChild || container.firstChild.nodeType !== Node.ELEMENT_NODE) {
        return null;
    }

    return container.firstChild;
}

function getInnerButtonStorageKey(button) {
    const buttons = Array.from(document.querySelectorAll(".inner-button"));
    const index = buttons.indexOf(button);
    return `inner-button-${index}`;
}

function getInnerButtonLabel(button) {
    const labelSpan = button.querySelector("div span");
    return labelSpan ? labelSpan.textContent.trim() : "";
}

function saveInnerButtonSelections(selectedKeys) {
    localStorage.setItem("inner-button-selections", JSON.stringify(selectedKeys));
}

function saveCustomExercises(customExercises) {
    localStorage.setItem("custom-exercises", JSON.stringify(customExercises));
}

function getInnerButtonRange(button) {
    return button.querySelector('input[type="range"]');
}

function isCustomInnerButton(button) {
    return Boolean(button.closest("#custom-exercises-ul"));
}

function isNewExerciseButton(button) {
    return button && button.id === "new-exercise-button";
}

function getStoredInnerButtonRecords() {
    try {
        const storedRecords = JSON.parse(localStorage.getItem("inner-button-selections") || "[]");

        if (!Array.isArray(storedRecords)) {
            return [];
        }

        return storedRecords.filter((record) => {
            return record && typeof record === "object" && typeof record.key === "string";
        }).map((record) => {
            return {
                key: record.key,
                label: typeof record.label === "string" ? record.label : "",
                range: record.range !== undefined ? String(record.range) : "",
                selected: Boolean(record.selected),
                isCustomExercise: Boolean(record.isCustomExercise),
            };
        });
    } catch (error) {
        return [];
    }
}

function getStoredCustomExercises() {
    try {
        const storedExercises = JSON.parse(localStorage.getItem("custom-exercises") || "[]");

        if (!Array.isArray(storedExercises)) {
            return [];
        }

        return storedExercises
            .filter((exercise) => {
                return exercise && typeof exercise === "object";
            })
            .map((exercise) => {
                const parsedRange = Number(exercise.range);
                const normalizedRange = Number.isFinite(parsedRange) && parsedRange >= 1
                    ? String(Math.min(5, Math.floor(parsedRange)))
                    : "1";

                return {
                    name: typeof exercise.name === "string" ? exercise.name.trim() : "",
                    image: typeof exercise.image === "string" ? exercise.image.trim() : "",
                    instructions: typeof exercise.instructions === "string" ? exercise.instructions.trim() : "",
                    range: normalizedRange,
                };
            })
            .filter((exercise) => {
                return exercise.name.length > 0;
            });
    } catch (error) {
        return [];
    }
}

function saveCustomExerciseRecord(formObject) {
    const exerciseName = typeof formObject["exercise-name"] === "string"
        ? formObject["exercise-name"].trim()
        : "";

    if (!exerciseName) {
        return;
    }

    const normalizedRange = 1;
    const storedExercises = getStoredCustomExercises();
    const existingIndex = storedExercises.findIndex((exercise) => {
        return exercise.name.toLowerCase() === exerciseName.toLowerCase();
    });
    const nextRecord = {
        name: exerciseName,
        image: typeof formObject["exercise-image"] === "string" ? formObject["exercise-image"].trim() : "",
        instructions: typeof formObject["exercise-instructions"] === "string" ? formObject["exercise-instructions"].trim() : "",
        range: normalizedRange,
    };

    if (existingIndex >= 0) {
        storedExercises[existingIndex] = nextRecord;
    } else {
        storedExercises.push(nextRecord);
    }

    saveCustomExercises(storedExercises);
}

function createCustomExerciseListItem(exerciseName) {
    const listItem = document.createElement("li");
    listItem.className = "inner-li";

    const button = document.createElement("button");
    button.className = "inner-button";

    const labelWrapper = document.createElement("div");
    const indicator = document.createElement("div");
    indicator.className = "indicator";
    const labelSpan = document.createElement("span");
    labelSpan.textContent = exerciseName;

    labelWrapper.appendChild(indicator);
    labelWrapper.appendChild(labelSpan);

    const controlWrapper = document.createElement("div");
    const trashIcon = document.createElement("img");
    trashIcon.src = "../assets/svg/trash-alt-svgrepo-com.svg";
    trashIcon.className = "trash-icon";
    const rangeInput = document.createElement("input");
    rangeInput.type = "range";
    rangeInput.name = "score";
    rangeInput.min = "1";
    rangeInput.max = "5";
    rangeInput.value = "1";

    controlWrapper.appendChild(trashIcon);
    controlWrapper.appendChild(rangeInput);

    button.appendChild(labelWrapper);
    button.appendChild(controlWrapper);
    listItem.appendChild(button);

    return listItem;
}

function appendCustomExerciseListItem(exerciseName, rangeValue = "1") {
    const customExercisesList = document.querySelector("#custom-exercises-ul");
    if (!customExercisesList) {
        return;
    }

    const addExerciseButton = document.querySelector("#new-exercise-button");
    if (!addExerciseButton) {
        return;
    }

    const existingItems = Array.from(customExercisesList.querySelectorAll(".inner-button")).filter((button) => {
        return button.id !== "new-exercise-button";
    });

    const alreadyExists = existingItems.some((button) => {
        return getInnerButtonLabel(button).toLowerCase() === exerciseName.toLowerCase();
    });

    if (alreadyExists) {
        return;
    }

    const listItem = createCustomExerciseListItem(exerciseName);
    const rangeInput = listItem.querySelector('input[type="range"]');
    if (rangeInput) {
        rangeInput.value = rangeValue;
    }
    customExercisesList.insertBefore(listItem, addExerciseButton.closest("li"));
    setupInteriorButton(listItem.querySelector(".inner-button"));
    setupCustomExerciseButton(listItem.querySelector(".inner-button"));
}

function restoreCustomExercises() {
    const customExercisesList = document.querySelector("#custom-exercises-ul");
    const addExerciseButton = document.querySelector("#new-exercise-button");

    if (!customExercisesList || !addExerciseButton) {
        return;
    }

    Array.from(customExercisesList.children).forEach((child) => {
        if (child.tagName === "LI" && child.querySelector("#new-exercise-button")) {
            return;
        }

        if (child.tagName === "LI") {
            child.remove();
        }
    });

    const storedExercises = getStoredCustomExercises();

    storedExercises.forEach((exercise) => {
        appendCustomExerciseListItem(exercise.name, exercise.range);
    });
}

function setupExportImportButtons() {
    const exportButton = document.querySelector("#export-button");
    const importForm = document.querySelector("#import-form");
    const importButton = document.querySelector("#import-button");

    if (exportButton) {
        exportButton.addEventListener("click", onExportButtonClick);
    }

    if (importButton) {
        importButton.addEventListener("click", onImportButtonClick);
    }

    if (importForm) {
        importForm.addEventListener("submit", onImportFormSubmit);
    }
}

function buildExportPayload() {
    return {
        version: 1,
        innerButtonSelections: getStoredInnerButtonRecords(),
        customExercises: getStoredCustomExercises(),
    };
}

async function copyExportTextToClipboard(exportText) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(exportText);
        return;
    }

    const exportData = document.querySelector("#export-data");
    if (!exportData) {
        return;
    }

    exportData.focus();
    exportData.select();
    document.execCommand("copy");

    alert("Export data copied to clipboard. You can also manually copy it from the textarea.");
}

async function onExportButtonClick(event) {
    event.preventDefault();

    const exportData = document.querySelector("#export-data");
    const exportPayload = buildExportPayload();
    const exportText = JSON.stringify(exportPayload, null, 2);

    if (exportData) {
        exportData.value = exportText;
    }

    try {
        await copyExportTextToClipboard(exportText);
    } catch (error) {
        console.warn("Unable to copy export data to clipboard.", error);
    }
}

function normalizeImportedInnerButtonRecord(record) {
    if (!record || typeof record !== "object") {
        return null;
    }

    if (typeof record.key !== "string" || typeof record.label !== "string") {
        return null;
    }

    const normalizedRange = typeof record.range === "string" || typeof record.range === "number"
        ? String(record.range)
        : null;

    if (normalizedRange === null || typeof record.selected !== "boolean" || typeof record.isCustomExercise !== "boolean") {
        return null;
    }

    return {
        key: record.key,
        label: record.label,
        range: normalizedRange,
        selected: record.selected,
        isCustomExercise: record.isCustomExercise,
    };
}

function normalizeImportedCustomExercise(record) {
    if (!record || typeof record !== "object") {
        return null;
    }

    if (typeof record.name !== "string" || typeof record.image !== "string" || typeof record.instructions !== "string") {
        return null;
    }

    const normalizedRange = typeof record.range === "string" || typeof record.range === "number"
        ? String(record.range)
        : null;

    if (normalizedRange === null) {
        return null;
    }

    const trimmedName = record.name.trim();
    if (!trimmedName) {
        return null;
    }

    return {
        name: trimmedName,
        image: record.image.trim(),
        instructions: record.instructions.trim(),
        range: normalizedRange,
    };
}

function validateImportPayload(importPayload) {
    if (!importPayload || typeof importPayload !== "object" || Array.isArray(importPayload)) {
        return null;
    }
    

    const importedSelections = Array.isArray(importPayload.innerButtonSelections)
        ? importPayload.innerButtonSelections.map(normalizeImportedInnerButtonRecord)
        : null;
    const importedExercises = Array.isArray(importPayload.customExercises)
        ? importPayload.customExercises.map(normalizeImportedCustomExercise)
        : [];

    if (!importedSelections || !importedExercises) {
        return null;
    }

    if (importedSelections.some((record) => record === null) || importedExercises.some((exercise) => exercise === null)) {
        return null;
    }

    const customExerciseNames = new Set(importedExercises.map((exercise) => exercise.name.toLowerCase()));

    const customSelectionNames = importedSelections
        .filter((record) => record.isCustomExercise)
        .map((record) => record.label.toLowerCase());

    if (customSelectionNames.some((label) => !customExerciseNames.has(label))) {
        return null;
    }

    return {
        innerButtonSelections: importedSelections,
        customExercises: importedExercises,
    };
}

function applyImportedData(importedData) {
    saveInnerButtonSelections(importedData.innerButtonSelections);
    saveCustomExercises(importedData.customExercises);

    restoreCustomExercises();
    restoreInnerButtonSelections();
    restoreInnerButtonRanges();
    syncMiddleButtonSelections();
}

function readImportData() {
    const importData = document.querySelector("#import-data");
    return importData ? importData.value.trim() : "";
}

function handleImportData() {
    const rawImportData = readImportData();

    if (!rawImportData) {
        alert("Please paste a valid export file before importing.");
        return;
    }

    let parsedImportData;

    try {
        parsedImportData = JSON.parse(rawImportData);
    } catch (error) {
        alert("The imported data is not valid JSON.");
        return;
    }

    const validatedData = validateImportPayload(parsedImportData);

    if (!validatedData) {
        alert("The imported data does not match the expected save format.");
        return;
    }

    applyImportedData(validatedData);

    alert("Import successful!");
}

function onImportButtonClick(event) {
    event.preventDefault();
    handleImportData();
}

function onImportFormSubmit(event) {
    event.preventDefault();
    handleImportData();
}

function saveInnerButtonRecord(button) {
    if (isNewExerciseButton(button)) {
        return;
    }

    const storageKey = getInnerButtonStorageKey(button);
    const storageLabel = getInnerButtonLabel(button);
    const rangeInput = getInnerButtonRange(button);
    const rangeValue = rangeInput ? rangeInput.value : "";
    const buttonIndicator = getButtonIndicator(button);
    const isSelected = buttonIndicator ? buttonIndicator.classList.contains("selected") : false;
    const customExercise = isCustomInnerButton(button);
    const selectedKeys = getStoredInnerButtonRecords();
    const existingIndex = selectedKeys.findIndex((record) => {
        return record && record.key === storageKey;
    });
    const nextRecord = {
        key: storageKey,
        label: storageLabel,
        range: rangeValue,
        selected: isSelected,
        isCustomExercise: customExercise,
    };

    if (existingIndex >= 0) {
        selectedKeys[existingIndex] = nextRecord;
    } else {
        selectedKeys.push(nextRecord);
    }

    saveInnerButtonSelections(selectedKeys);
}

function setInnerButtonSelection(button, isSelected) {
    const buttonIndicator = getButtonIndicator(button);

    if (buttonIndicator) {
        buttonIndicator.classList.toggle("selected", isSelected);
    }

    saveInnerButtonRecord(button, isSelected);
}

function restoreInnerButtonSelections() {
    const storedRecords = getStoredInnerButtonRecords();

    document.querySelectorAll(".inner-button").forEach((button) => {
        const buttonIndicator = getButtonIndicator(button);
        const storageKey = getInnerButtonStorageKey(button);
        const storageLabel = getInnerButtonLabel(button);
        const storedRecord = storedRecords.find((record) => {
            return record && record.key === storageKey && record.label === storageLabel;
        }) || storedRecords.find((record) => {
            return record && record.key === storageKey;
        });

        if (buttonIndicator) {
            buttonIndicator.classList.toggle("selected", storedRecord ? Boolean(storedRecord.selected) : false);
        }
    });
}

function restoreInnerButtonRanges() {
    const storedRecords = getStoredInnerButtonRecords();

    document.querySelectorAll(".inner-button").forEach((button) => {
        const rangeInput = getInnerButtonRange(button);
        const storageKey = getInnerButtonStorageKey(button);
        const storageLabel = getInnerButtonLabel(button);
        const storedRecord = storedRecords.find((record) => {
            return record && record.key === storageKey && record.label === storageLabel;
        }) || storedRecords.find((record) => {
            return record && record.key === storageKey;
        });

        if (rangeInput && storedRecord && storedRecord.range !== undefined) {
            rangeInput.value = storedRecord.range;
        }
    });
}

function syncMiddleButtonSelections() {
    document.querySelectorAll(".middle-button").forEach((button) => {
        const buttonIndicator = getButtonIndicator(button);
        const parentItem = button.closest("li");
        const nestedList = parentItem?.nextElementSibling;

        if (!buttonIndicator || !nestedList || !nestedList.matches("ul")) {
            return;
        }

        const nestedListItems = Array.from(nestedList.childNodes).filter((child) => {
            return child.nodeType === Node.ELEMENT_NODE && child.tagName === "LI";
        });

        const allNestedSelected = nestedListItems.every((listItem) => {
            const liButton = Array.from(listItem.childNodes).find((child) => {
                return child.nodeType === Node.ELEMENT_NODE && child.tagName === "BUTTON";
            });

            if (!liButton) {
                return false;
            }

            const nestedButtonIndicator = getButtonIndicator(liButton);
            return nestedButtonIndicator?.classList.contains("selected") ?? false;
        });

        buttonIndicator.classList.toggle("selected", allNestedSelected);
    });
}

function checkIfAllNestedButtonsSelected(parentButtonIndicator, nestedList) {
    let booleanFlag = true;
    const nestedListItems = Array.from(nestedList.childNodes).filter((child) => {
        return child.nodeType === Node.ELEMENT_NODE && child.tagName === "LI";
    });
    nestedListItems.forEach((listItem) =>{
        const liButton = Array.from(listItem.childNodes).find((child) => {
            return child.nodeType === Node.ELEMENT_NODE && child.tagName === "BUTTON";
        });
        if(!liButton){
            return;
        }

        const nestedButtonIndicator = getButtonIndicator(liButton);
        if(!nestedButtonIndicator){
            return;
        }

        if(!nestedButtonIndicator.classList.contains("selected")){
            booleanFlag = false;
            return;
        }
    });
    if(parentButtonIndicator && booleanFlag){
        parentButtonIndicator.classList.add("selected");
    }
    else if(parentButtonIndicator && !booleanFlag){
        parentButtonIndicator.classList.remove("selected");
    }
    return;
}

function setupDirectoryButtons(){
    const buttons = document.querySelectorAll(".outer-button, .middle-button");
    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            const parentItem = button.closest("li");
            const nestedList = parentItem?.nextElementSibling;

            if (!nestedList || !nestedList.matches("ul")) {
                return;
            }

            nestedList.classList.toggle("hidden");
            const icon = button.querySelector("img");

            if (icon) {
                icon.classList.toggle("rotated", !nestedList.classList.contains("hidden"));
            }
        });
        const button_indicator = getButtonIndicator(button);
        if(button_indicator && button.classList.contains("middle-button")){
            const parentItem = button.closest("li");
            const nestedList = parentItem?.nextElementSibling;
            button_indicator.addEventListener("click", (event) => {
                event.stopPropagation();
                button_indicator.classList.toggle("selected");
                const selectedStatus = button_indicator.classList.contains("selected");

                if (!nestedList || !nestedList.matches("ul")) {
                    return;
                }
                    //Assegna la classe selected agli inner-button quando il tasto middle-button viene cliccato
                    const nestedListItems = Array.from(nestedList.childNodes).filter((child) => {
                        return child.nodeType === Node.ELEMENT_NODE && child.tagName === "LI";
                    });

                    nestedListItems.forEach((listItem) =>{
                        const liButton = Array.from(listItem.childNodes).find((child) => {
                            return child.nodeType === Node.ELEMENT_NODE && child.tagName === "BUTTON";
                        });
                        if(!liButton){
                            return;
                        }

                        const nestedButtonIndicator = getButtonIndicator(liButton);
                        if(!nestedButtonIndicator){
                            return;
                        }

                        nestedButtonIndicator.classList.toggle("selected", selectedStatus);
                        setInnerButtonSelection(liButton, selectedStatus);
                    });
            });
            assignMiddleButtonBehaviour(button_indicator, nestedList);
        }
    });
}

function setupInteriorButtons(){
    const buttons = document.querySelectorAll(".inner-button")
    buttons.forEach((button) =>{
        setupInteriorButton(button);
        const parentItem = button.closest("ul");
        if(parentItem.getAttribute("id") === "custom-exercises-ul"){
            setupCustomExerciseButton(button);
        }
    });
}

function assignMiddleButtonBehaviour(middleButtonIndicator, nestedList){
    const nestedListItems = Array.from(nestedList.childNodes).filter((child) => {
        return child.nodeType === Node.ELEMENT_NODE && child.tagName === "LI";
    });

    nestedListItems.forEach((listItem) =>{
        const liButton = Array.from(listItem.childNodes).find((child) => {
            return child.nodeType === Node.ELEMENT_NODE && child.tagName === "BUTTON";
        });
        if(!liButton){
            return;
        }

        setupInteriorButton(liButton);

        liButton.addEventListener("click", (event) => {
            event.stopPropagation();
            checkIfAllNestedButtonsSelected(middleButtonIndicator, nestedList);
        });
    });
}

function setupInteriorButton(button) {
    if (configuredInnerButtons.has(button)) {
        return;
    }

    configuredInnerButtons.add(button);

    const rangeInput = getInnerButtonRange(button);

    if (rangeInput) {
        rangeInput.addEventListener("input", (event) => {
            event.stopPropagation();
                saveInnerButtonRecord(button);
        });
        rangeInput.addEventListener("click", (event) => {
            event.stopPropagation();
        });
    }

    button.addEventListener("click", (event) => {
        event.stopPropagation();
        const button_indicator = getButtonIndicator(button);
        if(button_indicator){
            const isSelected = button_indicator.classList.toggle("selected");
            setInnerButtonSelection(button, isSelected);
        }
    });
}

function setupCustomExerciseButton(button) {
    const trashIcon = button.querySelector(".trash-icon");
    if(trashIcon){
        trashIcon.addEventListener("click", (event) => {
            event.stopPropagation();
            deleteCustomExercise(button);
        });
    }
}

function deleteCustomExercise(button) {
    const storageLabel = getInnerButtonLabel(button);
    const storageKey = getInnerButtonStorageKey(button);
    const parentLi = button.closest("li");
    if (parentLi) {
        parentLi.remove();
    }

    const storedRecords = getStoredInnerButtonRecords().filter((record) => {
        return !(
            record
            && record.isCustomExercise
            && (record.label === storageLabel || record.key === storageKey)
        );
    });

    saveInnerButtonSelections(storedRecords);

    const storedCustomExercises = getStoredCustomExercises().filter((exercise) => {
        return exercise && exercise.name !== storageLabel;
    });

    saveCustomExercises(storedCustomExercises);
}

function setupNewExerciseButton(){
    const newExerciseButton = document.querySelector("#new-exercise-button");
    newExerciseButton.addEventListener("click", onNewExerciseButtonClick);
}

function setupModalView(){
    const modalView = document.querySelector("#modal-view");
    const modalViewSub = document.querySelector("#modal-view-sub");
    modalViewSub.addEventListener('click', (event) => {
        event.stopPropagation();
    });
    modalView.addEventListener('click', onModalClick);
    setupNewExerciseForm();
}

function onModalClick(event){
    document.body.classList.remove('body-noscroll');
    modalView.classList.remove("visible");
}



var validExerciseName = false;

function onNewExerciseButtonClick(event){
    const modalViewForm = document.forms["new-exercise-form"];
    modalViewForm.reset();
    document.body.classList.add('body-noscroll');
    modalView.classList.add("visible");
}



function setupNewExerciseForm(){
    const modalViewForm = document.forms["new-exercise-form"];
    
    modalViewForm.reset();

    const submitButton = modalViewForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.classList.add("disabled");
    
    modalViewForm.addEventListener("submit", onNewExerciseFormSubmit);
    modalViewForm["exercise-name"].addEventListener("blur", (event) => {
        const input = modalViewForm["exercise-name"].value.trim();
        validExerciseName = input.length > 0;
        validateSubmitButtonState();
    });
    modalViewForm["exercise-name"].addEventListener("input", (event) => {
        const input = modalViewForm["exercise-name"].value.trim();
        validExerciseName = input.length > 0;
        validateSubmitButtonState();
    });
}

function onNewExerciseFormSubmit(event){
    event.preventDefault();
    if(!validExerciseName){
        alert("Please fill in the exercise name.");
        return;
    }
    const formData = new FormData(event.target);
    const formObject = Object.fromEntries(formData.entries());
    saveCustomExerciseRecord(formObject);
    appendCustomExerciseListItem(formObject["exercise-name"].trim());
    
    console.log("Form submitted:", formObject);
    onModalClick(event);
}

function validateSubmitButtonState(){
    const modalViewForm = document.forms["new-exercise-form"];
    const submitButton = modalViewForm.querySelector('button[type="submit"]');
    const errorMessage = modalViewForm.querySelector("#exercise-name-error");
    const input = modalViewForm["exercise-name"].value.trim();
    validExerciseName = input.length > 0;
    if(validExerciseName){
        submitButton.disabled = false;
        submitButton.classList.remove("disabled");
        errorMessage.classList.add("hidden");
    } else {
        submitButton.disabled = true;
        submitButton.classList.add("disabled");
        errorMessage.classList.remove("hidden");
    }
}

