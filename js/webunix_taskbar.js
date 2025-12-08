// js/webunix_taskbar.js - Ultimate Advanced Taskbar
// Features: Vector Icons, Live Battery, Active App Indicators, Interactive Tray

(function() {
    const dock = document.getElementById("dock");
    const taskbarRight = document.getElementById("taskbar-right");

    // --- 1. PREMIUM VECTOR ICONS (No more broken images) ---
    const ICONS = {
        terminal: `<svg viewBox="0 0 24 24"><path d="M20,4H4C2.9,4,2,4.9,2,6v12c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V6C22,4.9,21.1,4,20,4z M20,18H4V6h16V18z M7.5,15l4.5-4.5L7.5,6v9z M12,15h7v-2h-7V15z" fill="white"/></svg>`,
        folder: `<svg viewBox="0 0 24 24"><path d="M20,6h-8l-2-2H4C2.9,4,2,4.9,2,6v12c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V8C22,6.9,21.1,6,20,6z" fill="#3b8df0"/></svg>`,
        editor: `<svg viewBox="0 0 24 24"><path d="M14,2H6C4.9,2,4,2.9,4,4v16c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V8L14,2z M6,20V4h7v5h5v11H6z" fill="#ccc"/></svg>`,
        settings: `<svg viewBox="0 0 24 24"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65z" fill="#999"/></svg>`,
        wifi: `<svg viewBox="0 0 24 24"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" fill="white"/></svg>`,
        vol: `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" fill="white"/></svg>`,
        battery: `<svg viewBox="0 0 24 24"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z" fill="#66bb6a"/></svg>`
    };

    // --- 2. BUILD DOCK ---
    const APPS = [
        { id: "Terminal", icon: ICONS.terminal, action: () => window.openTerminal?.(), check: "terminal-window" },
        { id: "Files", icon: ICONS.folder, action: () => window.openFileManager?.(), check: "filemgr-window" },
        { id: "Editor", icon: ICONS.editor, action: () => window.openEditor?.(), check: "editor-window" },
        { id: "Settings", icon: ICONS.settings, action: () => window.openSettings?.(), check: "settings-window" }
    ];

    function buildDock() {
        dock.innerHTML = "";
        APPS.forEach((app) => {
            const it = document.createElement("div");
            it.className = "dock-item";
            it.innerHTML = app.icon;
            it.dataset.checkId = app.check; // Store ID to check if running

            // Click Interaction
            it.onclick = () => {
                // Bounce animation
                it.style.transition = "transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)";
                it.style.transform = "translateY(-15px) scale(1.1)";
                setTimeout(() => it.style.transform = "", 150);
                app.action?.();
                updateActiveIndicators();
            };
            dock.appendChild(it);
        });
        updateActiveIndicators();
    }

    // Check which apps are open and show a dot under them
    function updateActiveIndicators() {
        document.querySelectorAll(".dock-item").forEach(el => {
            const targetId = el.dataset.checkId;
            // Matches any ID that starts with the key (e.g. editor-window-123 matches editor-window)
            const isOpen = document.querySelector(`[id^="${targetId}"]`);
            if (isOpen) el.classList.add("running");
            else el.classList.remove("running");
        });
    }
    // Poll constantly for open windows to keep dock sync'd
    setInterval(updateActiveIndicators, 1000);


    // --- 3. BUILD SYSTEM TRAY ---
    function buildTray() {
        taskbarRight.innerHTML = "";

        // Toggles Group
        const pill = document.createElement("div");
        pill.className = "sys-group";
        
        // WiFi Button (Interactive)
        const wifiBtn = createSysBtn(ICONS.wifi, "WiFi", () => {
            wifiBtn.classList.toggle("active");
            wifiBtn.style.opacity = wifiBtn.classList.contains("active") ? "1" : "0.5";
        });
        wifiBtn.classList.add("active"); // Default on

        // Volume Button
        const volBtn = createSysBtn(ICONS.vol, "Volume", () => alert("Volume Control"));
        
        // Battery (with auto-detect)
        const batBtn = createSysBtn(ICONS.battery, "Battery", null);
        navigator.getBattery?.().then(b => {
            const updateBat = () => batBtn.title = `Battery: ${Math.round(b.level*100)}%${b.charging?' (Charging)':''}`;
            updateBat();
            b.addEventListener('levelchange', updateBat);
        });

        pill.appendChild(wifiBtn);
        pill.appendChild(volBtn);
        pill.appendChild(batBtn);
        taskbarRight.appendChild(pill);


        // Clock
        const clockBox = document.createElement("div");
        clockBox.id = "clock-box";
        clockBox.style.marginLeft = "8px";
        taskbarRight.appendChild(clockBox);
        
        function updateClock() {
            const now = new Date();
            clockBox.innerHTML = `
                <div style="font-weight:600; font-size:13px; line-height:1.1;">${now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                <div style="font-size:10px; opacity:0.7;">${now.toLocaleDateString([], {weekday:'short', month:'short', day:'numeric'})}</div>
            `;
        }
        setInterval(updateClock, 1000);
        updateClock();


        // Profile
        renderProfile();
    }

    function createSysBtn(iconHtml, title, onClick) {
        const btn = document.createElement("button");
        btn.className = "sys-btn";
        btn.innerHTML = iconHtml;
        btn.title = title;
        if (onClick) btn.onclick = onClick;
        return btn;
    }

    function renderProfile() {
        const u = JSON.parse(sessionStorage.getItem("webunix_session_v2") || "{}");
        const username = u.user || "Guest";
        
        const p = document.createElement("div");
        p.id = "taskbar-profile";
        // Simple avatar color hash
        const color = "hsl(" + (username.length * 50) + ", 70%, 50%)";

        p.innerHTML = `
          <div class="profile-avatar" style="background:${color}; display:grid; place-items:center; font-weight:bold; color:white;">
            ${username[0].toUpperCase()}
          </div>
          <div class="profile-name">${username}</div>
        `;
        
        p.onclick = () => {
             if(confirm("Log out of WebUnix?")) {
                 sessionStorage.removeItem("webunix_session_v2");
                 location.reload();
             }
        };
        taskbarRight.appendChild(p);
    }

    // Initialize
    buildDock();
    buildTray();

})();