// TERMINAL APP (simple emulator)

window.openTerminal = function () {
    if (document.getElementById("terminal-window")) {
        focus();
        return;
    }

    const win = document.createElement("div");
    win.id = "terminal-window";
    win.className = "app-window";

    win.innerHTML = `
        <div class="title-bar">
            <span>Terminal</span>
            <button class="close-btn">×</button>
        </div>
        <div id="terminal-output" class="terminal-output"></div>
        <input id="terminal-input" class="terminal-input" placeholder="Enter command...">
    `;

    document.body.appendChild(win);

    const out = document.getElementById("terminal-output");
    const input = document.getElementById("terminal-input");
    const close = win.querySelector(".close-btn");

    close.onclick = () => win.remove();

    input.focus();

    function print(text) {
        out.innerHTML += text + "<br>";
        out.scrollTop = out.scrollHeight;
    }

    const commands = {
        help: () => print("Available: help, clear, echo, date, user"),
        clear: () => { out.innerHTML = ""; },
        echo: (arg) => print(arg || ""),
        date: () => print(new Date().toString()),
        user: () => print(sessionStorage.getItem("webunix_user") || "guest")
    };

    input.addEventListener("keydown", (e) => {
        if (e.key !== "Enter") return;
        const raw = input.value.trim();
        input.value = "";

        if (!raw) return;

        const parts = raw.split(" ");
        const cmd = parts[0];
        const arg = parts.slice(1).join(" ");

        print("➜ " + raw);

        if (commands[cmd]) commands[cmd](arg);
        else print("Unknown command: " + cmd);
    });

    function focus() {
        win.style.zIndex = Date.now();
        input.focus();
    }

    win.onclick = focus;
    focus();
};
