// js/webunix_settings.js
window.openSettings = function() {
  if (document.getElementById("settings-window")) {
      const win = document.getElementById("settings-window");
      if(window.wm) win.style.zIndex = ++window.wm.zIndex;
      return;
  }
  const win = document.createElement("div");
  win.id = "settings-window";
  win.className = "app-window";
  win.style.width = "550px";
  win.style.height = "450px";
  
  const pid = window.kernel?.process?.spawn ? window.kernel.process.spawn("Settings", win) : Date.now();
  
  win.innerHTML = `
    <div class="title-bar"><span>Settings</span><button class="close-btn">×</button></div>
    <div class="settings-container">
        <div class="settings-sidebar">
            <div class="settings-nav-item active" onclick="switchTab('appearance', this)">Appearance</div>
            <div class="settings-nav-item" onclick="switchTab('account', this)">Account</div>
            <div class="settings-nav-item" onclick="switchTab('system', this)">System</div>
        </div>
        <div class="settings-content" id="st-content"></div>
    </div>
  `;
  document.body.appendChild(win);
  if(window.wm) window.wm.register(win);

  const content = win.querySelector("#st-content");
  win.querySelector(".close-btn").onclick = () => window.kernel?.process?.kill(pid) || win.remove();

  const SETTINGS = {
      theme: localStorage.getItem("webunix_theme") || "dark",
      wall: localStorage.getItem("webunix_wallpaper") || "",
      accent: localStorage.getItem("webunix_accent") || "#1e90ff"
  };

  window.applySystemSettings = () => {
      document.documentElement.setAttribute("data-theme", SETTINGS.theme);
      document.documentElement.style.setProperty('--accent-color', SETTINGS.accent);
      const d = document.getElementById("desktop");
      if(d) d.style.backgroundImage = SETTINGS.wall ? `url("${SETTINGS.wall}")` : "";
  };
  window.applySystemSettings();

  const renderAppearance = () => `
    <div class="st-group"><span class="st-label">Personalization</span>
        <div class="st-row"><span>Accent</span><input type="color" id="inp-accent" value="${SETTINGS.accent}" style="border:none;background:none;width:40px;"></div>
        <div class="st-row"><span>Wallpaper</span></div><input class="st-input" id="inp-wall" value="${SETTINGS.wall}">
    </div>
    <button class="st-btn primary" id="btn-save-look">Apply</button>
  `;

  const renderAccount = () => {
      const u = JSON.parse(sessionStorage.getItem("webunix_session_v2") || "{}").user || "Guest";
      const users = JSON.parse(localStorage.getItem("webunix_users_v2") || "{}");
      const list = Object.keys(users).map(k => `
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #333;">
            <span>${k}</span>
            ${k===u ? '<span style="font-size:10px;opacity:0.5;">Active</span>' : `<button class="st-btn danger del-user" data-u="${k}" style="padding:2px 8px;">×</button>`}
        </div>`).join('');
      return `<div class="st-group"><span class="st-label">Current: ${u}</span><input class="st-input" id="inp-username" placeholder="New Username"><button class="st-btn" id="btn-update-user" style="margin-top:8px;">Update</button></div><div class="st-group"><span class="st-label">Users</span>${list}</div>`;
  };

  const renderSystem = () => `<div class="st-group"><span class="st-label">System</span><div class="st-row"><span>Ver</span><span>3.5</span></div></div><div class="st-group"><button class="st-btn danger" id="btn-reset">Factory Reset</button></div>`;

  window.switchTab = (tab, nav) => {
      win.querySelectorAll(".settings-nav-item").forEach(e => e.classList.remove("active"));
      nav.classList.add("active");
      if(tab==='appearance') {
          content.innerHTML = renderAppearance();
          win.querySelector("#btn-save-look").onclick = () => {
              SETTINGS.accent = win.querySelector("#inp-accent").value;
              SETTINGS.wall = win.querySelector("#inp-wall").value;
              localStorage.setItem("webunix_accent", SETTINGS.accent);
              localStorage.setItem("webunix_wallpaper", SETTINGS.wall);
              window.applySystemSettings();
              window.Modal.alert("Settings Applied", "Success");
          };
      }
      if(tab==='account') {
          content.innerHTML = renderAccount();
          win.querySelector("#btn-update-user").onclick = async () => {
              const val = win.querySelector("#inp-username").value.trim();
              if(val && await window.Modal.confirm("Change username and logout?", "Update Profile")) {
                  const s = JSON.parse(sessionStorage.getItem("webunix_session_v2"));
                  const users = JSON.parse(localStorage.getItem("webunix_users_v2"));
                  users[val] = users[s.user]; delete users[s.user];
                  s.user = val;
                  localStorage.setItem("webunix_users_v2", JSON.stringify(users));
                  sessionStorage.setItem("webunix_session_v2", JSON.stringify(s));
                  location.reload();
              }
          };
          win.querySelectorAll(".del-user").forEach(b => {
              b.onclick = async () => {
                  if(await window.Modal.confirm(`Delete user "${b.dataset.u}"?`, "Delete User", true)) {
                      const users = JSON.parse(localStorage.getItem("webunix_users_v2"));
                      delete users[b.dataset.u];
                      localStorage.setItem("webunix_users_v2", JSON.stringify(users));
                      switchTab('account', nav);
                  }
              }
          });
      }
      if(tab==='system') {
          content.innerHTML = renderSystem();
          win.querySelector("#btn-reset").onclick = async () => {
              if(await window.Modal.confirm("Wipe ALL data? This cannot be undone.", "Factory Reset", true)) {
                  localStorage.clear(); sessionStorage.clear(); location.reload();
              }
          };
      }
  };
  switchTab('appearance', win.querySelector(".settings-nav-item"));
};