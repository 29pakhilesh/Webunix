// js/webunix_settings.js
// Simple Settings app: theme (dark/light) + set wallpaper via URL (applies to desktop & login), persisted to localStorage

window.openSettings = function() {
  if (document.getElementById("settings-window")) return document.getElementById("settings-window").style.zIndex = Date.now();
  const win = document.createElement("div");
  win.id = "settings-window";
  win.className = "app-window";
  win.style.width = "420px";
  win.style.height = "260px";
  win.innerHTML = `
    <div class="title-bar"><span>Settings</span><button class="close-btn">×</button></div>
    <div style="padding:12px;display:flex;flex-direction:column;gap:10px;">
      <label>Theme:
        <select id="setting-theme"><option value="dark">Dark</option><option value="light">Light</option></select>
      </label>
      <label>Wallpaper URL:
        <input id="setting-wall" placeholder="https://example.com/wall.jpg" style="width:100%;padding:6px;background:#111;border:none;color:#fff;border-radius:4px;">
      </label>
      <div style="display:flex;gap:8px;justify-content:flex-end;">
        <button id="save-settings">Save</button>
        <button id="reset-settings">Reset</button>
      </div>
    </div>
  `;
  document.body.appendChild(win);
  win.querySelector(".close-btn").onclick = () => win.remove();

  const THEME_KEY = "webunix_theme";
  const WALL_KEY = "webunix_wallpaper";

  const themeSel = win.querySelector("#setting-theme");
  const wallInp = win.querySelector("#setting-wall");
  const saveBtn = win.querySelector("#save-settings");
  const resetBtn = win.querySelector("#reset-settings");

  // load
  const curTheme = localStorage.getItem(THEME_KEY) || "dark";
  const curWall = localStorage.getItem(WALL_KEY) || "";
  themeSel.value = curTheme;
  wallInp.value = curWall;

  function applySettings(theme, wallpaper) {
    document.documentElement.setAttribute("data-theme", theme);
    const desktop = document.getElementById("desktop");
    const login = document.getElementById("login-screen");
    if (wallpaper) {
      if (desktop) desktop.style.backgroundImage = `url("${wallpaper}")`;
      if (login) login.style.backgroundImage = `url("${wallpaper}")`;
    } else {
      if (desktop) desktop.style.backgroundImage = "";
      if (login) login.style.backgroundImage = "";
    }
  }

  // immediate apply on save
  saveBtn.onclick = () => {
    const t = themeSel.value;
    const w = wallInp.value.trim();
    localStorage.setItem(THEME_KEY, t);
    localStorage.setItem(WALL_KEY, w);
    applySettings(t, w);
    alert("Settings saved");
  };

  resetBtn.onclick = () => {
    localStorage.removeItem(THEME_KEY);
    localStorage.removeItem(WALL_KEY);
    themeSel.value = "dark";
    wallInp.value = "";
    applySettings("dark", "");
    alert("Reset to defaults");
  };

  // apply stored at open
  applySettings(curTheme, curWall);
  win.style.zIndex = Date.now();
};
