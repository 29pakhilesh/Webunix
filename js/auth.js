// js/webunix_auth.js
const AUTH_KEY = "webunix_users_v2"; 
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
  return await sha256hex(salt + password + salt);
}

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
  document.getElementById("desktop")?.classList.add("hidden");
  document.getElementById("login-screen")?.classList.remove("hidden");
}

function currentUser(){
  const s = sessionStorage.getItem(SESSION_KEY);
  if(!s) return null;
  try{ const obj = JSON.parse(s); const users = loadUsers(); return users[obj.user] ? { username: obj.user, ...users[obj.user] } : null; } catch(e){ return null; }
}

(function(){
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
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("desktop").classList.remove("hidden");
  });

  loginBtn?.addEventListener("click", async ()=>{
    const u = document.getElementById("login-username").value.trim();
    const p = document.getElementById("login-password").value;
    const res = await login(u,p);
    if(!res.ok) return alert(res.msg);
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("desktop").classList.remove("hidden");
  });

  const handleEnter = (e) => { if(e.key === "Enter") loginBtn.click(); };
const uInput = document.getElementById("login-username");
const pInput = document.getElementById("login-password");

if(uInput) uInput.addEventListener("keydown", handleEnter);
if(pInput) pInput.addEventListener("keydown", handleEnter);

  const cur = currentUser();
  if(cur){
    document.getElementById("login-screen")?.classList.add("hidden");
    document.getElementById("desktop")?.classList.remove("hidden");
  }
})();