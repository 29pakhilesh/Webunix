// js/webunix_editor.js
(function() {
    const VFS_KEY = "webunix_vfs";
    function getVFS() { try { return JSON.parse(localStorage.getItem(VFS_KEY)) || {}; } catch(e){ return {}; } }
    function saveToVFS(n, c) { const v = getVFS(); v[n] = c; localStorage.setItem(VFS_KEY, JSON.stringify(v)); }

    window.openEditor = function(filename="untitled.txt", content) {
        if(content === undefined) content = getVFS()[filename] || "";
        
        // FIX: Check if window exists and focus it
        const id = "editor-" + filename.replace(/\W/g,'');
        const existing = document.getElementById(id);
        if(existing) {
            if(window.wm) existing.style.zIndex = ++window.wm.zIndex;
            return;
        }

        const win = document.createElement("div");
        win.id = id; win.className = "app-window";
        win.style.cssText = "width:600px;height:450px;display:flex;flex-direction:column;background:#1e1e1e;";
        const pid = window.kernel?.process?.spawn ? window.kernel.process.spawn("Editor", win) : Date.now();

        win.innerHTML = `
            <div class="title-bar" style="background:#252526;height:32px;display:flex;align-items:center;justify-content:space-between;padding:0 10px;border-bottom:1px solid #333;">
                <span style="font-size:12px;color:#ccc;">${filename}</span><button class="close-btn" style="width:12px;height:12px;background:#ff5f56;border-radius:50%;border:none;"></button>
            </div>
            <div style="padding:6px;background:#2d2d30;border-bottom:1px solid #3e3e42;"><button id="btn-save" style="padding:4px 12px;background:#0e639c;color:white;border:none;border-radius:2px;">Save</button></div>
            <textarea style="flex:1;background:#1e1e1e;color:#d4d4d4;border:none;padding:10px;resize:none;outline:none;font-family:monospace;">${content}</textarea>
        `;
        document.body.appendChild(win);
        if(window.wm) window.wm.register(win);

        const txt = win.querySelector("textarea");
        win.querySelector("#btn-save").onclick = () => {
            saveToVFS(filename, txt.value);
            window.Modal.alert("File Saved Successfully", "Editor");
        };
        win.querySelector(".close-btn").onclick = () => window.kernel?.process?.kill(pid) || win.remove();
    };
})();