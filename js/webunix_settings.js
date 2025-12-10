// js/webunix_settings.js
// Settings App with Dragging Enabled

window.openSettings = function() {
  if (document.getElementById("settings-window")) {
      const win = document.getElementById("settings-window");
      if(window.wm) win.style.zIndex = ++window.wm.zIndex;
      return;
  }

  const win = document.createElement("div");
  win.id = "settings-window";
  win.className = "app-window";
  
  // NEW: Register with Process Manager
  const pid = window.kernel?.process?.spawn ? window.kernel.process.spawn("Settings", win) : Date.now();
  
  win.style.width = "420px";
  win.style.height = "260px";
  
  win.innerHTML = `
    <div class="title-bar"><span>Settings</span><button class="close-btn">×</button></div>
    <div style="padding:20px; display:flex; flex-direction:column; gap:15px; color:white;">
      <label>
        Theme: 
        <select id="setting-theme" style="padding:5px; border-radius:4px;"><option value="dark">Dark</option><option value="light">Light</option></select>
      </label>
      <label>
        Wallpaper URL:
        <input id="setting-wall" placeholder="https://..." style="width:100%; padding:8px; margin-top:5px; background:#222; border:1px solid #444; color:white; border-radius:4px;">
      </label>
      <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:10px;">
        <button id="save-settings" style="padding:8px 16px; background:#1e90ff; border:none; color:white; border-radius:4px;">Save</button>
        <button id="reset-settings" style="padding:8px 16px;">Reset</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(win);
  
  // --- CRITICAL FIX: ENABLE DRAGGING ---
  if(window.wm && window.wm.register) window.wm.register(win);

  // Logic
  win.querySelector(".close-btn").onclick = () => {
      if(window.kernel?.process) window.kernel.process.kill(pid);
      else win.remove();
  };

  const THEME_KEY = "webunix_theme";
  const WALL_KEY = "webunix_wallpaper";
  const themeSel = win.querySelector("#setting-theme");
  const wallInp = win.querySelector("#setting-wall");
  const saveBtn = win.querySelector("#save-settings");
  const resetBtn = win.querySelector("#reset-settings");

  // Load current
  themeSel.value = localStorage.getItem(THEME_KEY) || "dark";
  wallInp.value = localStorage.getItem(WALL_KEY) || "";

  function apply(theme, wall) {
    document.documentElement.setAttribute("data-theme", theme);
    const bg = wall ? `url("${wall}")` : "";
    if(document.getElementById("desktop")) document.getElementById("desktop").style.backgroundImage = bg;
  }

  saveBtn.onclick = () => {
    localStorage.setItem(THEME_KEY, themeSel.value);
    localStorage.setItem(WALL_KEY, wallInp.value);
    apply(themeSel.value, wallInp.value);
    alert("Saved!");
  };

  resetBtn.onclick = () => {
    localStorage.removeItem(THEME_KEY);
    localStorage.removeItem(WALL_KEY);
    apply("dark", "");
    alert("Reset.");
  };
};