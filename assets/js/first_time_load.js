async function initializeFirstTimeInnerButtons() {
    const storageKey = "inner-button-selections";

    if (localStorage.getItem(storageKey) !== null) {
        return;
    }

    try {
        const response = await fetch("/assets/json/warmups_default.json");

        if (!response.ok) {
            return;
        }

        const data = await response.json();
        const exercises = Array.isArray(data?.exercises) ? data.exercises : [];

        const initialRecords = exercises
            .filter((exercise) => exercise && typeof exercise.label === "string" && exercise.label.trim() !== "")
            .map((exercise) => {
                return {
                    key: typeof exercise.label === "string" ? exercise.label.trim() : "",
                    label: typeof exercise.label === "string" ? exercise.label : "",
                    range: "1",
                    selected: true,
                };
            });

        if (initialRecords.length > 0) {
            localStorage.setItem(storageKey, JSON.stringify(initialRecords));
        }
    } catch (error) {
        return;
    }
}

window.firstTimeLoadReady = initializeFirstTimeInnerButtons();