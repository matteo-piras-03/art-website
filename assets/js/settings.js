document.addEventListener("DOMContentLoaded", setupAll);

const configuredInnerButtons = new WeakSet();

function setupAll(){
    setupDirectoryButtons();
    setupInteriorButtons();
    restoreInnerButtonSelections();
    restoreInnerButtonRanges();
    syncMiddleButtonSelections();
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

function getInnerButtonRange(button) {
    return button.querySelector('input[type="range"]');
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
            };
        });
    } catch (error) {
        return [];
    }
}

function saveInnerButtonRecord(button) {
    const storageKey = getInnerButtonStorageKey(button);
    const storageLabel = getInnerButtonLabel(button);
    const rangeInput = getInnerButtonRange(button);
    const rangeValue = rangeInput ? rangeInput.value : "";
    const buttonIndicator = getButtonIndicator(button);
    const isSelected = buttonIndicator ? buttonIndicator.classList.contains("selected") : false;
    const selectedKeys = getStoredInnerButtonRecords();
    const existingIndex = selectedKeys.findIndex((record) => {
        return record && record.key === storageKey;
    });
    const nextRecord = {
        key: storageKey,
        label: storageLabel,
        range: rangeValue,
        selected: isSelected,
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