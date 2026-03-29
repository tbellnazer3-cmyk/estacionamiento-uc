// transbank.service.js — Encapsula el SDK de Transbank Webpay Plus
// Ambiente: Integración (sandbox) con credenciales públicas de prueba.

const {
  WebpayPlus,
  Options,
  IntegrationApiKeys,
  IntegrationCommerceCodes,
  Environment,
} = require('transbank-sdk');

// ─── Configuración ────────────────────────────────────────────────────────────
// En producción reemplazar por:
//   new Options(process.env.TRANSBANK_COMMERCE_CODE, process.env.TRANSBANK_API_KEY, Environment.Production)

const txOptions = new Options(
  IntegrationCommerceCodes.WEBPAY_PLUS,
  IntegrationApiKeys.WEBPAY,
  Environment.Integration
);

const webpayTx = new WebpayPlus.Transaction(txOptions);

// ─── Crear transacción ────────────────────────────────────────────────────────
// Inicia una transacción en Webpay y devuelve { url, token }.
// El frontend debe redirigir al usuario a: url + "?token_ws=" + token
async function crearTransaccion({ buyOrder, sessionId, amount, returnUrl }) {
  const response = await webpayTx.create(buyOrder, sessionId, amount, returnUrl);
  return { url: response.url, token: response.token };
}

// ─── Confirmar transacción ────────────────────────────────────────────────────
// Llama a commit con el token_ws recibido en el return de Webpay.
// Devuelve el objeto de respuesta completo de Transbank.
async function confirmarTransaccion(token) {
  return webpayTx.commit(token);
}

// ─── Interpretar respuesta ────────────────────────────────────────────────────
// Devuelve true si el pago fue autorizado por Transbank.
function estaAutorizado(commitResponse) {
  return commitResponse && commitResponse.status === 'AUTHORIZED';
}

module.exports = { crearTransaccion, confirmarTransaccion, estaAutorizado };
