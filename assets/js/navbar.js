const nav_dark_button = document.querySelector("#toggledarkmode");
const nav_dark_button_light_img = nav_dark_button?.querySelector("#light");
const nav_dark_button_dark_img = nav_dark_button?.querySelector("#dark");

const currentTheme = localStorage.getItem("theme") || "light";
setTheme(currentTheme);

nav_dark_button?.addEventListener("click", toggleDarkMode);

function toggleDarkMode() {
    const savedTheme = localStorage.getItem("theme");
    const nextTheme = savedTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    console.log(`Theme changed to ${nextTheme}`);
}

function setTheme(theme){
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    updateDarkModeIcon(theme);
}

function updateDarkModeIcon(theme) {
    if (!nav_dark_button_light_img || !nav_dark_button_dark_img) return;
    nav_dark_button_light_img.classList.toggle("hidden", theme === 'dark');
    nav_dark_button_dark_img.classList.toggle("hidden", theme !== 'dark');
}