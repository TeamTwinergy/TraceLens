/* ===== Sign-in: backend accounts when TRACELENS_API_URL is set, otherwise accounts kept in this browser ===== */
const AUTH = { user: null, token: '', mode: 'in', busy: false, error: '', vals: { name: '', email: '', pw: '', pw2: '' }, show: { pw: false, pw2: false } };
const authApi = () => (window.TRACELENS_API_URL || '').replace(/\/$/, '');
const authRemote = () => !!authApi();
const SKEY = 'tracelens_session', UKEY = 'tracelens_users';
const lsGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } };
const lsDel = k => { try { localStorage.removeItem(k); } catch (e) { /* storage unavailable */ } };
const EMAIL_OK = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;

async function authCall(path, body) {
  let r; try { r = await fetch(authApi() + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); } catch (e) { throw new Error('Cannot reach the server. Check your connection and try again.'); }
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(typeof j.detail === 'string' ? j.detail : 'Please check the details you entered.');
  return j;
}
const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
async function localHash(pw, saltHex) {
  if (!(window.crypto && crypto.subtle)) throw new Error('This browser cannot create secure accounts. Use a current browser over HTTPS.');
  const salt = Uint8Array.from(saltHex.match(/../g).map(h => parseInt(h, 16)));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveBits']);
  return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 200000, hash: 'SHA-256' }, key, 256));
}
const localUsers = () => { try { return JSON.parse(lsGet(UKEY) || '{}'); } catch (e) { return {}; } };

async function authSubmit() {
  const { name, email, pw, pw2 } = AUTH.vals, mail = email.trim().toLowerCase(), reg = AUTH.mode === 'up';
  if (reg && !name.trim()) return authFail('Please enter your name.');
  if (!EMAIL_OK.test(mail)) return authFail('Please enter a valid email address.');
  if (!pw) return authFail('Please enter your password.');
  if (reg && (pw.length < 8 || pw.length > 128)) return authFail('Use a password of 8 to 128 characters.');
  if (reg && pw !== pw2) return authFail('The two passwords do not match.');
  AUTH.busy = true; AUTH.error = ''; render();
  try {
    let res;
    if (authRemote()) res = await authCall(reg ? '/api/auth/register' : '/api/auth/login', reg ? { name: name.trim(), email: mail, password: pw } : { email: mail, password: pw });
    else {
      const users = localUsers();
      if (reg) {
        if (users[mail]) throw new Error('An account with this email already exists.');
        const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
        users[mail] = { name: name.trim(), salt, pw: await localHash(pw, salt) }; lsSet(UKEY, JSON.stringify(users));
      } else {
        const u = users[mail];
        if (!u || (await localHash(pw, u.salt)) !== u.pw) throw new Error('Incorrect email or password.');
      }
      res = { token: '', user: { email: mail, name: users[mail].name } };
    }
    AUTH.user = res.user; AUTH.token = res.token || ''; lsSet(SKEY, JSON.stringify({ user: AUTH.user, token: AUTH.token }));
    AUTH.mode = 'in'; AUTH.vals = { name: '', email: '', pw: '', pw2: '' }; AUTH.show = { pw: false, pw2: false }; AUTH.busy = false; AUTH.error = '';
    if (location.hash === '#/landing') { parseHash(); render(true); } else nav('landing');
  } catch (err) { AUTH.busy = false; AUTH.error = err.message || 'Something went wrong. Please try again.'; render(); }
}
function authFail(msg) { AUTH.error = msg; render(); const el = document.getElementById('autherr'); if (el) el.focus(); }
function authLogout() { AUTH.mode = 'in'; AUTH.user = null; AUTH.token = ''; lsDel(SKEY); AUTH.error = ''; S.drawer = null; S.pres = null; if (location.hash === '#/login') { parseHash(); render(true); } else nav('login'); }
function authRestore() {
  try { const s = JSON.parse(lsGet(SKEY) || 'null'); if (s && s.user && s.user.email) { AUTH.user = s.user; AUTH.token = s.token || ''; } } catch (e) { /* ignore */ }
  if (AUTH.user && authRemote() && AUTH.token) fetch(authApi() + '/api/auth/me', { headers: { Authorization: 'Bearer ' + AUTH.token } }).then(r => { if (r.status === 401) authLogout(); }).catch(() => { /* offline: keep session */ });
}
const authHeaders = () => AUTH.token ? { Authorization: 'Bearer ' + AUTH.token } : {};

