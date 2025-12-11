// js/webunix_taskbar.js
(function() {
    const dock = document.getElementById("dock");
    const taskbarRight = document.getElementById("taskbar-right");

    const ICONS = {
        terminal: `<svg viewBox="0 0 24 24"><path d="M20,4H4C2.9,4,2,4.9,2,6v12c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V6C22,4.9,21.1,4,20,4z M20,18H4V6h16V18z M7.5,15l4.5-4.5L7.5,6v9z M12,15h7v-2h-7V15z" fill="white"/></svg>`,
        folder: `<svg viewBox="0 0 24 24"><path d="M20,6h-8l-2-2H4C2.9,4,2,4.9,2,6v12c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V8C22,6.9,21.1,6,20,6z" fill="#3b8df0"/></svg>`,
        editor: `<svg viewBox="0 0 24 24"><path d="M14,2H6C4.9,2,4,2.9,4,4v16c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V8L14,2z M6,20V4h7v5h5v11H6z" fill="#ccc"/></svg>`,
        settings: `<svg viewBox="0 0 24 24"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65z" fill="#999"/></svg>`,
        process: `<svg viewBox="0 0 24 24"><path d="M11 21h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2zm-2 8h-2v-2h2v2zm-2-4h-2v-2h2v2zm0-4h-2V7h2v2zm8 8h-2v-2h2v2zm2-4h-2v-2h2v2zm0-4h-2V7h2v2zM5 5v2h2V5H5zm2 14h2v-2h-2v2zm10 0v-2h2v2h-2zM5 9v2h2V9H5zm10-2v2h2V7h-2zM9 5h6v2H9V5z" fill="#f05050"/></svg>`,
        wifi: `<svg viewBox="0 0 24 24"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" fill="white"/></svg>`,
        volHigh: `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" fill="white"/></svg>`,
        volLow: `<svg viewBox="0 0 24 24"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" fill="white"/></svg>`,
        volMute: `<svg viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z" fill="white"/></svg>`,
        battery: `<svg viewBox="0 0 24 24"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z" fill="#66bb6a"/></svg>`
    };

    const APPS = [
        { id: "ProcMgr", icon: ICONS.process, action: () => window.openProcessManager?.(), check: "procman-window" },
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
            it.dataset.checkId = app.check;
            it.onclick = () => {
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

    function updateActiveIndicators() {
        document.querySelectorAll(".dock-item").forEach(el => {
            const isOpen = document.querySelector(`[id^="${el.dataset.checkId}"]`);
            if (isOpen) el.classList.add("running");
            else el.classList.remove("running");
        });
    }
    setInterval(updateActiveIndicators, 1000);

    let currentVolume = parseInt(localStorage.getItem("webunix_volume") || "100");

    function getVolIcon(level) {
        if(level <= 0) return ICONS.volMute;
        if(level < 50) return ICONS.volLow;
        return ICONS.volHigh;
    }

    // js/webunix_taskbar.js (Replace existing toggleVolume function)
    // js/webunix_taskbar.js (Replace existing toggleVolume function)
    function toggleVolume(btn) {
        const existing = document.getElementById("volume-popup");
        if(existing) { existing.remove(); return; }
        
        const rect = btn.getBoundingClientRect();
        const pop = document.createElement("div");
        pop.id = "volume-popup";
        
        // Positioning for horizontal slider
        pop.style.cssText = `
            position: fixed; 
            z-index: 9999;
            left: ${rect.left - 60}px; 
            bottom: 70px;
        `;
        
        // Added volume percentage display
        pop.innerHTML = `<div class="vol-slider-wrap">
            <input type="range" class="vol-range" min="0" max="100" value="${currentVolume}">
        </div>
        <div id="vol-percent" style="color:white; font-size:12px; font-weight:600;">${currentVolume}%</div>`; 
        document.body.appendChild(pop);
        
        const rangeInput = pop.querySelector(".vol-range");
        const percentDisplay = pop.querySelector("#vol-percent");

        // Set initial track level and percentage display
        pop.style.setProperty('--vol-level', `${currentVolume}%`);

        rangeInput.oninput = (e) => {
            const level = parseInt(e.target.value);
            currentVolume = level;
            localStorage.setItem("webunix_volume", currentVolume);
            
            // Update CSS Variable for track fill
            pop.style.setProperty('--vol-level', `${level}%`);

            // Update visible percentage text
            percentDisplay.textContent = `${level}%`;
            
            // Update the tray button icon instantly
            btn.innerHTML = getVolIcon(currentVolume); 
        };
        
        // Ensure initial button icon is correct
        btn.innerHTML = getVolIcon(currentVolume); 

        setTimeout(() => {
            const h = (e) => { 
                if(!pop.contains(e.target) && !btn.contains(e.target)) { 
                    pop.remove(); 
                    document.removeEventListener("click", h); 
                } 
            };
            document.addEventListener("click", h);
        }, 10);
    }
    function buildTray() {
        taskbarRight.innerHTML = "";
        
        // Removed the unnecessary 'pill' (sys-group) wrapper for a cleaner look.
        
        const wifi = createSysBtn(ICONS.wifi, "WiFi");
        wifi.onclick = () => { wifi.classList.toggle("active"); wifi.style.opacity = wifi.classList.contains("active") ? "1" : "0.5"; };
        // FIX: Initialize active state immediately for cleaner presentation
        wifi.classList.add("active");
        
        const vol = createSysBtn(getVolIcon(currentVolume), "Volume");
        vol.onclick = () => toggleVolume(vol);
        
        const bat = createSysBtn(ICONS.battery, "Battery");
        const batTxt = document.createElement("span");
        batTxt.style.cssText = "font-size:12px;margin-left:6px;font-weight:600;color:white;";
        bat.appendChild(batTxt); 
        // Changed bat button style to be a group item for battery text
        bat.classList.add("sys-group-item");
        
        if(navigator.getBattery) navigator.getBattery().then(b => { const u=()=>batTxt.innerText=Math.round(b.level*100)+"%"; u(); b.addEventListener('levelchange',u); });
        else batTxt.innerText = "100%";

        // Append items directly to the taskbarRight, relying on CSS for layout.
        taskbarRight.append(wifi, vol, bat);

        const clock = document.createElement("div");
        clock.id = "clock-box";
        // Streamline clock style
        clock.style.cssText = "margin-left:12px;display:flex;align-items:center;gap:6px;color:#fff;font-size:13px;font-weight:500;white-space:nowrap;padding: 0 5px;";
        taskbarRight.appendChild(clock);
        
        setInterval(() => {
            const now = new Date();
            // Simpler clock format: Time | Date
            clock.innerHTML = `<span>${now.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span><span style="opacity:0.4">|</span><span style="opacity:0.9">${now.toLocaleDateString([],{month:'short',day:'numeric'})}</span>`;
        }, 1000);

        renderProfile();
    }

    function createSysBtn(html, title) {
        const b = document.createElement("button");
        b.className = "sys-btn"; b.innerHTML = html; b.title = title;
        return b;
    }

    function renderProfile() {
        const taskbarRight = document.getElementById("taskbar-right");
        const existing = document.getElementById("taskbar-profile");
        if(existing) existing.remove();

        const u = JSON.parse(sessionStorage.getItem("webunix_session_v2")||"{}").user || "Guest";
        const all = JSON.parse(localStorage.getItem("webunix_users_v2")||"{}");
        const av = (all[u]||{}).avatar;

        const p = document.createElement("div");
        p.id = "taskbar-profile";
        const img = av 
            ? `<img src="${av}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;">` // Smaller avatar
            : `<div class="profile-avatar" style="width:28px;height:28px;border-radius:50%;background:hsl(${u.length*50},70%,50%);display:grid;place-items:center;color:white;font-weight:bold;font-size:13px;">${u[0].toUpperCase()}</div>`;
        
        p.innerHTML = `${img}<div class="profile-name">${u}</div>`;

        p.onclick = async () => {
            if(await window.Modal.confirm(`Log out of session for ${u}?`, "End Session", true)) {
                sessionStorage.removeItem("webunix_session_v2");
                location.reload();
            }
        };
        taskbarRight.appendChild(p);
    }

    buildDock();
    buildTray();
})();