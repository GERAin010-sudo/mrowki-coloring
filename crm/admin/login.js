const form = document.getElementById('loginForm');
const errEl = document.getElementById('err');
const btn = document.getElementById('submitBtn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errEl.hidden = true;
  btn.disabled = true;
  btn.textContent = 'Logowanie...';
  try {
    const login = document.getElementById('login').value.trim();
    const password = document.getElementById('password').value;
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ login, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      errEl.textContent = data.error || 'Błąd logowania';
      errEl.hidden = false;
      btn.disabled = false;
      btn.textContent = 'Zaloguj się';
      return;
    }
    // Success — store user info in localStorage for existing UI code
    if (data.user) localStorage.setItem('crm_user', JSON.stringify(data.user));
    window.location.href = '/';
  } catch (e) {
    errEl.textContent = 'Błąd sieci: ' + e.message;
    errEl.hidden = false;
    btn.disabled = false;
    btn.textContent = 'Zaloguj się';
  }
});
