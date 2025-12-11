// js/webunix_main.js - Core OS, Window Manager & System Modals

// --- 0. SYSTEM ENGINE (Global Tools) ---
window.Modal = {
    _create: (html) => {
        return new Promise((resolve) => {
            const overlay = document.createElement("div");
            overlay.className = "sys-modal-overlay";
            overlay.style.cssText = `position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:99999;animation:fadeIn 0.2s ease-out;`;
            const box = document.createElement("div");
            box.className = "sys-modal-box";
            box.style.cssText = `background:#1e1e1e;border:1px solid #444;width:340px;padding:25px;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.8);transform:scale(0.9);animation:popIn 0.2s cubic-bezier(0.2,0.8,0.2,1) forwards;text-align:center;color:white;font-family:-apple-system,system-ui,sans-serif;`;
            box.innerHTML = html;
            overlay.appendChild(box);
            document.body.appendChild(overlay);
            const close = (val) => { overlay.style.opacity = "0"; setTimeout(() => { overlay.remove(); resolve(val); }, 150); };
            const btnOk = box.querySelector(".btn-ok");
            const btnCancel = box.querySelector(".btn-cancel");
            const input = box.querySelector("input");
            if(btnOk) btnOk.onclick = () => close(input ? input.value : true);
            if(btnCancel) btnCancel.onclick = () => close(false);
            if(input) { input.focus(); input.onkeydown = (e) => { if(e.key === 'Enter') btnOk.click(); }; }
            overlay.onclick = (e) => { if(e.target === overlay) close(false); };
        });
    },
    alert: async (msg, title="Notice") => window.Modal._create(`<h3 style="margin:0 0 10px;font-size:18px;color:white;">${title}</h3><p style="margin:0 0 25px;font-size:14px;color:#ccc;line-height:1.5;">${msg}</p><button class="btn-ok" style="width:100%;padding:10px;background:#1e90ff;border:none;color:white;border-radius:6px;cursor:pointer;font-weight:600;">OK</button>`),
    confirm: async (msg, title="Confirm", danger=false) => window.Modal._create(`<h3 style="margin:0 0 10px;font-size:18px;color:white;">${title}</h3><p style="margin:0 0 25px;font-size:14px;color:#ccc;line-height:1.5;">${msg}</p><div style="display:flex;gap:10px;"><button class="btn-cancel" style="flex:1;padding:10px;background:#333;border:none;color:white;border-radius:6px;cursor:pointer;">Cancel</button><button class="btn-ok" style="flex:1;padding:10px;background:${danger?"#ff4757":"#1e90ff"};border:none;color:white;border-radius:6px;cursor:pointer;font-weight:600;">Confirm</button></div>`),
    prompt: async (msg, val="", title="Input") => { const res = await window.Modal._create(`<h3 style="margin:0 0 10px;font-size:18px;color:white;">${title}</h3><p style="margin:0 0 15px;font-size:14px;color:#ccc;">${msg}</p><input value="${val}" style="width:100%;padding:10px;background:#2b2b2b;border:1px solid #444;color:white;border-radius:6px;outline:none;margin-bottom:20px;"><div style="display:flex;gap:10px;"><button class="btn-cancel" style="flex:1;padding:10px;background:#333;border:none;color:white;border-radius:6px;cursor:pointer;">Cancel</button><button class="btn-ok" style="flex:1;padding:10px;background:#1e90ff;border:none;color:white;border-radius:6px;cursor:pointer;font-weight:600;">Submit</button></div>`); return res === false ? null : res; }
};

// --- 1. WINDOW MANAGER ---
window.wm = {
    zIndex: 100,
    register: (win) => {
        win.addEventListener("mousedown", () => win.style.zIndex = ++window.wm.zIndex);
        const bar = win.querySelector(".title-bar");
        if(bar) {
            let drag=false, sx, sy, lx, ly;
            bar.addEventListener("mousedown",e=>{if(e.target.tagName==="BUTTON")return;drag=true;sx=e.clientX;sy=e.clientY;lx=win.offsetLeft;ly=win.offsetTop;win.style.zIndex=++window.wm.zIndex;});
            document.addEventListener("mousemove",e=>{if(drag){win.style.left=(lx+e.clientX-sx)+"px";win.style.top=(ly+e.clientY-sy)+"px";}});
            document.addEventListener("mouseup",()=>drag=false);
        }
        const r = document.createElement("div"); r.className="win-resizer"; win.appendChild(r);
        let res=false, sw, sh, rx, ry;
        r.addEventListener("mousedown",e=>{res=true;rx=e.clientX;ry=e.clientY;sw=win.offsetWidth;sh=win.offsetHeight;e.stopPropagation();});
        document.addEventListener("mousemove",e=>{if(res){win.style.width=Math.max(200,sw+e.clientX-rx)+"px";win.style.height=Math.max(150,sh+e.clientY-ry)+"px";}});
        document.addEventListener("mouseup",()=>res=false);
    }
};

