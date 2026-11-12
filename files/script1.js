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

// Validation + login
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  err.textContent = '';

  const enteredEmail = email.value.trim();

  if (!/^\S+@\S+\.\S+$/.test(enteredEmail)) {
    err.textContent = 'Enter a valid email address.';
    email.focus();
    return;
  }
  if (pw.value.length < 6) {
    err.textContent = 'Password must be at least 6 characters.';
    pw.focus();
    return;
  }

  // 1. Admin Login පරීක්ෂා කිරීම (මෙතැන ඔබට කැමති Admin Email සහ Password එකක් දිය හැක)
  if (enteredEmail === 'admin@agrimanage.com' && pw.value === 'admin123') {
    window.location.href = 'admin-orders.html';
    return; // Backend එකට යෑම නතර කර කෙලින්ම Admin පිටුවට යයි
  }

  const remember = document.getElementById('remember').checked;
  const btn = form.querySelector('.btn-primary');
  btn.disabled = true;
  btn.textContent = 'Logging in...';

  try {
    // 2. සාමාන්‍ය පරිශීලකයින් සඳහා Backend ekata email saha password yawanawa
    const res = await fetch('http://127.0.0.1:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: enteredEmail, password: pw.value, remember })
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    if (!res.ok) throw new Error(data.message || 'Cannot reach the server. Open http://localhost:5001');

    // Token eka save karanawa
    (remember ? localStorage : sessionStorage).setItem('token', data.token);

    // 3. Backend එකෙන් Admin කෙනෙක් බව තහවුරු කළහොත් (Database එකේ role: 'admin' ඇත්නම්)
    if (data.role === 'admin' || enteredEmail === 'admin@agrimanage.com') {
      window.location.href = 'admin-orders.html';
    } else {
      window.location.href = 'home.html';
    }
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
