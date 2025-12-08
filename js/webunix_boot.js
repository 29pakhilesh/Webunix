// BOOT → LOGIN transition

window.addEventListener("load", () => {
    const boot = document.getElementById("boot-screen");
    const login = document.getElementById("login-screen");

    setTimeout(() => {
        boot.classList.add("hidden");
        login.classList.remove("hidden");
    }, 2000);
});
