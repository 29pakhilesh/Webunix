// js/webunix_filemanager.js
// Simple in-browser file manager with persistent VFS (localStorage)

(function(){
  const VFS_KEY = "webunix_vfs";
  function loadVFS(){ try { return JSON.parse(localStorage.getItem(VFS_KEY)) || {}; } catch(e){ return {}; } }
  function saveVFS(vfs){ localStorage.setItem(VFS_KEY, JSON.stringify(vfs)); }

  // seed example if empty
  let vfs = loadVFS();
  if(Object.keys(vfs).length === 0){
    vfs["README.txt"] = "Welcome to WebUnix.\nUse the file manager to create/edit files.";
    vfs["notes.md"] = "# Notes\n- Edit me";
    saveVFS(vfs);
  }

  window.openFileManager = function(){
    if(document.getElementById("filemgr-window")) return focusWin();
    const win = document.createElement("div");
    win.id = "filemgr-window";
    win.className = "app-window";
    win.style.width = "520px";
    win.style.height = "360px";
    win.innerHTML = `
      <div class="title-bar"><span>File Manager</span><button class="close-btn">×</button></div>
      <div style="display:flex;flex:1;gap:8px;padding:8px;">
        <div id="file-list" style="width:180px;overflow:auto;background:#111;padding:6px;border-radius:6px;"></div>
        <div style="flex:1;display:flex;flex-direction:column;">
          <div style="margin-bottom:8px;display:flex;gap:6px;">
            <input id="new-fname" placeholder="new-file.txt" style="flex:1;padding:6px;background:#222;border:none;color:white;border-radius:4px;">
            <button id="create-file" style="padding:6px;">Create</button>
            <button id="delete-file" style="padding:6px;">Delete</button>
          </div>
          <div id="file-preview" style="flex:1;background:#050505;color:#ddd;padding:8px;border-radius:6px;font-family:monospace;overflow:auto;"></div>
          <div style="margin-top:8px;display:flex;gap:6px;">
            <button id="open-in-editor" style="padding:8px;">Open in Editor</button>
            <button id="download-file" style="padding:8px;">Download</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(win);

    const close = win.querySelector(".close-btn");
    const listEl = win.querySelector("#file-list");
    const preview = win.querySelector("#file-preview");
    const newF = win.querySelector("#new-fname");
    const createBtn = win.querySelector("#create-file");
    const deleteBtn = win.querySelector("#delete-file");
    const openBtn = win.querySelector("#open-in-editor");
    const dlBtn = win.querySelector("#download-file");

    close.onclick = () => win.remove();

    function renderList(){
      vfs = loadVFS();
      listEl.innerHTML = "";
      Object.keys(vfs).sort().forEach(name => {
        const it = document.createElement("div");
        it.textContent = name;
        it.style.padding = "6px";
        it.style.cursor = "pointer";
        it.style.borderRadius = "4px";
        it.onclick = () => selectFile(name, it);
        listEl.appendChild(it);
      });
      // auto-select first
      const first = listEl.firstChild;
      if(first) first.click();
      else preview.textContent = "";
    }

    let selected = null;
    function selectFile(name, el){
      selected = name;
      Array.from(listEl.children).forEach(c=> c.style.background = "");
      el.style.background = "rgba(255,255,255,0.04)";
      preview.textContent = vfs[name] || "";
      newF.value = name;
    }

    createBtn.onclick = () => {
      const name = (newF.value || "").trim();
      if(!name) return newF.focus();
      if(vfs[name]) { alert("File exists"); return; }
      vfs[name] = "";
      saveVFS(vfs);
      renderList();
      // select created
      Array.from(listEl.children).find(n=> n.textContent===name)?.click();
    };

    deleteBtn.onclick = () => {
      if(!selected) return;
      if(!confirm(`Delete ${selected}?`)) return;
      delete vfs[selected];
      saveVFS(vfs);
      selected = null;
      renderList();
    };

    openBtn.onclick = () => {
      if(!selected) return alert("Select a file");
      // if editor module provides openEditor(name, content) use it; otherwise create a quick editor
      if(typeof window.openEditor === "function"){
        window.openEditor(selected, vfs[selected]);
      } else {
        quickEditor(selected);
      }
    };

    dlBtn.onclick = () => {
      if(!selected) return;
      const blob = new Blob([vfs[selected]], {type:"text/plain"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = selected; document.body.appendChild(a); a.click();
      a.remove(); URL.revokeObjectURL(url);
    };

    function quickEditor(name){
      const ewin = document.createElement("div");
      ewin.className = "app-window";
      ewin.style.width = "520px";
      ewin.style.height = "360px";
      ewin.innerHTML = `
        <div class="title-bar"><span>Editor — ${name}</span><button class="close-btn">×</button></div>
        <textarea style="flex:1;background:#050505;color:#ddd;padding:8px;border:none;width:100%;height:calc(100% - 40px);font-family:monospace;"></textarea>
        <div style="padding:8px;display:flex;justify-content:flex-end;gap:6px;">
          <button id="save-quick">Save</button>
        </div>
      `;
      document.body.appendChild(ewin);
      const ta = ewin.querySelector("textarea");
      ewin.querySelector(".close-btn").onclick = () => ewin.remove();
      ta.value = vfs[name] || "";
      ewin.querySelector("#save-quick").onclick = () => {
        vfs[name] = ta.value;
        saveVFS(vfs);
        renderList();
        alert("Saved");
      };
    }

    function focusWin(){ win.style.zIndex = Date.now(); win.querySelector(".title-bar").focus?.(); }
    renderList();
    focusWin();
  }; // end openFileManager
})();
