// js/webunix_taskbar.js
// Advanced taskbar engine: populates dock, magnify effect, tray, notifications, left/center toggle

(function(){
  const dock = document.getElementById("dock");
  const trayIcons = document.getElementById("tray-icons");
  const notifCenter = document.getElementById("notification-center");
  const badge = document.getElementById("notifications-badge");
  const profileSpot = document.getElementById("taskbar-profile-spot");
  const taskbar = document.getElementById("taskbar");

  // Sample apps (real app-launch functions provided by main.js modules)
  const APP_LIST = [
    { id:"Terminal", icon:"data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect fill='#0f0f0f' width='24' height='24'/><text x='50%' y='55%' fill='#0f0' font-size='10' text-anchor='middle' font-family='monospace'>_</text></svg>`), action:()=> window.openTerminal?.() },
    { id:"Files", icon:"data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect fill='#222' width='24' height='24'/><path d='M3 7h18v11H3z' fill='#9aa' /></svg>`), action:()=> window.openFileManager?.() },
    { id:"Editor", icon:"data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect fill='#050505' width='24' height='24'/><text x='50%' y='55%' fill='#ddd' font-size='10' text-anchor='middle'>ED</text></svg>`), action:()=> window.openEditor?.() },
    { id:"Settings", icon:"data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect fill='#111' width='24' height='24'/><text x='50%' y='55%' fill='#fff' font-size='10' text-anchor='middle'>⚙</text></svg>`), action:()=> window.openSettings?.() }
  ];

  // populate dock
  function buildDock(){
    dock.innerHTML = "";
    APP_LIST.forEach((app, idx) => {
      const it = document.createElement("div");
      it.className = "dock-item";
      it.dataset.idx = idx;
      it.title = app.id;
      it.innerHTML = `<img src="${app.icon}" alt="${app.id}"><div class="dock-label" style="display:none">${app.id}</div>`;
      it.addEventListener("click", ()=> { app.action?.(); flashTaskItem(app.id); });
      dock.appendChild(it);
    });
  }

  // flash/create taskbar button in main taskbar area
  function flashTaskItem(name){
    const tb = document.getElementById("taskbar-apps") || document.createElement("div");
    let existing = document.getElementById("task-" + name);
    if(!existing){
      const btn = document.createElement("div");
      btn.id = "task-" + name;
      btn.className = "task-item";
      btn.textContent = name;
      btn.onclick = ()=> console.log("task click", name);
      document.getElementById("taskbar-apps")?.appendChild(btn);
      // small animation
      btn.style.transform = "scale(0.92)"; setTimeout(()=> btn.style.transform="", 120);
    } else {
      existing.style.opacity = 0.6; setTimeout(()=> existing.style.opacity = 1,120);
    }
  }

  // MAGNIFICATION LOGIC: mousemove on dock -> compute distance for neighbours
  dock.addEventListener("mousemove", (ev)=>{
    const items = Array.from(dock.querySelectorAll(".dock-item"));
    const rect = dock.getBoundingClientRect();
    const mouseX = ev.clientX;
    items.forEach(it => it.classList.remove("hover","left-near","right-near"));
    // find closest
    let closest = null, min = Infinity;
    items.forEach(it=>{
      const r = it.getBoundingClientRect();
      const cx = r.left + r.width/2;
      const d = Math.abs(cx - mouseX);
      if(d < min){ min = d; closest = it; }
    });
    if(!closest) return;
    closest.classList.add("hover");
    const idx = Number(closest.dataset.idx);
    const left = dock.querySelector(`.dock-item[data-idx="${idx-1}"]`);
    const right = dock.querySelector(`.dock-item[data-idx="${idx+1}"]`);
    if(left) left.classList.add("left-near");
    if(right) right.classList.add("right-near");
  });
  dock.addEventListener("mouseleave", ()=> {
    dock.querySelectorAll(".dock-item").forEach(i=> i.classList.remove("hover","left-near","right-near"));
  });

  // tray example: clock and simple tray icons + notification push
  function updateClock(){ const c = document.getElementById("clock"); if(!c) return; const now = new Date(); c.textContent = now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}); }
  setInterval(updateClock, 1000); updateClock();

  // simple notifications API
  const notifications = [];
  window.webunixNotify = function(title, body){
    const id = Date.now();
    notifications.unshift({id,title,body,at:new Date()});
    renderNotifs();
    badge.classList.remove("hidden"); badge.textContent = notifications.length;
  };
  function renderNotifs(){
    notifCenter.innerHTML = "";
    notifications.forEach(n=>{
      const r = document.createElement("div");
      r.style.padding = "8px"; r.style.borderBottom = "1px solid rgba(255,255,255,0.03)";
      r.innerHTML = `<strong>${n.title}</strong><div style="opacity:.85;font-size:13px">${n.body}</div><div style="font-size:11px;opacity:.6">${n.at.toLocaleString()}</div>`;
      notifCenter.appendChild(r);
    });
  }

  // tray click toggles notification center
  badge.addEventListener("click", ()=> { notifCenter.classList.toggle("hidden"); });
  document.getElementById("tray-icons")?.addEventListener("click", ()=> notifCenter.classList.toggle("hidden"));

  // profile spot: sync with auth profile if exists
  function applyProfile(){
    const cur = window.currentUser?.() || null;
    profileSpot.innerHTML = "";
    if(cur){
      const img = document.createElement("img"); img.className = "profile-avatar"; img.src = cur.avatar || ("data:image/svg+xml;utf8,"+ encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'><rect width='100%' height='100%' fill='#222'/><text x='50%' y='55%' fill='#fff' font-size='18' text-anchor='middle'>${cur.username[0].toUpperCase()}</text></svg>`));
      img.onclick = ()=> { /* open profile menu */ window.openSettings?.(); };
      profileSpot.appendChild(img);
    } else {
      const b = document.createElement("button"); b.textContent="Sign"; b.onclick = ()=> document.getElementById("login-screen")?.classList.remove("hidden");
      profileSpot.appendChild(b);
    }
  }

  // left/center toggle: clicking start-button toggles
  document.getElementById("start-button").addEventListener("click", ()=>{
    if(taskbar.classList.contains("left")) { taskbar.classList.remove("left"); taskbar.classList.add("centered"); taskbar.style.width = ""; }
    else { taskbar.classList.remove("centered"); taskbar.classList.add("left"); taskbar.style.width = "380px"; }
  });

  // init
  buildDock();
  applyProfile();
  // expose small API
  window.webunixTaskbar = { notify: window.webunixNotify, rebuild: buildDock, applyProfile };
})();
