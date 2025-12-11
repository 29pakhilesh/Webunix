// js/webunix_boot.js - Element Flip (Black Background Persists)

window.addEventListener("load", () => {
    const bootScreen = document.getElementById("boot-screen");
    const loginScreen = document.getElementById("login-screen");
    const desktop = document.getElementById("desktop"); // Get Desktop Ref
    
    const bootContent = document.querySelector(".boot-center");
    const loginBox = document.querySelector(".login-box");
    const spinner = document.querySelector(".boot-spinner");

    // 1. Setup: Ensure Login is present, and Desktop is HIDDEN (Black Void)
    if (loginScreen) loginScreen.classList.remove("hidden");
    if (desktop) desktop.classList.add("hidden"); // Force hide wallpaper

    setTimeout(() => {
        // Visual Success Cue
        if(spinner) {
            spinner.style.borderTopColor = "#4cd964"; 
            spinner.style.boxShadow = "0 0 15px #4cd964";
        }

        // 2. TRIGGER ANIMATION
        setTimeout(() => {
            // Only Flip the Elements (Logo -> Login Box)
            if(bootContent) bootContent.classList.add("flip-logo-away");
            if(loginBox) loginBox.classList.add("flip-box-in");

            // REMOVED: Background Fade Out logic. 
            // The background stays black because #desktop is hidden and body is black.

            // 3. Cleanup Boot Screen Layer
            setTimeout(() => {
                bootScreen.classList.add("hidden");
                
                // Focus Username
                const user = document.getElementById("login-username");
                if(user) user.focus();
                
            }, 1200);

        }, 600); 

    }, 2000); 
});