// SHUTDOWN HANDLER

// Create shutdown overlay dynamically
const shutdownOverlay = document.createElement("div");
shutdownOverlay.id = "shutdown-overlay";
shutdownOverlay.innerHTML = `
    <div id="shutdown-box">
        <h2>Power Options</h2>
        <button id="shutdown-btn">Shutdown</button>
        <button id="restart-btn">Restart</button>
        <button id="cancel-shutdown">Cancel</button>
    </div>
`;
document.body.appendChild(shutdownOverlay);

// Hide at start
shutdownOverlay.style.display = "none";

// Open shutdown menu when user clicks power icon (handled in main.js later)
window.openShutdownMenu = function () {
    shutdownOverlay.style.display = "flex";
};

// Close
document.getElementById("cancel-shutdown").onclick = () => {
    shutdownOverlay.style.display = "none";
};

// Shutdown → return to boot screen
document.getElementById("shutdown-btn").onclick = () => {
    shutdownSequence(false);
};

// Restart → also return to boot screen
document.getElementById("restart-btn").onclick = () => {
    shutdownSequence(true);
};

// Core function
function shutdownSequence(isRestart) {
    shutdownOverlay.style.display = "none";
    
    const desktop = document.getElementById("desktop");
    const login = document.getElementById("login-screen");
    const boot = document.getElementById("boot-screen");

    // Fade out desktop
    desktop.style.opacity = "1";
    desktop.style.transition = "opacity 0.7s";
    desktop.style.opacity = "0";

    setTimeout(() => {
        desktop.classList.add("hidden");
        desktop.style.opacity = "1";

        // Show boot again
        boot.classList.remove("hidden");

        setTimeout(() => {
            boot.classList.add("hidden");
            login.classList.remove("hidden");
        }, 2000); // Boot time
    }, 700);
}
