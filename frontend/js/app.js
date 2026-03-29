// ─── Validation helpers ───────────────────────────────────────────────────────

const UC_EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@(uc\.cl|puc\.cl)$/i;
const TUC_REGEX = /^\d{4}-\d{7}-\d$/;

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
  const input = document.getElementById(inputId);
  const errorEl = document.getElementById(errorId);
  if (!input || !errorEl) return;

  input.addEventListener('blur', () => {
    const err = validatorFn(input.value);
    if (err) showFieldError(input, errorEl, err);
    else clearFieldError(input, errorEl);
  });

  input.addEventListener('input', () => {
    if (input.classList.contains('field-error')) {
      const err = validatorFn(input.value);
      if (!err) clearFieldError(input, errorEl);
    }
  });
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

function setTab(tab, btn) {
  document.getElementById('tab-pagar-deuda').style.display = tab === 'pagar-deuda' ? 'block' : 'none';
  document.getElementById('tab-recargar').style.display = tab === 'recargar' ? 'block' : 'none';
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// ─── Payment method select ────────────────────────────────────────────────────

function selectPM(btn) {
  btn.closest('.payment-methods').querySelectorAll('.pm-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

// ─── Monto selection ──────────────────────────────────────────────────────────

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

// ─── Pago ─────────────────────────────────────────────────────────────────────

function procesarPago(tipo, monto) {
  const emailId = tipo === 'deuda' ? 'email-deuda' : 'email-recarga';
  const tucId   = tipo === 'deuda' ? 'tuc-deuda'   : 'tuc-recarga';
  const emailErrorId = tipo === 'deuda' ? 'error-email-deuda' : 'error-email-recarga';
  const tucErrorId   = tipo === 'deuda' ? 'error-tuc-deuda'   : 'error-tuc-recarga';

  const emailEl = document.getElementById(emailId);
  const tucEl   = document.getElementById(tucId);
  const emailErrEl = document.getElementById(emailErrorId);
  const tucErrEl   = document.getElementById(tucErrorId);

  const emailErr = validateEmail(emailEl.value);
  const tucErr   = validateTuc(tucEl.value);

  if (emailErr) showFieldError(emailEl, emailErrEl, emailErr);
  else clearFieldError(emailEl, emailErrEl);

  if (tucErr) showFieldError(tucEl, tucErrEl, tucErr);
  else clearFieldError(tucEl, tucErrEl);

  if (emailErr || tucErr) return;

  // Si monto es $0 en la pestaña de recarga, bloquear
  if (tipo === 'recarga') {
    const montoVal = parseInt(document.getElementById('monto-input').value) || 0;
    if (montoVal < 2350) {
      alert('El monto mínimo de recarga es $2.350.');
      return;
    }
  }

  const now = new Date();
  const hora  = now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  const fecha = now.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
  const folio = 'EST-' + Math.floor(Math.random() * 900000 + 100000);

  document.getElementById('modal-details').innerHTML = `
    <div class="modal-row"><span>Tipo</span><span>${tipo === 'deuda' ? 'Pago de deuda' : 'Recarga de saldo'}</span></div>
    <div class="modal-row"><span>Monto</span><span>${monto}</span></div>
    <div class="modal-row"><span>TUC</span><span>${tucEl.value.trim()}</span></div>
    <div class="modal-row"><span>Fecha y hora</span><span>${fecha}, ${hora}</span></div>
    <div class="modal-row"><span>Folio</span><span>${folio}</span></div>
    <div class="modal-row"><span>Comprobante</span><span>${emailEl.value.trim()}</span></div>
  `;
  document.getElementById('modal').classList.add('show');
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
  // Live validation
  attachLiveValidation('email-deuda',   'error-email-deuda',   validateEmail);
  attachLiveValidation('tuc-deuda',     'error-tuc-deuda',     validateTuc);
  attachLiveValidation('email-recarga', 'error-email-recarga', validateEmail);
  attachLiveValidation('tuc-recarga',   'error-tuc-recarga',   validateTuc);

  // Close modal clicking outside
  document.getElementById('modal').addEventListener('click', function(e) {
    if (e.target === this) cerrarModal();
  });
});
