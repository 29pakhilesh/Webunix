// js/webunix_main.js - Core OS loader (taskbar, start menu, app registry)

document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("start-button");
  const taskbarApps = document.getElementById("taskbar-apps");
  const desktopIcons = document.getElementById("desktop-icons");
  const loginScreen = document.getElementById("login-screen");
  const desktop = document.getElementById("desktop");

  // Simple start menu toggle (created on demand)
  let startMenu;
  startBtn.addEventListener("click", () => {
    if (!startMenu) {
      startMenu = document.createElement("div");
      startMenu.id = "start-menu";
      startMenu.innerHTML = `
        <div class="start-menu-inner">
          <button id="open-terminal">Terminal</button>
          <button id="open-filemgr">File Manager</button>
          <button id="open-editor">Editor</button>
          <button id="power-icon">Power</button>
        </div>`;
      document.body.appendChild(startMenu);
      document.getElementById("open-terminal").onclick = () => launchApp("Terminal");
      document.getElementById("open-filemgr").onclick = () => launchApp("FileManager");
      document.getElementById("open-editor").onclick = () => launchApp("Editor");
      document.getElementById("power-icon").onclick = () => window.openShutdownMenu();
      startMenu.style.position = "absolute";
      startMenu.style.bottom = "48px";
      startMenu.style.left = "10px";
      startMenu.style.background = "#111";
      startMenu.style.color = "white";
      startMenu.style.padding = "8px";
      startMenu.style.borderRadius = "6px";
    } else {
      startMenu.style.display = startMenu.style.display === "none" ? "block" : "none";
    }
  });

  // Basic app registry and launcher
  const apps = {
    Terminal: { id: "terminal", entry: () => window.openTerminal?.() },
    FileManager: { id: "filemgr", entry: () => window.openFileManager?.() },
    Editor: { id: "editor", entry: () => window.openEditor?.() },
    Settings: { id: "settings", entry: () => window.openSettings?.() },
    ProcessManager: { id: "procman", entry: () => window.openProcessManager?.() },
  };

  function launchApp(name) {
    const a = apps[name];
    if (!a) return console.warn("App not found:", name);
    // call app entry if provided by its module
    if (typeof a.entry === "function") a.entry();
    // create a taskbar button for the app (if not exists)
    if (!document.getElementById("task-" + a.id)) {
      const btn = document.createElement("div");
      btn.id = "task-" + a.id;
      btn.className = "task-item";
      btn.textContent = name;
      btn.onclick = () => focusAppWindow(a.id);
      taskbarApps.appendChild(btn);
    }
  }

  function focusAppWindow(id) {
    // placeholder: real apps should manage their windows; here we just flash task item
    const t = document.getElementById("task-" + id);
    if (!t) return;
    t.style.opacity = "0.6";
    setTimeout(() => (t.style.opacity = "1"), 150);
  }

  // Populate desktop icons (quick access)
  const defaultIcons = [
    { name: "Terminal", app: "Terminal" },
    { name: "Files", app: "FileManager" },
    { name: "Editor", app: "Editor" }
  ];
  defaultIcons.forEach(ic => {
    const el = document.createElement("div");
    el.className = "desk-icon";
    el.innerHTML = `<div class="icon-box">${ic.name}</div>`;
    el.onclick = () => launchApp(ic.app);
    desktopIcons.appendChild(el);
  });

  // If a user is already logged in via sessionStorage show desktop immediately
  if (sessionStorage.getItem("webunix_user")) {
    loginScreen.classList.add("hidden");
    desktop.classList.remove("hidden");
    // startClock from login module if available
    if (typeof window.startClock === "function") window.startClock();
  }
});
