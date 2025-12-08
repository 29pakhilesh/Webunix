// js/webunix_auth.js
// Browser-side salted SHA-256 auth + profiles (localStorage), session in sessionStorage

const AUTH_KEY = "webunix_users_v2"; // stores { username: {salt, passHash, avatar, created} }
const SESSION_KEY = "webunix_session_v2";

async function sha256hex(buf) {
  const hash = await crypto.subtle.digest("SHA-256", typeof buf === "string" ? new TextEncoder().encode(buf) : buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,"0")).join("");
}
function randSalt(len=16){
  const a = new Uint8Array(len);
  crypto.getRandomValues(a);
  return Array.from(a).map(b=>b.toString(16).padStart(2,"0")).join("");
}
function loadUsers(){ try { return JSON.parse(localStorage.getItem(AUTH_KEY))||{} } catch(e){ return {} } }
function saveUsers(u){ localStorage.setItem(AUTH_KEY, JSON.stringify(u)); }

async function derivePasswordHash(password, salt){
  // concatenation method: H(salt || password || salt) — simple and safe for browser use
  return await sha256hex(salt + password + salt);
}

// API: signup(username,password,avatarURL) -> {ok, msg}
async function signup(username, password, avatarURL=""){
  username = (username||"").trim();
  if(!username || !password) return {ok:false, msg:"username/password required"};
  const users = loadUsers();
  if(users[username]) return {ok:false, msg:"username taken"};
  const salt = randSalt(12);
  const passHash = await derivePasswordHash(password, salt);
  users[username] = { salt, passHash, avatar: (avatarURL||""), created: Date.now() };
  saveUsers(users);
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user: username, at: Date.now() }));
  return {ok:true, msg:"account created"};
}

// API: login(username,password) -> {ok, msg}
async function login(username, password){
  username = (username||"").trim();
  if(!username || !password) return {ok:false, msg:"username/password required"};
  const users = loadUsers();
  const u = users[username];
  if(!u) return {ok:false, msg:"no such user"};
  const hash = await derivePasswordHash(password, u.salt);
  if(hash !== u.passHash) return {ok:false, msg:"invalid credentials"};
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user: username, at: Date.now() }));
  return {ok:true, msg:"logged in"};
}

function logout(){
  sessionStorage.removeItem(SESSION_KEY);
  // optional: redirect to login view
  document.getElementById("desktop")?.classList.add("hidden");
  document.getElementById("login-screen")?.classList.remove("hidden");
}

function currentUser(){
  const s = sessionStorage.getItem(SESSION_KEY);
  if(!s) return null;
  try{ const obj = JSON.parse(s); const users = loadUsers(); return users[obj.user] ? { username: obj.user, ...users[obj.user] } : null; } catch(e){ return null; }
}

// UI wiring (auto-run)
(function wireAuthUI(){
  // elements (some created earlier in page)
  const toggle = document.getElementById("toggle-auth");
  const signupForm = document.getElementById("signup-form");
  const signinForm = document.getElementById("signin-form");
  const authTitle = document.getElementById("auth-title");

  const signupBtn = document.getElementById("signup-btn");
  const loginBtn = document.getElementById("login-btn");

  toggle.addEventListener("click", (e)=>{
    e.preventDefault();
    const showingSignup = !signupForm.classList.contains("hidden");
    if(showingSignup){
      signupForm.classList.add("hidden");
      signinForm.classList.remove("hidden");
      authTitle.textContent = "Sign In";
      toggle.textContent = "Create account";
    } else {
      signupForm.classList.remove("hidden");
      signinForm.classList.add("hidden");
      authTitle.textContent = "Create account";
      toggle.textContent = "Already have account?";
    }
  });

  signupBtn?.addEventListener("click", async ()=>{
    const u = document.getElementById("signup-username").value.trim();
    const p = document.getElementById("signup-password").value;
    const a = document.getElementById("signup-avatar").value.trim();
    const res = await signup(u,p,a);
    if(!res.ok) return alert(res.msg);
    // success: show desktop
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("desktop").classList.remove("hidden");
    applyProfileToUI();
  });

  loginBtn?.addEventListener("click", async ()=>{
    const u = document.getElementById("login-username").value.trim();
    const p = document.getElementById("login-password").value;
    const res = await login(u,p);
    if(!res.ok) return alert(res.msg);
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("desktop").classList.remove("hidden");
    applyProfileToUI();
  });

  // quick auto-login if session exists
  const cur = currentUser();
  if(cur){
    document.getElementById("login-screen")?.classList.add("hidden");
    document.getElementById("desktop")?.classList.remove("hidden");
    applyProfileToUI();
  }

  // show avatar & welcome in taskbar
  function applyProfileToUI(){
    const u = currentUser();
    if(!u) return;
    const tb = document.getElementById("taskbar");
    if(!tb) return;
    // remove old profile element if present
    const old = document.getElementById("taskbar-profile");
    if(old) old.remove();
    const p = document.createElement("div");
    p.id = "taskbar-profile";
    p.style.display = "flex";
    p.style.alignItems = "center";
    p.style.gap = "8px";
    p.style.marginLeft = "10px";

    const img = document.createElement("img");
    img.className = "profile-avatar";
    img.alt = u.username;
    img.src = u.avatar || "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="100%" height="100%" fill="#222"/><text x="50%" y="50%" font-size="18" fill="#fff" dominant-baseline="middle" text-anchor="middle">${u.username[0].toUpperCase()}</text></svg>`);

    const name = document.createElement("div");
    name.style.color = "white"; name.style.fontSize = "13px";
    name.textContent = u.username;

    const outBtn = document.createElement("button");
    outBtn.textContent = "Logout";
    outBtn.style.marginLeft = "8px";
    outBtn.onclick = () => { logout(); };

    p.appendChild(img); p.appendChild(name); p.appendChild(outBtn);
    tb.appendChild(p);
  }
})();
