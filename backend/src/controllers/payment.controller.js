const { validationResult } = require('express-validator');
const Transaction  = require('../models/Transaction');
const TucBalance   = require('../models/TucBalance');
const User         = require('../models/User');

const DEUDA_MONTO = 2350;

function generarFolio() {
  return 'EST-' + Math.floor(Math.random() * 900000 + 100000);
}

// POST /api/payment/deuda
// Paga la deuda pendiente de $2.350.
async function pagarDeuda(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const { email, tuc_number, payment_method } = req.body;

    const user = User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado.' });
    }

    const balance = TucBalance.findByTuc(tuc_number);
    if (!balance) {
      return res.status(404).json({ success: false, error: 'TUC no encontrada.' });
    }

    if (balance.balance >= DEUDA_MONTO) {
      return res.status(422).json({
        success: false,
        error: 'La TUC no tiene deuda pendiente.',
      });
    }

    const folio = generarFolio();

    // TODO (Prompt 5): reemplazar con flujo Webpay real antes de registrar
    const tx = Transaction.create({
      userId:    user.id,
      tucNumber: tuc_number,
      type:      'deuda',
      amount:    DEUDA_MONTO,
      folio,
      status:    'approved',
    });

    TucBalance.addBalance(tuc_number, DEUDA_MONTO);

    res.status(200).json({
      success: true,
      message: 'Deuda pagada correctamente.',
      data: {
        folio:          tx.folio,
        email,
        tuc_number,
        type:           'deuda',
        amount:         DEUDA_MONTO,
        payment_method: payment_method || 'webpay',
        status:         'approved',
        timestamp:      tx.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/payment/recharge
// Recarga saldo en la TUC por el monto indicado.
async function recargarSaldo(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const { email, tuc_number, amount, payment_method } = req.body;

    if (amount < DEUDA_MONTO) {
      return res.status(422).json({
        success: false,
        error: `El monto mínimo de recarga es $${DEUDA_MONTO.toLocaleString('es-CL')} CLP.`,
      });
    }

    const user = User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado.' });
    }

    // Si la TUC no tiene registro aún, créalo con balance 0
    let balance = TucBalance.findByTuc(tuc_number);
    if (!balance) {
      balance = TucBalance.upsert(tuc_number, 0);
    }

    const folio = generarFolio();

    // TODO (Prompt 5): reemplazar con flujo Webpay real antes de registrar
    const tx = Transaction.create({
      userId:    user.id,
      tucNumber: tuc_number,
      type:      'recarga',
      amount,
      folio,
      status:    'approved',
    });

    TucBalance.addBalance(tuc_number, amount);

    res.status(200).json({
      success: true,
      message: 'Recarga realizada correctamente.',
      data: {
        folio:          tx.folio,
        email,
        tuc_number,
        type:           'recarga',
        amount,
        payment_method: payment_method || 'webpay',
        status:         'approved',
        timestamp:      tx.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { pagarDeuda, recargarSaldo };
