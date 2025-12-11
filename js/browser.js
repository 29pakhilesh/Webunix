// js/browser.js - Fixed with "Open External" & Embed-Friendly Links
(function() {
    const FAVORITES = [
        { name: "Wikipedia", url: "https://www.wikipedia.org" }, // Works
        { name: "YouTube (Lofi)", url: "https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1" }, // Embed Player Works
        { name: "OpenStreetMap", url: "https://www.openstreetmap.org/export/embed.html" }, // Maps Work
        { name: "HackerTyper", url: "https://hackertyper.net" } // Fun/Works
    ];

    window.openBrowser = function() {
        const id = "browser-" + Date.now();
        const win = document.createElement("div");
        win.id = id;
        win.className = "app-window";
        win.style.cssText = "width:900px;height:600px;display:flex;flex-direction:column;background:#202124;font-family:sans-serif;";
        
        const pid = window.kernel?.process?.spawn ? window.kernel.process.spawn("Browser", win) : Date.now();

        win.innerHTML = `
            <div class="title-bar" style="background:#202124; height:30px; border-bottom:none;">
                <span style="font-size:12px;color:#9aa0a6;margin-left:8px;">WebUnix Browser</span>
                <button class="close-btn" style="margin-right:8px;"></button>
            </div>
            <div style="background:#202124; padding-top:4px;">
                <div id="tab-strip" style="display:flex; align-items:flex-end; padding:0 8px; gap:4px; overflow-x:auto;">
                    <button id="new-tab-btn" style="width:28px;height:28px;border-radius:50%;border:none;background:#35363a;color:#9aa0a6;cursor:pointer;font-weight:bold;margin-bottom:4px;">+</button>
                </div>
            </div>
            <div style="background:#35363a; padding:8px; display:flex; gap:10px; align-items:center; border-bottom:1px solid #000;">
                <button id="nav-home" title="Home" style="background:none;border:none;color:#e8eaed;cursor:pointer;">🏠</button>
                <button id="nav-refresh" title="Refresh" style="background:none;border:none;color:#e8eaed;cursor:pointer;">↻</button>
                <input id="url-bar" type="text" style="flex:1; background:#202124; border:none; border-radius:20px; padding:6px 16px; color:#e8eaed; outline:none; font-size:14px;" placeholder="https://">
                <button id="nav-external" title="Open in Real Tab (Fix Blocked Sites)" style="background:none;border:none;color:#8ab4f8;cursor:pointer;font-weight:bold;">↗</button>
            </div>
            <div id="viewport" style="flex:1; position:relative; background:#fff; overflow:hidden;"></div>
        `;

        document.body.appendChild(win);
        if(window.wm) window.wm.register(win);

        let tabs = [];
        let activeTabId = null;
        
        const tabStrip = win.querySelector("#tab-strip");
        const newTabBtn = win.querySelector("#new-tab-btn");
        const viewport = win.querySelector("#viewport");
        const urlBar = win.querySelector("#url-bar");

        function createTab(initialUrl = null) {
            const tabId = "tab-" + Date.now() + Math.random().toString(16).slice(2);
            const tabEl = document.createElement("div");
            tabEl.style.cssText = "flex:1; max-width:200px; min-width:120px; height:32px; background:#35363a; color:#e8eaed; border-radius:8px 8px 0 0; display:flex; align-items:center; padding:0 10px; font-size:12px; cursor:pointer; user-select:none; margin-right:2px;";
            tabEl.innerHTML = `<span class="tab-title" style="flex:1;overflow:hidden;white-space:nowrap;">New Tab</span><span class="tab-close" style="margin-left:5px;opacity:0.7;">✕</span>`;

            const viewEl = document.createElement("div");
            viewEl.style.cssText = "width:100%; height:100%; display:none;";
            viewEl.innerHTML = `
                <div class="browser-home" style="width:100%;height:100%;background:#202124;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#e8eaed;">
                    <h2 style="margin-bottom:30px;">WebUnix</h2>
                    <div style="display:flex;gap:20px;">
                        ${FAVORITES.map(f => `<div class="fav" data-url="${f.url}" style="cursor:pointer;text-align:center;"><div style="width:50px;height:50px;background:#303134;border-radius:50%;display:grid;place-items:center;margin-bottom:5px;">🌐</div>${f.name}</div>`).join('')}
                    </div>
                </div>
                <iframe class="browser-frame" style="width:100%;height:100%;border:none;display:none;" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"></iframe>
            `;
            
            viewport.appendChild(viewEl);
            tabStrip.insertBefore(tabEl, newTabBtn);
            tabs.push({ id: tabId, el: tabEl, view: viewEl, url: initialUrl || "about:blank" });

            tabEl.onmousedown = (e) => !e.target.classList.contains('tab-close') && setActiveTab(tabId);
            tabEl.querySelector(".tab-close").onmousedown = (e) => { e.stopPropagation(); closeTab(tabId); };
            viewEl.querySelectorAll(".fav").forEach(f => f.onclick = () => navigate(tabId, f.dataset.url));

            if(initialUrl) navigate(tabId, initialUrl);
            setActiveTab(tabId);
        }

        function closeTab(id) {
            const idx = tabs.findIndex(t => t.id === id);
            if(idx === -1) return;
            tabs[idx].el.remove(); tabs[idx].view.remove(); tabs.splice(idx, 1);
            if(tabs.length === 0) window.kernel?.process?.kill(pid) || win.remove();
            else if(activeTabId === id) setActiveTab(tabs[Math.max(0, idx - 1)].id);
        }

        function setActiveTab(id) {
            activeTabId = id;
            tabs.forEach(t => {
                const act = t.id === id;
                t.el.style.background = act ? "#ffffff" : "#35363a";
                t.el.style.color = act ? "#202124" : "#e8eaed";
                t.view.style.display = act ? "block" : "none";
                if(act) urlBar.value = t.url === "about:blank" ? "" : t.url;
            });
        }

        function navigate(id, url) {
            const tab = tabs.find(t => t.id === id);
            if(!url.startsWith("http")) url = "https://" + url;
            tab.url = url;
            tab.view.querySelector(".browser-home").style.display = "none";
            const frame = tab.view.querySelector("iframe");
            frame.style.display = "block";
            frame.src = url;
            if(activeTabId === id) urlBar.value = url;
            tab.el.querySelector(".tab-title").textContent = "Loading...";
            frame.onload = () => tab.el.querySelector(".tab-title").textContent = "Page Loaded";
        }

        newTabBtn.onclick = () => createTab();
        urlBar.onkeydown = (e) => e.key === "Enter" && activeTabId && navigate(activeTabId, urlBar.value);
        win.querySelector("#nav-refresh").onclick = () => { if(activeTabId) { const f = tabs.find(t=>t.id===activeTabId).view.querySelector("iframe"); f.src = f.src; }};
        win.querySelector("#nav-home").onclick = () => { if(activeTabId) { const t=tabs.find(x=>x.id===activeTabId); t.url="about:blank"; t.view.querySelector("iframe").style.display="none"; t.view.querySelector(".browser-home").style.display="flex"; urlBar.value=""; t.el.querySelector(".tab-title").textContent="New Tab"; }};
        win.querySelector("#nav-external").onclick = () => { if(urlBar.value && urlBar.value !== "about:blank") window.open(urlBar.value, "_blank"); };
        win.querySelector(".close-btn").onclick = () => window.kernel?.process?.kill(pid) || win.remove();

        createTab();
    };
})();