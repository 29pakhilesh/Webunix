// js/webunix_terminal.js - Advanced Hacker Terminal
// Features: History, Tab Completion, Boot Animation, Color Themes

window.openTerminal = function () {
    // 1. Create Window
    const win = document.createElement("div");
    win.className = "app-window terminal-theme";
    win.style.width = "600px";
    win.style.height = "400px";
    
    // 2. HTML Structure (Inline styles force visibility)
    win.innerHTML = `
        <div class="title-bar" style="background:#333; color:#ddd;">
            <span style="font-family:monospace;">root@webunix:~</span>
            <button class="close-btn">×</button>
        </div>
        <div class="term-body" style="flex:1; background:#0c0c0c; padding:10px; overflow-y:auto; font-family:'Courier New', monospace; font-size:14px; color:#0f0; text-shadow:0 0 2px #0f0;">
            <div id="term-output"></div>
            <div style="display:flex; margin-top:5px;">
                <span id="term-prompt" style="color:#0f0; margin-right:8px;">➜ ~</span>
                <input id="term-input" type="text" autocomplete="off" spellcheck="false" 
                    style="flex:1; background:transparent; border:none; color:#fff; outline:none; font-family:inherit; font-size:inherit; font-weight:bold;">
            </div>
        </div>
    `;

    document.body.appendChild(win);
    
    // Register with Window Manager if available
    if(window.wm && window.wm.register) window.wm.register(win);

    // 3. Logic
    const out = win.querySelector("#term-output");
    const inp = win.querySelector("#term-input");
    const prompt = win.querySelector("#term-prompt");
    const closeBtn = win.querySelector(".close-btn");

    closeBtn.onclick = () => win.remove();
    
    // Auto-focus input when clicking anywhere in terminal
    win.onclick = () => {
        inp.focus();
        win.style.zIndex = (window.wm ? ++window.wm.zIndex : 9999);
    };

    // Helper: Print Line
    function print(text, color = "#0f0") {
        const div = document.createElement("div");
        div.style.color = color;
        div.style.marginBottom = "2px";
        div.style.whiteSpace = "pre-wrap"; // Preserve spaces
        div.innerHTML = text;
        out.appendChild(div);
        // Auto scroll to bottom
        win.querySelector(".term-body").scrollTop = win.querySelector(".term-body").scrollHeight;
    }

    // --- BOOT ANIMATION ---
    const bootLines = [
        "Initializing WebUnix Kernel v3.0...",
        "Loading VFS... [OK]",
        "Mounting /home/user... [OK]",
        "Starting shell... [OK]",
        " "
    ];
    
    let lineIdx = 0;
    function runBoot() {
        if(lineIdx < bootLines.length) {
            print(bootLines[lineIdx], "#00ff00");
            lineIdx++;
            setTimeout(runBoot, 150);
        } else {
            print("Welcome to WebUnix. Type 'help' for commands.", "#fff");
        }
    }
    runBoot();

    // --- COMMAND HISTORY ---
    let history = [];
    let historyIdx = -1;

    // --- COMMAND PROCESSING ---
    inp.addEventListener("keydown", async (e) => {
        if (e.key === "Enter") {
            const raw = inp.value;
            if(!raw.trim()) {
                print(prompt.innerText + " ", "#555");
                return;
            }
            
            // Print command to output
            print(prompt.innerText + " " + raw, "#fff");
            
            // Save history
            history.push(raw);
            historyIdx = history.length;
            inp.value = "";

            // Execute
            await runCommand(raw);
        }
        else if (e.key === "ArrowUp") {
            e.preventDefault();
            if(historyIdx > 0) {
                historyIdx--;
                inp.value = history[historyIdx];
            }
        }
        else if (e.key === "ArrowDown") {
            e.preventDefault();
            if(historyIdx < history.length - 1) {
                historyIdx++;
                inp.value = history[historyIdx];
            } else {
                historyIdx = history.length;
                inp.value = "";
            }
        }
    });

    async function runCommand(raw) {
        const parts = raw.trim().split(" ");
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        switch(cmd) {
            case "help":
                print("Commands: help, clear, echo, date, whoami, reboot, <span style='color:cyan'>ls, cd, mkdir, cat</span>, <span style='color:orange'>pkg</span>, matrix");
                break;
            case "clear":
                out.innerHTML = "";
                break;
            case "echo":
                print(args.join(" "));
                break;
            case "whoami":
                const u = JSON.parse(sessionStorage.getItem("webunix_session_v2") || "{}");
                print(u.user || "guest", "cyan");
                break;
            case "date":
                print(new Date().toString());
                break;
            case "reboot":
                print("Rebooting system...", "red");
                setTimeout(() => location.reload(), 1000);
                break;
            case "matrix":
                print("Wake up, Neo...", "#0f0");
                // Matrix rain effect hook can go here
                break;
                
            // --- PACKAGE MANAGER ---
            case "pkg":
                if(args[0] === "install" && args[1]) {
                    print(`Downloading package: ${args[1]}...`, "yellow");
                    setTimeout(() => {
                        let installed = JSON.parse(localStorage.getItem("webunix_packages") || "[]");
                        if(!installed.includes(args[1])) installed.push(args[1]);
                        localStorage.setItem("webunix_packages", JSON.stringify(installed));
                        print(`Successfully installed ${args[1]}`, "#0f0");
                    }, 1500);
                } else if(args[0] === "list") {
                    print("Available: calculator, neofetch, cmatrix", "cyan");
                } else {
                    print("Usage: pkg install <name>");
                }
                break;
                
            // --- FILE SYSTEM (VFS) HOOKS ---
            case "ls":
            case "dir":
                // If VFS exists, list keys
                if(window.vfs && window.vfs.read) {
                     // Simple root listing for now
                     const root = window.vfs.loadVFS()["/"].children;
                     const files = Object.keys(root).map(k => root[k].type === 'directory' ? `<span style='color:cyan'>${k}/</span>` : k).join("  ");
                     print(files || "(empty directory)");
                } else {
                     print("FileSystem not loaded.", "red");
                }
                break;

            default:
                print(`Command not found: ${cmd}`, "red");
        }
    }
    
    // Initial focus
    setTimeout(() => inp.focus(), 100);
};