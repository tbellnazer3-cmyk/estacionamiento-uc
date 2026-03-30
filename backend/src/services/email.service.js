'use strict';

const nodemailer = require('nodemailer');

const DEUDA_MINIMA = 2350;

// ─── Transporter ─────────────────────────────────────────────────────────────
// Usa Gmail SMTP con App Password. Si las variables no están configuradas,
// el servicio opera en modo silencioso (no lanza errores al resto del sistema).

function createTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    return null;
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
}

async function sendMail({ to, subject, html }) {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn('[email] Servicio no configurado — EMAIL_USER o EMAIL_PASSWORD falta en .env');
    return;
  }

  const from = `"${process.env.EMAIL_FROM || 'EstacionaUC'}" <${process.env.EMAIL_USER}>`;
  try {
    const info = await transporter.sendMail({ from, to, subject, html });
    console.log(`[email] Enviado a ${to} — messageId: ${info.messageId}`);
  } catch (err) {
    console.error(`[email] Error al enviar a ${to}:`, err.message);
    // No re-lanzar: el error de correo no debe interrumpir el flujo de pago
  }
}

// ─── Helpers de formato ───────────────────────────────────────────────────────

function formatMonto(n) {
  return '$' + Number(n).toLocaleString('es-CL');
}

function formatFecha(iso) {
  if (!iso) return new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' });
  return new Date(iso).toLocaleString('es-CL', { timeZone: 'America/Santiago' });
}

// ─── Estilos base compartidos ────────────────────────────────────────────────
const BASE_STYLE = `
  body { margin: 0; padding: 0; background: #f0f2f5; font-family: 'Segoe UI', Arial, sans-serif; }
  .wrapper { max-width: 560px; margin: 32px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #1a3a5c 0%, #1e5fa8 100%); padding: 32px 40px; text-align: center; }
  .header h1 { margin: 0; color: #fff; font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }
  .header p  { margin: 6px 0 0; color: rgba(255,255,255,0.7); font-size: 13px; }
  .body   { padding: 32px 40px; }
  .body p { margin: 0 0 14px; color: #374151; font-size: 15px; line-height: 1.6; }
  .detail-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px 24px; margin: 20px 0; }
  .detail-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e9ecef; font-size: 14px; color: #374151; }
  .detail-row:last-child { border-bottom: none; }
  .detail-label { color: #6b7280; }
  .detail-value { font-weight: 600; color: #111827; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
  .badge-success { background: #d1fae5; color: #065f46; }
  .badge-warning { background: #fef3c7; color: #92400e; }
  .btn { display: inline-block; margin-top: 8px; padding: 12px 28px; background: #1e5fa8; color: #fff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600; }
  .footer { background: #f8fafc; border-top: 1px solid #e9ecef; padding: 20px 40px; text-align: center; font-size: 12px; color: #9ca3af; }
`;

// ─── Template: Confirmación de pago ──────────────────────────────────────────

