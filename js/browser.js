// js/browser.js
// Safari-Style Interface (macOS aesthetics)

(function() {
    const FAVORITES = [
        { name: "Google", url: "https://www.google.com/webhp?igu=1", icon: "🔍" },
        { name: "Wikipedia", url: "https://www.wikipedia.org", icon: "🌐" },
        { name: "YouTube", url: "https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1", icon: "▶️" },
        { name: "Apple", url: "https://www.apple.com", icon: "🍎" },
        { name: "News", url: "https://www.bbc.com", icon: "📰" },
        { name: "Maps", url: "https://www.openstreetmap.org/export/embed.html", icon: "🗺️" }
    ];

    window.openBrowser = function() {
        const id = "browser-" + Date.now();
        
        // 1. Create Main Window
        const win = document.createElement("div");
        win.id = id;
        win.className = "app-window safari-theme"; 
        // Default size, resizable
        win.style.cssText = "width:950px;height:650px;display:flex;flex-direction:column;background:#f5f5f7;font-family:-apple-system, BlinkMacSystemFont, sans-serif; overflow:hidden; border-radius:10px; box-shadow:0 20px 60px rgba(0,0,0,0.4); border:1px solid #444;";
        
        const pid = window.kernel?.process?.spawn ? window.kernel.process.spawn("Browser", win) : Date.now();

        // 2. Inject Safari-Specific Styles
        const style = document.createElement('style');
        style.textContent = `
            /* Main Toolbar Area */
            .safari-toolbar {
                display: flex; align-items: center; justify-content: space-between;
                background: linear-gradient(to bottom, #3a3a3c, #2c2c2e);
                border-bottom: 1px solid #1c1c1e;
                height: 52px; padding: 0 15px;
                -webkit-app-region: drag; /* Electron-like drag feel if supported */
            }

            /* Traffic Lights (Window Controls) */
            .traffic-lights { display: flex; gap: 8px; margin-right: 20px; }
            .tl-btn { width: 12px; height: 12px; border-radius: 50%; border: none; cursor: pointer; position: relative; }
            .tl-close { background: #ff5f57; border: 1px solid #e0443e; }
            .tl-min { background: #febc2e; border: 1px solid #dba520; }
            .tl-max { background: #28c840; border: 1px solid #1aa030; }
            
            /* Hover symbols for traffic lights */
            .traffic-lights:hover .tl-close::after { content: '×'; position: absolute; top:-1px; left:3px; color:#5c0002; font-size:9px; font-weight:bold; }
            .traffic-lights:hover .tl-min::after { content: '–'; position: absolute; top:-2px; left:3px; color:#664d02; font-size:9px; font-weight:bold; }
            .traffic-lights:hover .tl-max::after { content: '+'; position: absolute; top:-1px; left:2px; color:#024d0f; font-size:9px; font-weight:bold; }

            /* Navigation Buttons */
            .nav-group { display: flex; gap: 15px; align-items: center; color: #b0b0b2; margin-right: 15px; }
            .nav-btn { background: none; border: none; color: inherit; cursor: pointer; padding: 0; display: flex; align-items: center; transition: color 0.2s; }
            .nav-btn:hover { color: #fff; }
            .nav-btn svg { width: 18px; height: 18px; fill: currentColor; }

            /* Centered Address Bar */
            .safari-url-wrapper {
                flex: 1; max-width: 500px; height: 28px;
                background: #1c1c1e; border-radius: 6px;
                display: flex; align-items: center; justify-content: center;
                border: 1px solid #444; position: relative;
                transition: border-color 0.2s, background 0.2s;
            }
            .safari-url-wrapper:focus-within { background: #2c2c2e; border-color: #666; }
            
            .url-icon { font-size: 10px; margin-right: 6px; color: #888; }
            #url-bar {
                background: transparent; border: none; color: #e8eaed;
                font-size: 13px; text-align: center; width: 90%;
                outline: none; font-family: -apple-system, sans-serif;
            }
            #url-bar::placeholder { color: #555; }
            
            /* Refresh icon inside URL bar */
            .url-refresh {
                position: absolute; right: 8px; top: 6px;
                width: 14px; height: 14px; opacity: 0; cursor: pointer;
                transition: opacity 0.2s; fill: #888;
            }
            .safari-url-wrapper:hover .url-refresh { opacity: 1; }

            /* Right Actions */
            .action-group { display: flex; gap: 12px; margin-left: 20px; align-items: center; }
            
            /* Tab Strip */
            .safari-tabs {
                display: flex; background: #2c2c2e; height: 34px;
                padding: 4px 10px 0 10px; gap: 4px; border-bottom: 1px solid #1c1c1e;
            }
            .safari-tab {
                flex: 1; max-width: 180px; min-width: 100px;
                background: #3a3a3c; color: #888;
                border-radius: 6px 6px 0 0;
                display: flex; align-items: center; padding: 0 10px;
                font-size: 12px; cursor: pointer; user-select: none;
                position: relative; transition: background 0.1s;
                margin-bottom: -1px; /* Blend with content */
                border: 1px solid #1c1c1e; border-bottom: none;
            }
            .safari-tab.active { background: #fff; color: #333; z-index: 10; border-color: #1c1c1e; }
            .tab-close { margin-left: auto; font-size: 14px; opacity: 0; transition: 0.2s; width: 16px; text-align: center; border-radius: 4px; }
            .safari-tab:hover .tab-close { opacity: 1; }
            .tab-close:hover { background: rgba(0,0,0,0.1); }

            /* Viewport */
            .browser-viewport { flex: 1; position: relative; background: #fff; }
            
            /* Start Page */
            .safari-home {
                width: 100%; height: 100%; background: #f5f5f7;
                display: flex; flex-direction: column; align-items: center; padding-top: 10vh;
            }
            .fav-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 30px; margin-top: 40px; }
            .fav-item { display: flex; flex-direction: column; align-items: center; cursor: pointer; gap: 8px; }
            .fav-icon-sq { 
                width: 60px; height: 60px; background: white; border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1); display: grid; place-items: center;
                font-size: 28px; transition: transform 0.2s;
            }
            .fav-item:hover .fav-icon-sq { transform: translateY(-4px); box-shadow: 0 8px 20px rgba(0,0,0,0.15); }
            .fav-title { font-size: 13px; color: #333; font-weight: 500; }
        `;
        win.appendChild(style);

        // 3. HTML Structure
        win.insertAdjacentHTML('beforeend', `
            <div class="safari-toolbar" id="drag-handle">
                <div class="traffic-lights">
                    <button class="tl-btn tl-close" title="Close"></button>
                    <button class="tl-btn tl-min" title="Minimize"></button>
                    <button class="tl-btn tl-max" title="Zoom"></button>
                </div>

                <div class="nav-group">
                    <button class="nav-btn" id="nav-back"><svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg></button>
                    <button class="nav-btn" id="nav-fwd"><svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg></button>
                </div>

                <div class="safari-url-wrapper">
                    <span class="url-icon">🔒</span>
                    <input id="url-bar" type="text" placeholder="Search or enter website name" autocomplete="off">
                    <svg class="url-refresh" id="nav-refresh" viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
                </div>

                <div class="action-group">
                    <button class="nav-btn" id="nav-share" title="Open External"><svg viewBox="0 0 24 24"><path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg></button>
                    <button class="nav-btn" id="new-tab-btn" title="New Tab"><svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg></button>
                </div>
            </div>

            <div class="safari-tabs" id="tab-strip"></div>

            <div id="viewport" class="browser-viewport"></div>
        `);

        document.body.appendChild(win);
        if(window.wm) window.wm.register(win);

        // 4. Logic Implementation
        let tabs = [];
        let activeTabId = null;
        
        const tabStrip = win.querySelector("#tab-strip");
        const viewport = win.querySelector("#viewport");
        const urlBar = win.querySelector("#url-bar");
        const refreshBtn = win.querySelector("#nav-refresh");

        // Window Controls
        win.querySelector(".tl-close").onclick = () => window.kernel?.process?.kill(pid) || win.remove();
        win.querySelector(".tl-min").onclick = () => win.style.display = 'none'; // Basic minimize
        win.querySelector(".tl-max").onclick = () => {
            if(win.style.width === '100vw') {
                win.style.width = '950px'; win.style.height = '650px'; win.style.top = '100px'; win.style.left = '100px';
            } else {
                win.style.width = '100vw'; win.style.height = '100vh'; win.style.top = '0'; win.style.left = '0';
            }
        };

        // Window Dragging (Simulating title bar drag on the toolbar)
        const toolbar = win.querySelector("#drag-handle");
        if (toolbar) {
            let isDragging = false, startX, startY, initLeft, initTop;
            toolbar.addEventListener('mousedown', (e) => {
                if(e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
                isDragging = true;
                startX = e.clientX; startY = e.clientY;
                initLeft = win.offsetLeft; initTop = win.offsetTop;
                // Raise Window
                if(window.wm) win.style.zIndex = ++window.wm.zIndex;
            });
            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                win.style.left = (initLeft + e.clientX - startX) + 'px';
                win.style.top = (initTop + e.clientY - startY) + 'px';
            });
            document.addEventListener('mouseup', () => isDragging = false);
        }

        function createTab(initialUrl = null) {
            const tabId = "tab-" + Date.now() + Math.random().toString(16).slice(2);
            
            const tabEl = document.createElement("div");
            tabEl.className = "safari-tab";
            tabEl.innerHTML = `<span class="tab-title" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;">New Tab</span><span class="tab-close">×</span>`;

            const viewEl = document.createElement("div");
            viewEl.style.cssText = "width:100%; height:100%; display:none;";
            viewEl.innerHTML = `
                <div class="safari-home">
                    <div style="color:#888; font-size:24px; font-weight:300;">Favorites</div>
                    <div class="fav-grid">
                        ${FAVORITES.map(f => `
                            <div class="fav-item" data-url="${f.url}">
                                <div class="fav-icon-sq">${f.icon}</div>
                                <span class="fav-title">${f.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <iframe class="browser-frame" style="width:100%; height:100%; border:none; display:none; background:white;" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-downloads"></iframe>
            `;

            viewport.appendChild(viewEl);
            tabStrip.appendChild(tabEl);
            tabs.push({ id: tabId, el: tabEl, view: viewEl, url: initialUrl || "about:blank" });

            tabEl.onmousedown = (e) => !e.target.classList.contains('tab-close') && setActiveTab(tabId);
            tabEl.querySelector(".tab-close").onmousedown = (e) => { e.stopPropagation(); closeTab(tabId); };
            
            viewEl.querySelectorAll(".fav-item").forEach(f => {
                f.onclick = () => navigate(tabId, f.dataset.url);
            });

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
                t.el.classList.toggle("active", act);
                t.view.style.display = act ? "block" : "none";
                if(act) {
                    urlBar.value = t.url === "about:blank" ? "" : t.url;
                }
            });
        }

        function navigate(id, url) {
            const tab = tabs.find(t => t.id === id);
            if(!url) return;
            
            if(!url.startsWith("http") && !url.startsWith("about:")) {
                if(url.includes(".") && !url.includes(" ")) url = "https://" + url;
                else url = "https://www.google.com/search?q=" + encodeURIComponent(url);
            }

            tab.url = url;
            const home = tab.view.querySelector(".safari-home");
            const frame = tab.view.querySelector("iframe");
            home.style.display = "none";
            frame.style.display = "block";
            frame.src = url;
            
            if(activeTabId === id) urlBar.value = url;
            tab.el.querySelector(".tab-title").textContent = "Loading...";
            
            frame.onload = () => tab.el.querySelector(".tab-title").textContent = "Page Loaded";
        }

        win.querySelector("#new-tab-btn").onclick = () => createTab();
        win.querySelector("#nav-back").onclick = () => { if(activeTabId) { const f = tabs.find(t=>t.id===activeTabId).view.querySelector("iframe"); try { f.contentWindow.history.back(); } catch(e){} } };
        win.querySelector("#nav-share").onclick = () => { if(urlBar.value && urlBar.value !== "about:blank") window.open(urlBar.value, "_blank"); };
        
        urlBar.onkeydown = (e) => {
            if(e.key === "Enter" && activeTabId) {
                navigate(activeTabId, urlBar.value);
                urlBar.blur();
            }
        };

        refreshBtn.onclick = () => {
            if(activeTabId) {
                const t = tabs.find(t=>t.id===activeTabId);
                const f = t.view.querySelector("iframe");
                if(f.style.display !== "none") f.src = f.src;
            }
        };

        createTab();
    };
})();