// js/webunix_editor.js
// Simple editor that prefers Monaco if available, falls back to textarea.
// Usage: window.openEditor(filename?, content?)
window.openEditor = function(filename = "untitled.txt", content = "") {
  // ensure VFS available
  const VFS_KEY = "webunix_vfs";
  function loadVFS(){ try { return JSON.parse(localStorage.getItem(VFS_KEY)) || {}; } catch(e){ return {}; } }
  function saveVFS(vfs){ localStorage.setItem(VFS_KEY, JSON.stringify(vfs)); }

  // If called from FileManager with content, prefer that; else load from VFS
  const vfs = loadVFS();
  if(!content && vfs[filename]) content = vfs[filename];

  // create window
  const win = document.createElement("div");
  win.className = "app-window";
  win.style.width = "720px";
  win.style.height = "480px";
  win.id = "editor-window-" + Date.now();
  win.innerHTML = `
    <div class="title-bar"><span>Editor — ${filename}</span><div style="display:flex;gap:6px;">
      <button id="editor-save">Save</button>
      <button id="editor-download">Download</button>
      <button class="close-btn">×</button>
    </div></div>
    <div id="editor-body" style="flex:1;display:flex;flex-direction:column;overflow:hidden;"></div>
  `;
  document.body.appendChild(win);
  const body = win.querySelector("#editor-body");
  const saveBtn = win.querySelector("#editor-save");
  const dlBtn = win.querySelector("#editor-download");
  win.querySelector(".close-btn").onclick = () => win.remove();

  // Try Monaco
  function useTextarea() {
    body.innerHTML = `<textarea id="editor-ta" style="flex:1;width:100%;height:100%;background:#050505;color:#ddd;border:none;padding:10px;font-family:monospace;">${content.replace(/</g,"&lt;")}</textarea>`;
    const ta = body.querySelector("#editor-ta");
    saveBtn.onclick = () => {
      const v = ta.value;
      const nv = loadVFS();
      nv[filename] = v;
      saveVFS(nv);
      alert("Saved");
    };
    dlBtn.onclick = () => {
      const blob = new Blob([ta.value], {type:"text/plain"});
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    };
  }

  if (window.monaco && window.monaco.editor) {
    body.innerHTML = `<div id="monaco-${Date.now()}" style="flex:1;height:100%;"></div>`;
    const mount = body.firstElementChild;
    const model = monaco.editor.createModel(content, "plaintext");
    const editor = monaco.editor.create(mount, { model, automaticLayout: true, minimap: { enabled: false } });
    saveBtn.onclick = () => {
      const v = model.getValue();
      const nv = loadVFS(); nv[filename] = v; saveVFS(nv); alert("Saved");
    };
    dlBtn.onclick = () => {
      const blob = new Blob([model.getValue()], {type:"text/plain"});
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    };
  } else if (window.require && typeof window.require === "function") {
    // attempt to load monaco via AMD if loader present
    try {
      require(["vs/editor/editor.main"], function() {
        if (window.monaco && window.monaco.editor) {
          // small delay to ensure CSS/layout
          setTimeout(() => window.openEditor(filename, content), 50);
        } else useTextarea();
      }, useTextarea);
    } catch (e) { useTextarea(); }
  } else {
    useTextarea();
  }

  // focus helper
  win.onclick = () => win.style.zIndex = Date.now();
};
