// js/webunix_main.js - Core OS & Window Manager

document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. ADVANCED WINDOW MANAGER ---
    window.wm = {
        zIndex: 100,
        
        // Call this function on any new window to make it movable/resizable
        register: (win) => {
            // A. BRING TO FRONT ON CLICK
            win.addEventListener("mousedown", () => {
                win.style.zIndex = ++window.wm.zIndex;
            });

            // B. DRAGGING (Title Bar)
            const titleBar = win.querySelector(".title-bar");
            if (titleBar) {
                titleBar.style.cursor = "default";
                let isDragging = false;
                let startX, startY, initialLeft, initialTop;

                titleBar.addEventListener("mousedown", (e) => {
                    // Don't drag if clicking buttons (like close 'x')
                    if(e.target.tagName === "BUTTON") return;
                    
                    isDragging = true;
                    startX = e.clientX;
                    startY = e.clientY;
                    initialLeft = win.offsetLeft;
                    initialTop = win.offsetTop;
                    
                    win.style.zIndex = ++window.wm.zIndex;
                    document.body.style.userSelect = "none"; // Prevent highlighting text while dragging
                });

                document.addEventListener("mousemove", (e) => {
                    if (!isDragging) return;
                    const dx = e.clientX - startX;
                    const dy = e.clientY - startY;
                    win.style.left = `${initialLeft + dx}px`;
                    win.style.top = `${initialTop + dy}px`;
                });

                document.addEventListener("mouseup", () => {
                    isDragging = false;
                    document.body.style.userSelect = "";
                });
            }

            // C. RESIZING (Bottom-Right Handle)
            // Create the handle dynamically so you don't have to add it to HTML manually
            const resizer = document.createElement("div");
            resizer.className = "win-resizer"; 
            win.appendChild(resizer);

            let isResizing = false;
            let startW, startH, startRX, startRY;

            resizer.addEventListener("mousedown", (e) => {
                isResizing = true;
                startRX = e.clientX;
                startRY = e.clientY;
                startW = parseInt(document.defaultView.getComputedStyle(win).width, 10);
                startH = parseInt(document.defaultView.getComputedStyle(win).height, 10);
                
                win.style.zIndex = ++window.wm.zIndex;
                document.body.style.userSelect = "none";
                e.stopPropagation(); // Stop event bubbling
            });

            document.addEventListener("mousemove", (e) => {
                if (!isResizing) return;
                const width = startW + (e.clientX - startRX);
                const height = startH + (e.clientY - startRY);
                
                // Minimum sizes
                if (width > 200) win.style.width = `${width}px`;
                if (height > 100) win.style.height = `${height}px`;
            });

            document.addEventListener("mouseup", () => {
                isResizing = false;
                document.body.style.userSelect = "";
            });
        }
    };

    // --- 2. START MENU & DESKTOP LOGIC ---
    const startBtn = document.getElementById("start-button");
    let startMenu;

    // Toggle Start Menu
    startBtn?.addEventListener("click", () => {
        if (!startMenu) {
            startMenu = document.createElement("div");
            startMenu.id = "start-menu";
            // Check installed packages
            const installed = JSON.parse(localStorage.getItem("webunix_packages") || "[]");
            
            let html = `
                <div class="menu-item" onclick="launch('Terminal')">📟 Terminal</div>
                <div class="menu-item" onclick="launch('FileManager')">📁 File Manager</div>
                <div class="menu-item" onclick="launch('Editor')">📝 Text Editor</div>
                <div class="menu-item" onclick="launch('Settings')">⚙️ Settings</div>
            `;
            
            if(installed.includes("calculator")) html += `<div class="menu-item" onclick="launch('Calculator')">🧮 Calculator</div>`;

            html += `<div class="menu-sep"></div>
                     <div class="menu-item danger" onclick="window.openShutdownMenu()">🔴 Shut Down</div>`;

            startMenu.innerHTML = html;
            document.body.appendChild(startMenu);
        } else {
            startMenu.classList.toggle("hidden");
        }
    });

    // Global Launcher
    window.launch = (app) => {
        if(startMenu) startMenu.classList.add("hidden");
        if(app === "Terminal") window.openTerminal();
        if(app === "FileManager") window.openFileManager();
        if(app === "Editor") window.openEditor();
        if(app === "Settings") window.openSettings();
        if(app === "Calculator") alert("Calculator not implemented yet! Install via Terminal.");
    };

    // Auto-Login Check
    if (sessionStorage.getItem("webunix_session_v2")) {
        document.getElementById("login-screen")?.classList.add("hidden");
        document.getElementById("desktop")?.classList.remove("hidden");
    }
});