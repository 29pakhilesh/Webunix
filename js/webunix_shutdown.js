// js/webunix_shutdown.js - Shutdown (Close Tab) & Restart Logic

// Create shutdown overlay dynamically
const shutdownOverlay = document.createElement("div");
shutdownOverlay.id = "shutdown-overlay";
shutdownOverlay.className = "hidden"; // Starts hidden
shutdownOverlay.innerHTML = `
    <div id="shutdown-box">
        <h2>Power Options</h2>
        <button id="shutdown-btn">Shutdown</button>
        <button id="restart-btn">Restart</button>
        <button id="cancel-shutdown">Cancel</button>
    </div>
`;
document.body.appendChild(shutdownOverlay);

// Open shutdown menu
window.openShutdownMenu = function () {
    // Ensure Start Menu is closed first
    document.getElementById("start-menu")?.classList.add("hidden");
    
    // Show the overlay
    shutdownOverlay.classList.remove("hidden");
    // Trigger reflow to ensure transition works
    void shutdownOverlay.offsetWidth; 
    shutdownOverlay.style.opacity = "1";
};

// Close Menu
document.getElementById("cancel-shutdown").onclick = () => {
    shutdownOverlay.style.opacity = "0";
    setTimeout(() => shutdownOverlay.classList.add("hidden"), 300);
};

// Shutdown Action
document.getElementById("shutdown-btn").onclick = () => {
    shutdownSequence(false);
};

// Restart Action
document.getElementById("restart-btn").onclick = () => {
    shutdownSequence(true);
};

// Core function
function shutdownSequence(isRestart) {
    shutdownOverlay.classList.add("hidden");
    shutdownOverlay.style.opacity = "0";
    
    const desktop = document.getElementById("desktop");
    const login = document.getElementById("login-screen");
    const boot = document.getElementById("boot-screen");

    // Fade out desktop
    desktop.style.transition = "opacity 0.7s ease";
    desktop.style.opacity = "0";

    setTimeout(() => {
        desktop.classList.add("hidden");
        desktop.style.opacity = "1"; // Reset for next time

        if (isRestart) {
            // --- RESTART FLOW ---
            boot.classList.remove("hidden");
            setTimeout(() => {
                boot.classList.add("hidden");
                login.classList.remove("hidden");
            }, 2000); 
        } else {
            // --- SHUTDOWN FLOW (Close Tab) ---
            sessionStorage.clear(); // Clear session
            
            // Attempt to close the window
            window.close();
            
            // Fallback: If browser blocks close(), show "System Halted" screen
            document.body.innerHTML = "";
            document.body.style.background = "#000";
            document.body.style.color = "#fff";
            document.body.style.display = "flex";
            document.body.style.flexDirection = "column";
            document.body.style.alignItems = "center";
            document.body.style.justifyContent = "center";
            document.body.style.height = "100vh";
            document.body.style.fontFamily = "-apple-system, system-ui, sans-serif";
            
            document.body.innerHTML = `
                <div style="font-size: 24px; margin-bottom: 20px; color: #ff4757;">●</div>
                <h1 style="font-weight: 300; letter-spacing: 2px;">SYSTEM HALTED</h1>
                <p style="color: #666; margin-top: 10px; font-size: 14px;">It is safe to close this tab.</p>
            `;
        }
    }, 700);
}