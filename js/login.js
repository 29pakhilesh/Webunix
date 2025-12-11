// js/webunix_login.js

// Elements
const loginBtn = document.getElementById("login-btn");
const usernameInput = document.getElementById("login-username");
const passwordInput = document.getElementById("login-password");
const loginScreen = document.getElementById("login-screen");
const desktop = document.getElementById("desktop");
const clockEl = document.getElementById("clock");

// Simple login flow: require a non-empty username (no real auth)
function showDesktop() {
  loginScreen.classList.add("hidden");
  desktop.classList.remove("hidden");
  startClock();
}

// Allow Enter key to submit
[usernameInput, passwordInput].forEach(inp =>
  inp.addEventListener("keydown", e => { if (e.key === "Enter") loginBtn.click(); })
);

// Login button
loginBtn.addEventListener("click", () => {
  const user = usernameInput.value.trim();
  if (!user) {
    usernameInput.focus();
    return; // require username
  }
  // store user in sessionStorage for later use
  sessionStorage.setItem("webunix_user", user);
  showDesktop();
});

// Desktop clock
function startClock() {
  function tick() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    clockEl.textContent = `${hh}:${mm}:${ss}`;
  }
  tick();
  if (!startClock._interval) startClock._interval = setInterval(tick, 1000);
}

<script src="js/auth.js"></script>