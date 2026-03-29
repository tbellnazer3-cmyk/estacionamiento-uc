const API_BASE = 'http://localhost:3000/api';

// ─── Session helpers ──────────────────────────────────────────────────────────

function getToken()   { return sessionStorage.getItem('auth_token'); }
function getUser()    { try { return JSON.parse(sessionStorage.getItem('auth_user')); } catch { return null; } }
function isLoggedIn() { return !!getToken(); }

function logout() {
  sessionStorage.removeItem('auth_token');
  sessionStorage.removeItem('auth_user');
  sessionStorage.removeItem('pago_email');
  sessionStorage.removeItem('pago_tuc');
  sessionStorage.removeItem('pago_tipo');
  sessionStorage.removeItem('pago_monto');
  window.location.reload();
}

// ─── Validation helpers ───────────────────────────────────────────────────────

const UC_EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@(uc\.cl|puc\.cl)$/i;
const TUC_REGEX      = /^\d{4}-\d{7}-\d$/;

function validateEmail(value) {
  if (!value.trim()) return 'El correo es obligatorio.';
  if (!UC_EMAIL_REGEX.test(value.trim())) return 'Ingresa un correo @uc.cl o @puc.cl válido.';
  return null;
}

function validateTuc(value) {
  if (!value.trim()) return 'El número de TUC es obligatorio.';
  if (!TUC_REGEX.test(value.trim())) return 'Formato esperado: YYYY-NNNNNNN-D (ej: 2024-0001234-7).';
  return null;
}

function showFieldError(inputEl, msgEl, message) {
  inputEl.classList.add('field-error');
  msgEl.textContent = message;
  msgEl.classList.add('visible');
}

function clearFieldError(inputEl, msgEl) {
  inputEl.classList.remove('field-error');
  msgEl.classList.remove('visible');
}

// ─── Live validation on blur ──────────────────────────────────────────────────

function attachLiveValidation(inputId, errorId, validatorFn) {
  const input   = document.getElementById(inputId);
  const errorEl = document.getElementById(errorId);
  if (!input || !errorEl) return;
  input.addEventListener('blur', () => {
    const err = validatorFn(input.value);
    if (err) showFieldError(input, errorEl, err);
    else     clearFieldError(input, errorEl);
  });
  input.addEventListener('input', () => {
    if (input.classList.contains('field-error')) {
      const err = validatorFn(input.value);
      if (!err) clearFieldError(input, errorEl);
    }
  });
}

// ─── Nav state ────────────────────────────────────────────────────────────────

function updateNav() {
  const navLinks    = document.querySelector('.nav-links');
  const authNavItem = document.getElementById('nav-auth-item');
  if (!navLinks || !authNavItem) return;

  const user = getUser();
  if (user) {
    authNavItem.innerHTML = `
      <span style="color:rgba(255,255,255,0.6);font-size:0.82rem;">${user.email}</span>
      <button onclick="logout()" style="background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);color:var(--blanco);border-radius:6px;padding:0.35rem 0.85rem;font-size:0.8rem;cursor:pointer;font-family:'DM Sans',sans-serif;margin-left:0.5rem;">Salir</button>
    `;
  } else {
    authNavItem.innerHTML = `<a href="login.html?redirect=index.html%23pagar" style="background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.3);color:var(--blanco);padding:0.4rem 1rem;border-radius:6px;font-size:0.85rem;font-weight:500;text-decoration:none;">Iniciar sesión</a>`;
  }
}

// ─── Pre-fill form with session data ─────────────────────────────────────────

function prefillForm() {
  const user = getUser();
  if (!user) return;
  ['email-deuda', 'email-recarga'].forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.value) el.value = user.email;
  });
  ['tuc-deuda', 'tuc-recarga'].forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.value) el.value = user.tuc_number || '';
  });
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

