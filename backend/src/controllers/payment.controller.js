const { validationResult } = require('express-validator');
const Transaction  = require('../models/Transaction');
const TucBalance   = require('../models/TucBalance');
const User         = require('../models/User');
const transbank    = require('../services/transbank.service');
const emailService = require('../services/email.service');

const DEUDA_MONTO  = 2350;
const BACKEND_URL  = process.env.BACKEND_URL  || 'http://localhost:3000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5500';

function generarFolio() {
  return 'EST-' + Math.floor(Math.random() * 900000 + 100000);
}

// ─── POST /api/payment/init ────────────────────────────────────────────────────
// Valida datos, crea transacción pendiente en DB e inicia el flujo Webpay.
// Devuelve { webpay_url } para que el frontend redirija al usuario.
async function initPayment(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const { email, tuc_number, amount, type } = req.body;
    const montoFinal = type === 'deuda' ? DEUDA_MONTO : Number(amount);

    if (montoFinal < DEUDA_MONTO) {
      return res.status(422).json({
        success: false,
        error: `El monto mínimo es $${DEUDA_MONTO.toLocaleString('es-CL')} CLP.`,
      });
    }

    const user = User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado.' });
    }

    // Verificar / crear registro de saldo TUC
    let balance = TucBalance.findByTuc(tuc_number);
    if (!balance) balance = TucBalance.upsert(tuc_number, 0);

    if (type === 'deuda' && balance.balance >= DEUDA_MONTO) {
      return res.status(422).json({ success: false, error: 'La TUC no tiene deuda pendiente.' });
    }

    const folio     = generarFolio();
    const sessionId = `${user.id}-${Date.now()}`;
    const returnUrl = `${BACKEND_URL}/api/payment/return`;

    // Crear transacción pendiente en DB
    const tx = Transaction.create({
      userId:    user.id,
      tucNumber: tuc_number,
      type,
      amount:    montoFinal,
      folio,
      status:    'pending',
    });

    // Iniciar transacción en Webpay
    const webpay = await transbank.crearTransaccion({
      buyOrder:  folio,
      sessionId,
      amount:    montoFinal,
      returnUrl,
    });

    // Guardar token Webpay en la transacción
    Transaction.updateWebpayToken(tx.id, webpay.token);

    res.status(200).json({
      success:     true,
      webpay_url:  `${webpay.url}?token_ws=${webpay.token}`,
      folio,
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/payment/return ──────────────────────────────────────────────────
// Webpay redirige aquí (POST con form-encoded) tras el pago del usuario.
// Confirma la transacción, actualiza DB y redirige al frontend con el resultado.
async function returnPayment(req, res, next) {
  try {
    // Webpay puede enviar GET o POST según el caso (pago normal, cancelación, timeout)
    const tokenWs  = req.body.token_ws  || req.query.token_ws;
    const tbkToken = req.body.TBK_TOKEN || req.query.TBK_TOKEN;

    // Cancelación o timeout por parte del usuario
    if (!tokenWs && tbkToken) {
      const tx = Transaction.findByWebpayToken(tbkToken);
      if (tx) Transaction.updateStatus(tx.id, 'failed');
      return res.redirect(`${FRONTEND_URL}/webpay-return.html?status=cancelled&folio=${tx?.folio || ''}`);
    }

    if (!tokenWs) {
      return res.redirect(`${FRONTEND_URL}/webpay-return.html?status=error`);
    }

    // Confirmar con Transbank
    const commitResponse = await transbank.confirmarTransaccion(tokenWs);
    const tx = Transaction.findByWebpayToken(tokenWs);

    if (!tx) {
      return res.redirect(`${FRONTEND_URL}/webpay-return.html?status=error`);
    }

    if (transbank.estaAutorizado(commitResponse)) {
      Transaction.updateStatus(tx.id, 'approved');
      TucBalance.addBalance(tx.tuc_number, tx.amount);

      // Notificaciones por correo (sin bloquear el redirect)
      const user       = User.findByTuc(tx.tuc_number);
      const newBalance = TucBalance.findByTuc(tx.tuc_number);
      if (user) {
        emailService.sendPaymentConfirmation(user.email, {
          folio:     tx.folio,
          type:      tx.type,
          amount:    tx.amount,
          tuc_number: tx.tuc_number,
          auth_code: commitResponse.authorization_code || '',
          date:      tx.created_at,
        });
        if (newBalance && newBalance.balance < DEUDA_MONTO) {
          emailService.sendLowBalanceAlert(user.email, {
            tuc_number: tx.tuc_number,
            balance:    newBalance.balance,
          });
        }
      }

      const params = new URLSearchParams({
        status:    'success',
        folio:     tx.folio,
        amount:    tx.amount,
        type:      tx.type,
        tuc:       tx.tuc_number,
        auth_code: commitResponse.authorization_code || '',
      });
      return res.redirect(`${FRONTEND_URL}/webpay-return.html?${params}`);
    } else {
      Transaction.updateStatus(tx.id, 'failed');
      return res.redirect(`${FRONTEND_URL}/webpay-return.html?status=failed&folio=${tx.folio}`);
    }
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/payment/confirm ────────────────────────────────────────────────
// Permite al frontend consultar el resultado de una transacción por su folio.
async function confirmPayment(req, res, next) {
  try {
    const { folio } = req.body;
    if (!folio) {
      return res.status(422).json({ success: false, error: 'El folio es obligatorio.' });
    }

    const tx = Transaction.findByFolio(folio);
    if (!tx) {
      return res.status(404).json({ success: false, error: 'Transacción no encontrada.' });
    }

    res.status(200).json({
      success: true,
      data: {
        folio:      tx.folio,
        type:       tx.type,
        amount:     tx.amount,
        status:     tx.status,
        tuc_number: tx.tuc_number,
        created_at: tx.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── Legacy: mantenidos para compatibilidad interna ──────────────────────────
async function pagarDeuda(req, res, next) {
  req.body.type = 'deuda';
  return initPayment(req, res, next);
}

async function recargarSaldo(req, res, next) {
  req.body.type = 'recarga';
  return initPayment(req, res, next);
}

module.exports = { initPayment, returnPayment, confirmPayment, pagarDeuda, recargarSaldo };
