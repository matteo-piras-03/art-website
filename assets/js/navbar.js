const nav_dark_button = document.querySelector("#toggledarkmode");
const root = document.querySelector(":root");
const body = document.querySelector("body");

nav_dark_button.addEventListener("click", toggleDarkMode);

function toggleDarkMode() {
    const savedTheme = localStorage.getItem("theme");
    const nextTheme = savedTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    console.log(`Theme changed to ${nextTheme}`);
}

function setTheme(theme){
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
}