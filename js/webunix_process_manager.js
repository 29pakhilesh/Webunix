// PROCESS MANAGER — lists open app windows & can close them

window.openProcessManager = function () {
    if (document.getElementById("procman-window"))
        return bringFront(document.getElementById("procman-window"));

    const win = document.createElement("div");
    win.id = "procman-window";
    win.className = "app-window";
    win.style.width = "360px";
    win.style.height = "320px";

    win.innerHTML = `
      <div class="title-bar">
        <span>Process Manager</span>
        <button class="close-btn">×</button>
      </div>

      <div id="proc-list" style="flex:1; padding:10px; overflow-y:auto; background:#111; color:white; font-size:14px;">
      </div>

      <div style="padding:8px; display:flex; justify-content:flex-end;">
        <button id="proc-refresh">Refresh</button>
      </div>
    `;

    document.body.appendChild(win);
    win.querySelector(".close-btn").onclick = () => win.remove();
    const listEl = win.querySelector("#proc-list");
    const refreshBtn = win.querySelector("#proc-refresh");

    function listProcesses() {
        const windows = Array.from(document.querySelectorAll(".app-window"));
        listEl.innerHTML = "";

        if (windows.length === 0) {
            listEl.innerHTML = "<div>No active processes.</div>";
            return;
        }

        windows.forEach(w => {
            const title = w.querySelector(".title-bar span")?.textContent || "Unknown App";
            const row = document.createElement("div");
            row.style.padding = "6px 4px";
            row.style.display = "flex";
            row.style.justifyContent = "space-between";
            row.style.borderBottom = "1px solid #222";

            row.innerHTML = `
              <span>${title}</span>
              <button class="kill-btn" style="padding:4px;">Kill</button>
            `;

            row.querySelector(".kill-btn").onclick = () => {
                w.remove();
                listProcesses();
            };

            listEl.appendChild(row);
        });
    }

    refreshBtn.onclick = listProcesses;
    listProcesses();
    bringFront(win);
};

function bringFront(win) {
    win.style.zIndex = Date.now();
}
