import { supabase } from './supabase.js';

// Redirect if already logged in
const { data: { session } } = await supabase.auth.getSession();
if (session) window.location.href = 'dashboard.html';

const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authMsg = document.getElementById('authMsg');

function showMsg(msg, type = 'error') {
  authMsg.textContent = msg;
  authMsg.className = 'auth-msg ' + type;
}

tabLogin.addEventListener('click', () => {
  tabLogin.classList.add('active');
  tabRegister.classList.remove('active');
  loginForm.style.display = '';
  registerForm.style.display = 'none';
  showMsg('');
});

tabRegister.addEventListener('click', () => {
  tabRegister.classList.add('active');
  tabLogin.classList.remove('active');
  registerForm.style.display = '';
  loginForm.style.display = 'none';
  showMsg('');
});

// Google login
document.getElementById('googleBtn').addEventListener('click', async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/dashboard.html'
    }
  });
  if (error) showMsg(error.message);
});

// Login
document.getElementById('loginBtn').addEventListener('click', async () => {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  if (!email || !password) return showMsg('Please fill in all fields.');

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return showMsg(error.message);
  window.location.href = 'dashboard.html';
});

// Register
document.getElementById('registerBtn').addEventListener('click', async () => {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  if (!name || !email || !password) return showMsg('Please fill in all fields.');
  if (password.length < 6) return showMsg('Password must be at least 6 characters.');

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name, role: 'user' } }
  });
  if (error) return showMsg(error.message);
  if (data.user) {
    await supabase.from('profiles').upsert({
      id: data.user.id,
      full_name: name,
      email,
      role: 'user'
    });
  }
  showMsg('Account created! Logging you in...', 'success');
  setTimeout(() => window.location.href = 'dashboard.html', 1000);
});
