// js/webunix_process_manager.js
// Advanced Process Lifecycle Management (PIDs, Kill signals, Registry)

(function() {
    // Kernel-level Process Registry
    const processes = new Map();
    let pidCounter = 1000;

    window.kernel = window.kernel || {};
    
    window.kernel.process = {
        spawn: (name, windowElement) => {
            const pid = pidCounter++;
            const proc = {
                pid: pid,
                name: name,
                window: windowElement,
                startTime: new Date(),
                status: 'running'
            };
            
            // Attach PID to the DOM element for reverse-lookup
            windowElement.dataset.pid = pid;
            processes.set(pid, proc);
            
            // Notify taskbar (optional hook)
            if(window.webunixTaskbar && window.webunixTaskbar.notify) {
                // window.webunixTaskbar.notify("Process Started", `${name} (PID: ${pid})`);
            }
            
            return pid;
        },

        kill: (pid) => {
            pid = parseInt(pid);
            if (!processes.has(pid)) return { ok: false, msg: "PID not found" };

            const proc = processes.get(pid);
            if (proc.window) {
                // Animate closing
                proc.window.style.transition = "transform 0.15s, opacity 0.15s";
                proc.window.style.transform = "scale(0.9)";
                proc.window.style.opacity = "0";
                setTimeout(() => proc.window.remove(), 150);
            }
            processes.delete(pid);
            return { ok: true, msg: `Process ${pid} killed` };
        },

        list: () => Array.from(processes.values())
    };

    // UI Application: Process Manager Window
    window.openProcessManager = function () {
        if (document.getElementById("procman-window")) return;

        const win = document.createElement("div");
        win.id = "procman-window";
        win.className = "app-window";
        win.style.width = "400px";
        win.style.height = "350px";

        // Register self as a process
        const pid = window.kernel.process.spawn("ProcessManager", win);

        win.innerHTML = `
          <div class="title-bar">
            <span>Task Manager (PID: ${pid})</span>
            <button class="close-btn">×</button>
          </div>
          <div class="proc-header" style="display:flex;padding:5px 10px;background:#222;font-weight:bold;border-bottom:1px solid #333;">
             <span style="flex:1">Name</span>
             <span style="width:60px">PID</span>
             <span style="width:60px">Action</span>
          </div>
          <div id="proc-list" style="flex:1; overflow-y:auto; background:#111; color:#ddd;"></div>
          <div style="padding:8px; display:flex; justify-content:flex-end; border-top:1px solid #333;">
            <button id="proc-refresh" style="padding:4px 12px;">Refresh</button>
          </div>
        `;

        document.body.appendChild(win);
        
        // Use the new Window Manager capabilities (defined in main.js)
        if(window.wm && window.wm.register) window.wm.register(win);

        win.querySelector(".close-btn").onclick = () => window.kernel.process.kill(pid);
        
        const listEl = win.querySelector("#proc-list");

        function render() {
            listEl.innerHTML = "";
            window.kernel.process.list().forEach(p => {
                const row = document.createElement("div");
                row.style.display = "flex";
                row.style.padding = "6px 10px";
                row.style.borderBottom = "1px solid #1a1a1a";
                row.style.alignItems = "center";
                
                row.innerHTML = `
                  <span style="flex:1; font-weight:500;">${p.name}</span>
                  <span style="width:60px; opacity:0.7; font-family:monospace;">${p.pid}</span>
                  <button class="kill-btn" style="width:60px; padding:2px; background:#d32f2f; border:none; color:white; border-radius:3px; cursor:pointer;">End</button>
                `;
                
                row.querySelector(".kill-btn").onclick = () => {
                    window.kernel.process.kill(p.pid);
                    render();
                };
                listEl.appendChild(row);
            });
        }

        win.querySelector("#proc-refresh").onclick = render;
        render();
        // Auto-refresh every 2 seconds
        const interval = setInterval(() => {
            if(!document.body.contains(win)) clearInterval(interval);
            else render();
        }, 2000);
    };
})();