function setTab(tab, btn) {
  document.getElementById('tab-pagar-deuda').style.display = tab === 'pagar-deuda' ? 'block' : 'none';
  document.getElementById('tab-recargar').style.display    = tab === 'recargar'    ? 'block' : 'none';
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function selectPM(btn) {
  btn.closest('.payment-methods').querySelectorAll('.pm-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

function seleccionarMonto(monto, btn) {
  document.getElementById('monto-input').value = monto;
  document.getElementById('total-display').textContent = '$' + monto.toLocaleString('es-CL');
  document.querySelectorAll('.monto-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

function actualizarTotal(val) {
  const n = parseInt(val) || 0;
  document.getElementById('total-display').textContent = '$' + n.toLocaleString('es-CL');
  document.querySelectorAll('.monto-btn').forEach(b => b.classList.remove('selected'));
}

// ─── Iniciar pago con Webpay ──────────────────────────────────────────────────

async function procesarPago(tipo, _montoDisplay) {
  // Redirigir a login si no está autenticado
  if (!isLoggedIn()) {
    window.location.href = 'login.html?redirect=' + encodeURIComponent('index.html#pagar');
    return;
  }

  const emailId      = tipo === 'deuda' ? 'email-deuda'       : 'email-recarga';
  const tucId        = tipo === 'deuda' ? 'tuc-deuda'         : 'tuc-recarga';
  const emailErrorId = tipo === 'deuda' ? 'error-email-deuda' : 'error-email-recarga';
  const tucErrorId   = tipo === 'deuda' ? 'error-tuc-deuda'   : 'error-tuc-recarga';

  const emailEl    = document.getElementById(emailId);
  const tucEl      = document.getElementById(tucId);
  const emailErrEl = document.getElementById(emailErrorId);
  const tucErrEl   = document.getElementById(tucErrorId);

  const emailErr = validateEmail(emailEl.value);
  const tucErr   = validateTuc(tucEl.value);

  if (emailErr) showFieldError(emailEl, emailErrEl, emailErr);
  else          clearFieldError(emailEl, emailErrEl);
  if (tucErr)   showFieldError(tucEl,   tucErrEl,   tucErr);
  else          clearFieldError(tucEl,   tucErrEl);
  if (emailErr || tucErr) return;

  let amount = tipo === 'deuda' ? 2350 : (parseInt(document.getElementById('monto-input').value) || 0);
  if (tipo === 'recarga' && amount < 2350) {
    alert('El monto mínimo de recarga es $2.350.');
    return;
  }

  sessionStorage.setItem('pago_email', emailEl.value.trim());
  sessionStorage.setItem('pago_tuc',   tucEl.value.trim());
  sessionStorage.setItem('pago_tipo',  tipo);
  sessionStorage.setItem('pago_monto', amount);

  const btn = document.querySelector(`#tab-${tipo === 'deuda' ? 'pagar-deuda' : 'recargar'} .btn-pagar`);
  if (btn) { btn.dataset.original = btn.textContent; btn.disabled = true; btn.textContent = '⏳ Redirigiendo a Webpay...'; }

  try {
    const res  = await fetch(`${API_BASE}/payment/init`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ email: emailEl.value.trim(), tuc_number: tucEl.value.trim(), amount, type: tipo }),
    });
    const data = await res.json();

    if (res.status === 401) {
      // Token expirado → forzar nuevo login
      logout();
      return;
    }
    if (!res.ok || !data.success) throw new Error(data.error || data.errors?.[0]?.msg || 'Error al iniciar el pago.');

    window.location.href = data.webpay_url;
  } catch (err) {
    if (btn) { btn.disabled = false; btn.textContent = btn.dataset.original; }
    alert('Error: ' + err.message);
  }
}

function cerrarModal() {
  document.getElementById('modal').classList.remove('show');
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

function toggleFaq(el) {
  el.classList.toggle('open');
}

// ─── Init ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  updateNav();
  prefillForm();

  attachLiveValidation('email-deuda',   'error-email-deuda',   validateEmail);
  attachLiveValidation('tuc-deuda',     'error-tuc-deuda',     validateTuc);
  attachLiveValidation('email-recarga', 'error-email-recarga', validateEmail);
  attachLiveValidation('tuc-recarga',   'error-tuc-recarga',   validateTuc);

  const modal = document.getElementById('modal');
  if (modal) modal.addEventListener('click', e => { if (e.target === modal) cerrarModal(); });
});