// --- GLOBAL LAUNCHER ---
window.launch = (app) => {
    const sm = document.getElementById("start-menu");
    if(sm) sm.classList.add("hidden");
    
    if(app === "Terminal") window.openTerminal?.();
    else if(app === "FileManager") window.openFileManager?.();
    else if(app === "Editor") window.openEditor?.();
    else if(app === "Settings") window.openSettings?.();
    else window.Modal.alert(app + " is not installed.", "System");
};

// --- DOM LOGIC ---
document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("start-button");
    let startMenu = null;

    // This is the function you were looking for!
    function renderStartMenuContent(menuEl) {
        const u = JSON.parse(sessionStorage.getItem("webunix_session_v2") || "{}");
        const username = u.user || "User";
        
        // App Grid Data
        const apps = [
            { name: "Terminal", action: "launch('Terminal')", bg: "#2d3436", icon: `<svg viewBox="0 0 24 24"><path d="M20,4H4C2.9,4,2,4.9,2,6v12c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V6C22,4.9,21.1,4,20,4z M20,18H4V6h16V18z M7.5,15l4.5-4.5L7.5,6v9z M12,15h7v-2h-7V15z" fill="white"/></svg>` },
            { name: "Files", action: "launch('FileManager')", bg: "#0984e3", icon: `<svg viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" fill="white"/></svg>` },
            { name: "Editor", action: "launch('Editor')", bg: "#00b894", icon: `<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="white"/></svg>` },
            { name: "Settings", action: "launch('Settings')", bg: "#636e72", icon: `<svg viewBox="0 0 24 24"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47-0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z" fill="white"/></svg>` },
            { name: "Tasks", action: "window.openProcessManager()", bg: "#e17055", icon: `<svg viewBox="0 0 24 24"><path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zM16.2 13H19v6h-2.8z" fill="white"/></svg>` },
            { name: "Store", action: "window.Modal.alert('Store is offline.', 'WebUnix')", bg: "#d63031", icon: `<svg viewBox="0 0 24 24"><path d="M20,6h-4c0-2.21-1.79-4-4-4S8,3.79,8,6H4C2.9,6,2,6.9,2,8v12c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V8 C22,6.9,21.1,6,20,6z M12,4c1.1,0,2,0.9,2,2h-4C10,4.9,10.9,4,12,4z M20,20H4V8h16V20z" fill="white"/></svg>` },
            { name: "Clock", action: "window.Modal.alert('Time: ' + new Date().toLocaleTimeString(), 'System Clock')", bg: "#6c5ce7", icon: `<svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="white"/></svg>` },
            { name: "Browser", action: "window.Modal.alert('Connecting...', 'Satellite Uplink')", bg: "#0984e3", icon: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="white"/></svg>` }
        ];

        // Generate HTML with FIXED footer layout
        menuEl.innerHTML = `
            <div class="sm-grid-container">
                ${apps.map(app => `
                    <div class="sm-app-card" onclick="${app.action}">
                        <div class="sm-icon-square" style="background:${app.bg}">${app.icon}</div>
                        <span class="sm-app-label">${app.name}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="sm-system-bar">
                <div class="sm-user-info" onclick="window.Modal.alert('Logged in as ${username}')">
                    <div class="sm-avatar-circle">${username[0].toUpperCase()}</div>
                    <span>${username}</span>
                </div>
                
                <button class="sm-power-btn" onclick="window.openShutdownMenu()" title="Shut Down">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                        <line x1="12" y1="2" x2="12" y2="12"></line>
                    </svg>
                </button>
            </div>
        `;
    }

    // Initialize Menu
    function buildMenu() {
        startMenu = document.createElement("div");
        startMenu.id = "start-menu";
        startMenu.className = "hidden";
        document.body.appendChild(startMenu);
        renderStartMenuContent(startMenu);
    }

    // Button Click
    startBtn.onclick = (e) => {
        e.stopPropagation();
        
        if (!document.getElementById("start-menu")) {
            buildMenu();
        }
        
        startMenu = document.getElementById("start-menu");
        
        // Re-render to ensure user info is fresh
        renderStartMenuContent(startMenu);
        
        // Smart Position
        const rect = startBtn.getBoundingClientRect();
        startMenu.style.left = rect.left + "px";
        startMenu.style.bottom = (window.innerHeight - rect.top + 12) + "px";
        
        startMenu.classList.toggle("hidden");
    };

    // Close on Outside Click
    document.addEventListener("click", (e) => {
        const sm = document.getElementById("start-menu");
        if(sm && !sm.classList.contains("hidden") && !sm.contains(e.target) && !startBtn.contains(e.target)) {
            sm.classList.add("hidden");
        }
    });

    if (sessionStorage.getItem("webunix_session_v2")) {
        document.getElementById("login-screen")?.classList.add("hidden");
        document.getElementById("desktop")?.classList.remove("hidden");
    }
});

// Animations
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
`;
document.head.appendChild(styleSheet);