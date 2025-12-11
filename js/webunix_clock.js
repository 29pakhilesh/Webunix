// js/webunix_clock.js
(function() {
    let clockInterval, stopwatchInterval, timerTimeout;
    let stopwatchTime = 0;
    let stopwatchRunning = false;
    let stopwatchLaps = [];
    let timerDuration = 0;
    let timerRemaining = 0;
    let timerRunning = false;
    let worldTimeInterval;

    const TIMEZONES = [
        { name: "New York (EST)", tz: "America/New_York" },
        { name: "London (GMT)", tz: "Europe/London" },
        { name: "Tokyo (JST)", tz: "Asia/Tokyo" },
        { name: "Sydney (AEST)", tz: "Australia/Sydney" },
        { name: "Dubai (GST)", tz: "Asia/Dubai" }
    ];

    function formatTime(ms) {
        const sign = ms < 0 ? "-" : "";
        ms = Math.abs(ms);
        const h = Math.floor(ms / 3600000);
        const m = Math.floor((ms % 3600000) / 60000);
        const s = Math.floor((ms % 60000) / 1000);
        const cs = Math.floor((ms % 1000) / 10);
        const pad = (n, l = 2) => String(n).padStart(l, '0');
        if (h > 0) return `${sign}${pad(h)}:${pad(m)}:${pad(s)}.${pad(cs)}`;
        return `${sign}${pad(m)}:${pad(s)}.${pad(cs)}`;
    }

    // --- Analog Clock Update Logic ---
    function updateAnalogClock(ms, win, prefix) {
        const secondsHand = win.querySelector(`#${prefix}-sec-hand`);
        const minutesHand = win.querySelector(`#${prefix}-min-hand`);

        if (!secondsHand || !minutesHand) return;

        // Seconds hand rotates once per minute (60,000 ms)
        const secondsDeg = (ms % 60000) / 60000 * 360;
        secondsHand.style.transform = `translate(-50%, -100%) rotate(${secondsDeg}deg)`;

        // Minutes hand rotates once per hour (3,600,000 ms)
        const minutesDeg = (ms % 3600000) / 3600000 * 360;
        minutesHand.style.transform = `translate(-50%, -100%) rotate(${minutesDeg}deg)`;
    }

    // --- Main Clock Logic ---
    function startMainClock(win) {
        const display = win.querySelector("#main-clock-display");
        const dateDisplay = win.querySelector("#main-clock-date");
        clearInterval(clockInterval);
        
        function updateClock() {
            const now = new Date();
            display.textContent = now.toLocaleTimeString();
            dateDisplay.textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        }
        updateClock();
        clockInterval = setInterval(updateClock, 1000);
    }
    
    // --- Stopwatch Logic ---
    function renderStopwatch(win) {
        const display = win.querySelector("#stopwatch-display");
        const lapsEl = win.querySelector("#stopwatch-laps");
        
        // Digital display
        display.textContent = formatTime(stopwatchTime);
        
        // Analog display
        updateAnalogClock(stopwatchTime, win, 'sw');

        lapsEl.innerHTML = stopwatchLaps.map((lap, i) => {
            // Calculate lap time (time since last lap or start)
            const lapDuration = lap.time - (i > 0 ? stopwatchLaps[i-1].time : 0);
            return `
                <div class="stopwatch-lap-item">
                    <span class="stopwatch-lap-label">Lap ${i + 1}</span>
                    <span>${formatTime(lapDuration)} / ${formatTime(lap.time)}</span>
                </div>
            `}).reverse().join('');
        
        win.querySelector("#stopwatch-start").style.display = stopwatchRunning ? 'none' : 'inline-block';
        win.querySelector("#stopwatch-pause").style.display = stopwatchRunning ? 'inline-block' : 'none';
        win.querySelector("#stopwatch-lap").disabled = !stopwatchRunning;
        win.querySelector("#stopwatch-reset").disabled = stopwatchTime === 0;
    }
    
    function stopwatchTick(win) {
        if (!stopwatchRunning) return;
        stopwatchTime += 10;
        renderStopwatch(win);
    }
    
    function startStopwatch(win) {
        if (stopwatchRunning) return;
        stopwatchRunning = true;
        stopwatchInterval = setInterval(() => stopwatchTick(win), 10);
        renderStopwatch(win);
    }
    
    function pauseStopwatch(win) {
        stopwatchRunning = false;
        clearInterval(stopwatchInterval);
        renderStopwatch(win);
    }
    
    function resetStopwatch(win) {
        pauseStopwatch(win);
        stopwatchTime = 0;
        stopwatchLaps = [];
        renderStopwatch(win);
    }
    
    function lapStopwatch(win) {
        if (!stopwatchRunning || stopwatchTime === 0) return;
        stopwatchLaps.push({ time: stopwatchTime });
        renderStopwatch(win);
    }

    // --- Timer Logic ---
    function renderTimer(win) {
        const display = win.querySelector("#timer-display");
        const input = win.querySelector("#timer-input");
        const startBtn = win.querySelector("#timer-start");
        
        // Digital display
        display.textContent = formatTime(timerRemaining);

        // Analog display: Use elapsed time to rotate hands (progress-style)
        const elapsed = timerDuration - timerRemaining;
        if(timerRunning || timerDuration > 0) updateAnalogClock(elapsed, win, 'timer');
        
        if (timerRunning) {
            startBtn.textContent = 'Pause';
            startBtn.classList.add('danger');
            startBtn.classList.remove('primary');
            input.disabled = true;
        } else {
            startBtn.textContent = 'Start';
            startBtn.classList.add('primary');
            startBtn.classList.remove('danger');
            input.disabled = false;
        }
        
        win.querySelector("#timer-reset").disabled = timerDuration === 0;
    }

    function timerTick(win) {
        if (!timerRunning) return;
        timerRemaining -= 100; // Update every 100ms for smoother analog hand

        if (timerRemaining <= 0) {
            timerRemaining = 0;
            timerRunning = false;
            clearTimeout(timerTimeout);
            window.Modal.alert("Timer Finished!", "Alarm");
            win.querySelector("#timer-display").textContent = "00:00.00";
            // Final render to update hands to 0
            renderTimer(win);
            return;
        }
        
        renderTimer(win);
        if (timerRunning) timerTimeout = setTimeout(() => timerTick(win), 100);
    }

    function startPauseTimer(win) {
        if (!timerRunning) {
            // Start or Resume
            if (timerRemaining === 0) {
                // Initial start
                const inputVal = win.querySelector("#timer-input").value.split(':').map(v => parseInt(v) || 0);
                let durationMs = 0;
                // HH:MM:SS or MM:SS
                if (inputVal.length === 3) durationMs += inputVal[0] * 3600000; // H
                durationMs += inputVal.slice(-2)[0] * 60000; // M
                durationMs += inputVal.slice(-1)[0] * 1000; // S
                
                if (durationMs < 1000) return window.Modal.alert("Timer must be at least 1 second.", "Error");
                timerDuration = durationMs;
                timerRemaining = durationMs;
            }
            timerRunning = true;
            timerTick(win);
        } else {
            // Pause
            timerRunning = false;
            clearTimeout(timerTimeout);
        }
        renderTimer(win);
    }
    
    function resetTimer(win) {
        timerRunning = false;
        clearTimeout(timerTimeout);
        timerDuration = 0;
        timerRemaining = 0;
        // Reset analog hands
        updateAnalogClock(0, win, 'timer');
        win.querySelector("#timer-input").value = '00:00';
        renderTimer(win);
    }

    // --- World Time Logic ---
    function startWorldTime(win) {
        const content = win.querySelector("#world-time-content");
        clearInterval(worldTimeInterval);

        function updateWorldTime() {
            content.innerHTML = TIMEZONES.map(tz => {
                const now = new Date();
                const time = now.toLocaleTimeString('en-US', { timeZone: tz.tz, hour: '2-digit', minute: '2-digit', second: '2-digit' });
                return `
                    <div class="time-zone-item">
                        <span class="time-zone-name">${tz.name}</span>
                        <span class="time-zone-time">${time}</span>
                    </div>
                `;
            }).join('');
        }
        updateWorldTime();
        worldTimeInterval = setInterval(updateWorldTime, 1000);
    }
    
    // --- Main App Window ---
    window.openClock = function() {
        if (document.getElementById("clock-window")) {
            const win = document.getElementById("clock-window");
            if (window.wm) win.style.zIndex = ++window.wm.zIndex;
            return;
        }

        const win = document.createElement("div");
        win.id = "clock-window";
        win.className = "app-window";
        win.style.width = "450px";
        win.style.height = "550px"; // Increased height
        win.style.minWidth = "300px";
        win.style.minHeight = "400px";
        
        const pid = window.kernel?.process?.spawn ? window.kernel.process.spawn("Clock", win) : Date.now();
        
        win.innerHTML = `
            <div class="title-bar"><span>Clock</span><button class="close-btn">×</button></div>
            <div class="clock-container">
                <div class="clock-tabs">
                    <button class="clock-tab-btn active" data-tab="main">Main Clock</button>
                    <button class="clock-tab-btn" data-tab="timer">Timer</button>
                    <button class="clock-tab-btn" data-tab="stopwatch">Stopwatch</button>
                    <button class="clock-tab-btn" data-tab="world">World Time</button>
                </div>
                <div class="clock-tab-content" id="clock-content"></div>
            </div>
        `;
        document.body.appendChild(win);
        if (window.wm) window.wm.register(win);

        const content = win.querySelector("#clock-content");
        const closeBtn = win.querySelector(".close-btn");
        
        closeBtn.onclick = () => {
            clearInterval(clockInterval);
            clearInterval(stopwatchInterval);
            clearInterval(worldTimeInterval);
            clearTimeout(timerTimeout);
            window.kernel?.process?.kill(pid) || win.remove();
        };

        const renderTab = (tab) => {
            // Cleanup intervals before switching
            clearInterval(clockInterval);
            clearInterval(stopwatchInterval);
            clearInterval(worldTimeInterval);

            if (tab === 'main') {
                content.innerHTML = `
                    <div id="main-clock-display" class="clock-main-display"></div>
                    <div id="main-clock-date" class="clock-main-date"></div>
                `;
                startMainClock(win);
            } else if (tab === 'timer') {
                content.innerHTML = `
                    <div class="analog-clock-wrap">
                        <div class="analog-clock" id="timer-dial">
                            <div class="dial-marker"></div>
                            <div class="hand seconds-hand" id="timer-sec-hand"></div>
                            <div class="hand minutes-hand" id="timer-min-hand"></div>
                        </div>
                        <div id="timer-display" class="clock-main-display clock-overlay-display"></div>
                    </div>
                    <div class="timer-controls">
                        <input id="timer-input" class="timer-input" type="text" placeholder="MM:SS" value="00:00">
                        <button id="timer-start" class="primary">Start</button>
                        <button id="timer-reset">Reset</button>
                    </div>
                `;
                win.querySelector("#timer-start").onclick = () => startPauseTimer(win);
                win.querySelector("#timer-reset").onclick = () => resetTimer(win);
                renderTimer(win);
            } else if (tab === 'stopwatch') {
                content.innerHTML = `
                    <div class="analog-clock-wrap">
                        <div class="analog-clock" id="stopwatch-dial">
                            <div class="dial-marker"></div>
                            <div class="hand seconds-hand" id="sw-sec-hand"></div>
                            <div class="hand minutes-hand" id="sw-min-hand"></div>
                        </div>
                        <div id="stopwatch-display" class="clock-main-display clock-overlay-display"></div>
                    </div>
                    <div class="stopwatch-controls">
                        <button id="stopwatch-lap">Lap</button>
                        <button id="stopwatch-start" class="primary">Start</button>
                        <button id="stopwatch-pause" class="danger" style="display:none;">Pause</button>
                        <button id="stopwatch-reset">Reset</button>
                    </div>
                    <div id="stopwatch-laps" class="stopwatch-laps"></div>
                `;
                win.querySelector("#stopwatch-start").onclick = () => startStopwatch(win);
                win.querySelector("#stopwatch-pause").onclick = () => pauseStopwatch(win);
                win.querySelector("#stopwatch-lap").onclick = () => lapStopwatch(win);
                win.querySelector("#stopwatch-reset").onclick = () => resetStopwatch(win);
                renderStopwatch(win);
            } else if (tab === 'world') {
                content.innerHTML = `<div id="world-time-content"></div>`;
                startWorldTime(win);
            }
        };

        win.querySelectorAll(".clock-tab-btn").forEach(btn => {
            btn.onclick = () => {
                win.querySelectorAll(".clock-tab-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                renderTab(btn.dataset.tab);
            };
        });

        // Load default tab
        renderTab('main');
    };
})();