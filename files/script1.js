const form  = document.getElementById('loginForm');
const email = document.getElementById('email');
const pw    = document.getElementById('password');
const err   = document.getElementById('error');

// Password show / hide
document.getElementById('togglePw').addEventListener('click', (e) => {
  const show = pw.type === 'password';
  pw.type = show ? 'text' : 'password';
  e.currentTarget.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
});

// Validation + login (async wela thiyenawa)
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  err.textContent = '';

  if (!/^\S+@\S+\.\S+$/.test(email.value)) {
    err.textContent = 'Enter a valid email address.';
    email.focus();
    return;
  }
  if (pw.value.length < 6) {
    err.textContent = 'Password must be at least 6 characters.';
    pw.focus();
    return;
  }

  const remember = document.getElementById('remember').checked;
  const btn = form.querySelector('.btn-primary');
  btn.disabled = true;
  btn.textContent = 'Logging in...';

  try {
    // Backend ekata email saha password yawanawa
    const res = await fetch( 'http://127.0.0.1:5001/api/auth/login',  {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: pw.value, remember })
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    if (!res.ok) throw new Error(data.message || 'Cannot reach the server. Open http://localhost:5000');

    // Token eka save karanawa
    (remember ? localStorage : sessionStorage).setItem('token', data.token);

    // Login hari nam dashboard ekata yanawa
    window.location.href = 'home.html';
  } catch (ex) {
    err.textContent = ex.message;   // e.g. "Invalid email or password"
  } finally {
    btn.disabled = false;
    btn.textContent = 'Login';
  }
});

// Google sign-in (OAuth methanata connect karanna)
document.getElementById('googleBtn').addEventListener('click', () => {
  console.log('Google sign-in clicked');
});

// Sign Up button eka
const signupBtn = document.getElementById('signupBtn');
if (signupBtn) {
  signupBtn.addEventListener('click', () => {
    window.location.href = 'signup.html';
  });
}