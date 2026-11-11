const form    = document.getElementById('signupForm');
const nameEl  = document.getElementById('name');
const email   = document.getElementById('email');
const pw      = document.getElementById('password');
const confirm = document.getElementById('confirm');
const err     = document.getElementById('error');

// Password show / hide
document.getElementById('togglePw').addEventListener('click', (e) => {
  const show = pw.type === 'password';
  pw.type = confirm.type = show ? 'text' : 'password';
  e.currentTarget.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  err.style.color = '';
  err.textContent = '';

  if (nameEl.value.trim().length < 2) { err.textContent = 'Enter your name.'; nameEl.focus(); return; }
  if (!/^\S+@\S+\.\S+$/.test(email.value)) { err.textContent = 'Enter a valid email address.'; email.focus(); return; }
  if (pw.value.length < 6) { err.textContent = 'Password must be at least 6 characters.'; pw.focus(); return; }
  if (pw.value !== confirm.value) { err.textContent = 'Passwords do not match.'; confirm.focus(); return; }

  const btn = form.querySelector('.btn-primary');
  btn.disabled = true;
  btn.textContent = 'Creating account...';

  try {
    // Python Backend URL එක මෙතනට ඇතුලත් කර ඇත
        // 31 වන පේළියට මෙම සම්පූර්ණ කොටසම ආදේශ කරන්න:
    const res = await fetch('http://127.0.0.1:5000/api/auth/signup', {

      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Python Backend එක බලාපොරොත්තු වන ආකාරයට Keys සකස් කර ඇත
      body: JSON.stringify({ 
        fullName: nameEl.value.trim(), 
        email: email.value, 
        password: pw.value,
        confirmPassword: confirm.value
      })
    });
    
    const data = await res.json();
    
    // Backend එකෙන් success: false ආවොත් Error එකක් පෙන්වීම
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Sign up failed');
    }

    // ගිණුම සෑදූ පසු Dashboard එකට යාම
    // සටහන: Token එකක් සෑදීමට Backend එක මීළඟට අප්ඩේට් කරමු. දැනට සරලව සත්‍යාපනය කරයි.
    if (data.token) {
        sessionStorage.setItem('token', data.token);
    }
    
    err.style.color = '#0f6a38';
    err.textContent = data.message || 'Account created! Redirecting...';
    setTimeout(() => (window.location.href = 'dashboard.html'), 800);
    
  } catch (ex) {
    err.style.color = 'red';
    err.textContent = ex.message;
    btn.disabled = false;
    btn.textContent = 'Sign Up';
  }
});
