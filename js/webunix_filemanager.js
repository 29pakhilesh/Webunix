// js/webunix_filemanager.js
(function(){
  const VFS_KEY = "webunix_vfs";
  function loadVFS(){ try { return JSON.parse(localStorage.getItem(VFS_KEY)) || {}; } catch(e){ return {}; } }
  function saveVFS(vfs){ localStorage.setItem(VFS_KEY, JSON.stringify(vfs)); }

  let vfs = loadVFS();
  if(!Object.keys(vfs).length) { vfs["README.txt"] = "Welcome."; saveVFS(vfs); }

  window.openFileManager = function(){
    if(document.getElementById("filemgr-window")) {
        const w = document.getElementById("filemgr-window");
        if(window.wm) w.style.zIndex = ++window.wm.zIndex;
        return;
    }

    const win = document.createElement("div");
    win.id = "filemgr-window";
    win.className = "app-window";
    win.style.width = "650px";
    win.style.height = "450px";
    win.style.background = "#1c1c1e";
    win.style.display = "flex";
    win.style.flexDirection = "column";
    
    const pid = window.kernel?.process?.spawn ? window.kernel.process.spawn("FileManager", win) : Date.now();
    
    win.innerHTML = `
      <div class="title-bar" style="background:#2c2c2e; padding:0 12px; height:36px; border-bottom:1px solid #3a3a3c;">
        <span style="font-weight:600; font-size:13px; color:#fff;">File Manager</span>
        <button class="close-btn" style="background:#ff5f56; border:none; width:12px; height:12px; border-radius:50%; cursor:pointer;"></button>
      </div>
      <div style="flex:1; display:flex; overflow:hidden;">
        <div id="fm-sidebar" style="width:200px; background:#252526; border-right:1px solid #333; overflow-y:auto; padding:10px; display:flex; flex-direction:column; gap:2px;"></div>
        <div style="flex:1; display:flex; flex-direction:column; background:#1e1e1e;">
            <div style="padding:15px; border-bottom:1px solid #333; display:flex; gap:10px; align-items:center;">
                <input id="new-fname" placeholder="filename.txt" style="flex:1; padding:8px; background:#2b2b2b; border:1px solid #444; color:white; border-radius:6px; outline:none;">
                <button id="create-file" style="padding:8px 16px; background:#fff; color:#000; border:none; border-radius:6px; font-weight:600; cursor:pointer;">Create</button>
                <button id="delete-file" style="padding:8px 16px; background:#3a3a3c; color:#ff453a; border:1px solid #444; border-radius:6px; font-weight:600; cursor:pointer;">Delete</button>
            </div>
            <div style="flex:1; padding:20px; overflow:hidden; display:flex; flex-direction:column;">
                <div id="preview-label" style="font-size:11px; font-weight:bold; color:#666; margin-bottom:8px;">NO FILE</div>
                <div id="file-preview" style="flex:1; background:#111; border:1px solid #333; border-radius:6px; color:#ddd; padding:15px; font-family:monospace; overflow:auto; white-space:pre-wrap;"></div>
            </div>
            <div style="padding:10px 20px; background:#252526; border-top:1px solid #333; text-align:right;">
                <button id="open-in-editor" style="padding:6px 14px; background:var(--accent-color, #0984e3); color:white; border:none; border-radius:4px; opacity:0.5; pointer-events:none;">Open in Editor ↗</button>
            </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(win);
    if(window.wm) window.wm.register(win);

    const close = win.querySelector(".close-btn");
    const sidebar = win.querySelector("#fm-sidebar");
    const preview = win.querySelector("#file-preview");
    const previewLbl = win.querySelector("#preview-label");
    const newF = win.querySelector("#new-fname");
    const openBtn = win.querySelector("#open-in-editor");
    let selected = null;

    close.onclick = () => window.kernel?.process?.kill(pid) || win.remove();

    function renderList(){
      vfs = loadVFS();
      sidebar.innerHTML = "";
      Object.keys(vfs).sort().forEach(name => {
        const item = document.createElement("div");
        const isSel = (name === selected);
        item.style.cssText = `padding:8px; cursor:pointer; border-radius:6px; font-size:13px; color:${isSel?'white':'#ccc'}; background:${isSel?'var(--accent-color,#0984e3)':'transparent'};`;
        item.innerHTML = `<span style="margin-right:8px;">${name.includes('.')?'📄':'📦'}</span>${name}`;
        item.onclick = () => selectFile(name);
        sidebar.appendChild(item);
      });
    }

    function selectFile(name){
      selected = name;
      renderList();
      previewLbl.textContent = name.toUpperCase();
      preview.textContent = vfs[name] || "";
      newF.value = name;
      openBtn.style.opacity = "1";
      openBtn.style.pointerEvents = "auto";
    }

    win.querySelector("#create-file").onclick = () => {
      const name = (newF.value || "").trim();
      if(!name) return;
      if(vfs[name]) return window.Modal.alert("File already exists", "Error");
      vfs[name] = "";
      saveVFS(vfs);
      selectFile(name);
    };

    win.querySelector("#delete-file").onclick = async () => {
      if(!selected) return;
      if(await window.Modal.confirm(`Permanently delete "${selected}"?`, "Delete File", true)) {
          delete vfs[selected];
          saveVFS(vfs);
          selected = null;
          preview.textContent = "";
          renderList();
      }
    };

    openBtn.onclick = () => {
      if(selected && window.openEditor) window.openEditor(selected, vfs[selected]);
    };

    renderList();
  };
})();