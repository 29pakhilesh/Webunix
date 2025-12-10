// js/webunix_filemanager.js
// Advanced File Manager with Drag & Drop Support

(function(){
  const VFS_KEY = "webunix_vfs";
  function loadVFS(){ try { return JSON.parse(localStorage.getItem(VFS_KEY)) || {}; } catch(e){ return {}; } }
  function saveVFS(vfs){ localStorage.setItem(VFS_KEY, JSON.stringify(vfs)); }

  // Seed example if empty
  let vfs = loadVFS();
  if(Object.keys(vfs).length === 0){
    vfs["README.txt"] = "Welcome to WebUnix.\nUse the file manager to create/edit files.";
    saveVFS(vfs);
  }

  window.openFileManager = function(){
    if(document.getElementById("filemgr-window")) {
        const existing = document.getElementById("filemgr-window");
        // Bring to front
        if(window.wm) existing.style.zIndex = ++window.wm.zIndex;
        return;
    }

    const win = document.createElement("div");
    
    // NEW: Register with Process Manager
    const pid = window.kernel?.process?.spawn ? window.kernel.process.spawn("FileManager", win) : Date.now();
    
    // Use fixed ID for Taskbar tracking
    win.id = "filemgr-window";
    
    win.className = "app-window";
    win.style.width = "520px";
    win.style.height = "360px";
    
    // --- HTML UI ---
    win.innerHTML = `
      <div class="title-bar"><span>File Manager</span><button class="close-btn">×</button></div>
      <div style="display:flex;flex:1;gap:8px;padding:8px;">
        <div id="file-list" style="width:180px;overflow:auto;background:#111;padding:6px;border-radius:6px;"></div>
        <div style="flex:1;display:flex;flex-direction:column;">
          <div style="margin-bottom:8px;display:flex;gap:6px;">
            <input id="new-fname" placeholder="filename.txt" style="flex:1;padding:6px;background:#222;border:none;color:white;border-radius:4px;">
            <button id="create-file" style="padding:6px;">Create</button>
            <button id="delete-file" style="padding:6px;">Delete</button>
          </div>
          <div id="file-preview" style="flex:1;background:#050505;color:#ddd;padding:8px;border-radius:6px;font-family:monospace;overflow:auto;"></div>
          <div style="margin-top:8px;display:flex;gap:6px;">
            <button id="open-in-editor" style="padding:8px;">Open in Editor</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(win);

    // --- CRITICAL FIX: ENABLE DRAGGING ---
    if(window.wm && window.wm.register) window.wm.register(win);

    // --- LOGIC ---
    const close = win.querySelector(".close-btn");
    const listEl = win.querySelector("#file-list");
    const preview = win.querySelector("#file-preview");
    const newF = win.querySelector("#new-fname");
    const createBtn = win.querySelector("#create-file");
    const deleteBtn = win.querySelector("#delete-file");
    const openBtn = win.querySelector("#open-in-editor");

    // NEW: Use process manager to kill/close
    close.onclick = () => { 
        if(window.kernel?.process) window.kernel.process.kill(pid);
        else win.remove();
    };

    function renderList(){
      vfs = loadVFS();
      listEl.innerHTML = "";
      Object.keys(vfs).sort().forEach(name => {
        const it = document.createElement("div");
        it.innerHTML = `<b>📄</b> ${name}`;
        it.style.padding = "6px";
        it.style.cursor = "pointer";
        it.style.borderRadius = "4px";
        it.onclick = () => selectFile(name, it);
        listEl.appendChild(it);
      });
    }

    let selected = null;
    function selectFile(name, el){
      selected = name;
      Array.from(listEl.children).forEach(c=> c.style.background = "");
      el.style.background = "#1e90ff";
      preview.textContent = vfs[name] || "";
      newF.value = name;
    }

    createBtn.onclick = () => {
      const name = (newF.value || "").trim();
      if(!name) return;
      if(vfs[name]) return alert("File exists");
      vfs[name] = "";
      saveVFS(vfs);
      renderList();
    };

    deleteBtn.onclick = () => {
      if(!selected) return;
      if(!confirm(`Delete ${selected}?`)) return;
      delete vfs[selected];
      saveVFS(vfs);
      selected = null;
      renderList();
      preview.textContent = "";
    };

    openBtn.onclick = () => {
      if(!selected) return alert("Select a file");
      if(window.openEditor) window.openEditor(selected, vfs[selected]);
    };

    renderList();
  };
})();