const eyeOn = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>';
const eyeOff = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.9 17.9A10.9 10.9 0 0112 19c-7 0-11-7-11-7a19.8 19.8 0 015.1-5.9M9.9 4.2A10.7 10.7 0 0112 4c7 0 11 7 11 7a19.7 19.7 0 01-3.2 4.2M1 1l22 22"/><path d="M14.1 14.1A3 3 0 119.9 9.9"/></svg>';
function pwField(id, label, auto, ph) {
  const shown = AUTH.show[id];
  return `<label class="alabel" for="a-${id}">${label}</label><div class="pwrow"><input id="a-${id}" data-auth="${id}" type="${shown ? 'text' : 'password'}" autocomplete="${auto}" placeholder="${ph}" value="${esc(AUTH.vals[id])}" maxlength="128" required>
    <button type="button" class="pwtog" data-act="pwtoggle" data-f="${id}" aria-pressed="${shown}" aria-label="${shown ? 'Hide' : 'Show'} password" title="${shown ? 'Hide' : 'Show'} password">${shown ? eyeOff : eyeOn}<span>${shown ? 'Hide' : 'Show'}</span></button></div>`;
}
function loginView() {
  const up = AUTH.mode === 'up';
  return `<div class="authpage"><div class="authtop">${themeBtn()}</div><div class="authcard panel">
    <img src="assets/logo-mark-512.png" width="84" height="84" alt="TraceLens logo" class="authlogo">
    <span class="brandmark" style="display:block;text-align:center">TRACELENS</span>
    <h1 class="authh">${up ? 'Create your account' : 'Welcome back'}</h1>
    <p class="mut sm" style="text-align:center;margin:4px 0 16px">${up ? 'Create an account to start investigating.' : 'Sign in to continue to your investigations.'}</p>
    <div class="authtabs" role="tablist"><button type="button" role="tab" aria-selected="${!up}" class="${!up ? 'on' : ''}" data-act="authmode" data-m="in">Sign in</button><button type="button" role="tab" aria-selected="${up}" class="${up ? 'on' : ''}" data-act="authmode" data-m="up">Create account</button></div>
    <form id="authform" novalidate>
      ${up ? `<label class="alabel" for="a-name">Full name</label><input id="a-name" data-auth="name" type="text" autocomplete="name" placeholder="Your name" value="${esc(AUTH.vals.name)}" maxlength="80">` : ''}
      <label class="alabel" for="a-email">Email</label><input id="a-email" data-auth="email" type="email" autocomplete="email" inputmode="email" placeholder="you@example.com" value="${esc(AUTH.vals.email)}" maxlength="320">
      ${pwField('pw', 'Password', up ? 'new-password' : 'current-password', up ? 'At least 8 characters' : 'Your password')}
      ${up ? pwField('pw2', 'Confirm password', 'new-password', 'Re-enter your password') : ''}
      <p id="autherr" class="autherr" role="alert" tabindex="-1" ${AUTH.error ? '' : 'hidden'}>${esc(AUTH.error)}</p>
      <button type="submit" class="btn pri authgo" ${AUTH.busy ? 'disabled' : ''}>${AUTH.busy ? 'Please wait…' : up ? 'Create account' : 'Sign in'}</button>
    </form>
    <p class="xs mut" style="text-align:center;margin-top:14px">${authRemote() ? 'Your account is stored securely on the TraceLens server.' : 'No server is connected, so this account is stored in this browser only. Set TRACELENS_API_URL in config.js to use server accounts.'}</p>
  </div></div>`;
}

document.addEventListener('input', e => { const k = e.target.dataset && e.target.dataset.auth; if (k) { AUTH.vals[k] = e.target.value; if (AUTH.error) { AUTH.error = ''; const el = document.getElementById('autherr'); if (el) el.hidden = true; } } });
document.addEventListener('submit', e => { if (e.target.id === 'authform') { e.preventDefault(); if (!AUTH.busy) authSubmit(); } });
authRestore();