function templatePagoConfirmado({ folio, type, amount, tuc_number, auth_code, date }) {
  const tipoLabel  = type === 'deuda' ? 'Pago de deuda' : 'Recarga de saldo';
  const iconoTipo  = type === 'deuda' ? '💳' : '🔋';

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><style>${BASE_STYLE}</style></head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>✅ Pago confirmado</h1>
    <p>EstacionaUC — Campus San Joaquín, PUC</p>
  </div>
  <div class="body">
    <p>Tu pago fue procesado exitosamente. A continuación el detalle de tu transacción:</p>
    <div class="detail-box">
      <div class="detail-row">
        <span class="detail-label">Tipo</span>
        <span class="detail-value">${iconoTipo} ${tipoLabel}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Monto</span>
        <span class="detail-value">${formatMonto(amount)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">TUC</span>
        <span class="detail-value">${tuc_number}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Folio</span>
        <span class="detail-value">${folio}</span>
      </div>
      ${auth_code ? `
      <div class="detail-row">
        <span class="detail-label">Código autorización</span>
        <span class="detail-value">${auth_code}</span>
      </div>` : ''}
      <div class="detail-row">
        <span class="detail-label">Fecha</span>
        <span class="detail-value">${formatFecha(date)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Estado</span>
        <span class="detail-value"><span class="badge badge-success">Aprobado</span></span>
      </div>
    </div>
    <p style="font-size:13px;color:#6b7280;">Conserva este correo como comprobante de tu pago. Si tienes dudas, contáctanos por el portal.</p>
  </div>
  <div class="footer">EstacionaUC &nbsp;•&nbsp; Campus San Joaquín, PUC &nbsp;•&nbsp; No responder este correo</div>
</div>
</body>
</html>`;
}

// ─── Template: Alerta de saldo bajo ──────────────────────────────────────────

function templateSaldoBajo({ tuc_number, balance }) {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><style>${BASE_STYLE}</style></head>
<body>
<div class="wrapper">
  <div class="header" style="background: linear-gradient(135deg, #92400e 0%, #d97706 100%);">
    <h1>⚠️ Saldo bajo en tu TUC</h1>
    <p>EstacionaUC — Campus San Joaquín, PUC</p>
  </div>
  <div class="body">
    <p>Tu TUC tiene un saldo inferior al mínimo necesario para ingresar al estacionamiento.</p>
    <div class="detail-box">
      <div class="detail-row">
        <span class="detail-label">TUC</span>
        <span class="detail-value">${tuc_number}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Saldo actual</span>
        <span class="detail-value" style="color:#b45309;">${formatMonto(balance)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Mínimo requerido</span>
        <span class="detail-value">${formatMonto(DEUDA_MINIMA)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Estado</span>
        <span class="detail-value"><span class="badge badge-warning">Saldo insuficiente</span></span>
      </div>
    </div>
    <p>Recarga tu TUC ahora para poder ingresar al estacionamiento sin generar una deuda.</p>
    <a class="btn" href="http://localhost:5500/index.html#pagar">Recargar ahora</a>
  </div>
  <div class="footer">EstacionaUC &nbsp;•&nbsp; Campus San Joaquín, PUC &nbsp;•&nbsp; No responder este correo</div>
</div>
</body>
</html>`;
}

// ─── Template: Bienvenida ─────────────────────────────────────────────────────

function templateBienvenida({ email, tuc_number }) {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><style>${BASE_STYLE}</style></head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>👋 ¡Bienvenido a EstacionaUC!</h1>
    <p>Campus San Joaquín, PUC</p>
  </div>
  <div class="body">
    <p>Tu cuenta fue creada exitosamente. Ya puedes pagar y recargar el saldo de tu TUC directamente desde el portal, sin necesidad de ir a los tótems del campus.</p>
    <div class="detail-box">
      <div class="detail-row">
        <span class="detail-label">Correo</span>
        <span class="detail-value">${email}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">TUC registrada</span>
        <span class="detail-value">${tuc_number}</span>
      </div>
    </div>
    <p><strong>¿Qué puedes hacer?</strong></p>
    <ul style="color:#374151;font-size:14px;line-height:2;padding-left:20px;margin:0 0 16px;">
      <li>Pagar deudas de estacionamiento ($2.350 CLP)</li>
      <li>Recargar saldo para futuras entradas</li>
      <li>Ver tu historial de pagos en el dashboard</li>
    </ul>
    <a class="btn" href="http://localhost:5500/index.html">Ir al portal</a>
  </div>
  <div class="footer">EstacionaUC &nbsp;•&nbsp; Campus San Joaquín, PUC &nbsp;•&nbsp; No responder este correo</div>
</div>
</body>
</html>`;
}

// ─── Funciones públicas ───────────────────────────────────────────────────────

async function sendPaymentConfirmation(to, payload) {
  await sendMail({
    to,
    subject: `✅ Pago confirmado — Folio ${payload.folio} | EstacionaUC`,
    html: templatePagoConfirmado(payload),
  });
}

async function sendLowBalanceAlert(to, payload) {
  await sendMail({
    to,
    subject: `⚠️ Saldo bajo en tu TUC — EstacionaUC`,
    html: templateSaldoBajo(payload),
  });
}

async function sendWelcomeEmail(to, payload) {
  await sendMail({
    to,
    subject: `👋 Bienvenido a EstacionaUC`,
    html: templateBienvenida({ email: to, ...payload }),
  });
}

module.exports = { sendPaymentConfirmation, sendLowBalanceAlert, sendWelcomeEmail };
