// js/webunix_editor.js
// Advanced Editor: Supports VFS reading/writing and window management

window.openEditor = function(filename, content) {
  // If no args, just open empty
  if (!filename) filename = "untitled.txt";
  
  // If content not provided, try to read from VFS (resolve absolute path if possible)
  if (content === undefined && filename !== "untitled.txt") {
      // Assuming filename passed is a full path or simple name from current dir context
      // For this simple version, we'll rely on the VFS global if available
      if (window.vfs) {
          // If it doesn't start with /, assume root for now (or handle relative later)
          const path = filename.startsWith('/') ? filename : '/' + filename;
          const entry = window.vfs.read(path);
          if (entry && entry.type === 'file') {
              content = entry.content;
              filename = path; // Update to full path
          } else {
              content = "";
          }
      }
  }

  const win = document.createElement("div");
  win.className = "app-window";
  win.style.width = "600px";
  win.style.height = "450px";
  
  // Register with Process Manager
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
  
  // Register with Window Manager (Drag support)
  if(window.wm && window.wm.register) window.wm.register(win);

  const textArea = win.querySelector(`#editor-area-${pid}`);
  textArea.value = content || "";

  // Close Handler
  win.querySelector(".close-btn").onclick = () => {
      if(window.kernel?.process) window.kernel.process.kill(pid);
      else win.remove();
  };

  // Save Handler
  win.querySelector(`#editor-save-${pid}`).onclick = () => {
      if(!window.vfs) return alert("File System not loaded!");
      
      const path = filename.startsWith('/') ? filename : '/' + filename;
      const res = window.vfs.write(path, textArea.value);
      
      if(res.ok) {
          // Visual feedback
          const btn = win.querySelector(`#editor-save-${pid}`);
          const oldText = btn.innerText;
          btn.innerText = "Saved!";
          setTimeout(() => btn.innerText = oldText, 1000);
      } else {
          alert("Error saving: " + res.msg);
      }
  };
  
  // Save As Handler
  win.querySelector(`#editor-saveas-${pid}`).onclick = () => {
      const newPath = prompt("Enter full path to save (e.g., /home/notes.txt):", filename);
      if(newPath) {
          const res = window.vfs.write(newPath, textArea.value);
          if(res.ok) {
              filename = newPath;
              win.querySelector(".title-bar span").textContent = `Editor - ${filename}`;
              alert("Saved to " + newPath);
          } else {
              alert(res.msg);
          }
      }
  };
};