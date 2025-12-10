// js/webunix_editor.js
// Advanced Editor: Supports VFS reading/writing and window management

window.openEditor = function(filename, content) {
  if (!filename) filename = "untitled.txt";
  
  if (content === undefined && filename !== "untitled.txt") {
      if (window.vfs) {
          const path = filename.startsWith('/') ? filename : '/' + filename;
          const entry = window.vfs.read(path); // assuming vfs.read exists/works
          content = (entry && typeof entry === 'string') ? entry : (window.vfs[filename] || ""); 
      }
  }

  const win = document.createElement("div");
  // FIX: Add unique ID for taskbar indicator
  win.id = "editor-window-" + Date.now();
  
  win.className = "app-window";
  win.style.width = "600px";
  win.style.height = "450px";
  
  const pid = window.kernel?.process?.spawn ? window.kernel.process.spawn("Editor", win) : Date.now();
  
  win.innerHTML = `
    <div class="title-bar">
        <span>Editor - ${filename}</span>
        <div class="win-controls">
            <button class="close-btn">×</button>
        </div>
    </div>
    <div style="display:flex; flex-direction:column; height:calc(100% - 30px);">
        <div style="padding:5px; background:#222; display:flex; gap:10px; border-bottom:1px solid #333;">
            <button id="editor-save-${pid}">Save</button>
            <button id="editor-saveas-${pid}">Save As...</button>
        </div>
        <textarea id="editor-area-${pid}" style="flex:1; background:#111; color:#fff; border:none; padding:10px; resize:none; font-family:monospace; outline:none;"></textarea>
    </div>
  `;
  
  document.body.appendChild(win);
  
  if(window.wm && window.wm.register) window.wm.register(win);

  const textArea = win.querySelector(`#editor-area-${pid}`);
  textArea.value = content || "";

  win.querySelector(".close-btn").onclick = () => {
      if(window.kernel?.process) window.kernel.process.kill(pid);
      else win.remove();
  };

  win.querySelector(`#editor-save-${pid}`).onclick = () => {
      if(window.vfs) {
         window.vfs[filename] = textArea.value; 
         alert("Saved!");
      } else {
         alert("No VFS found (check filemanager.js)");
      }
  };
  
  win.querySelector(`#editor-saveas-${pid}`).onclick = () => {
      const newPath = prompt("Save as:", filename);
      if(newPath) {
          filename = newPath;
          win.querySelector(".title-bar span").textContent = `Editor - ${filename}`;
          if(window.vfs) window.vfs[filename] = textArea.value;
          alert("Saved to " + newPath);
      }
  };
};