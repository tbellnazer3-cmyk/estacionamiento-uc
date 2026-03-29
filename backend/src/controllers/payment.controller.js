const { validationResult } = require('express-validator');

const DEUDA_MONTO = 2350; // CLP — tarifa fija por ingreso al campus

// POST /api/payment/deuda
// Paga la deuda pendiente de $2.350 de un estudiante.
async function pagarDeuda(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const { email, tuc_number, payment_method } = req.body;

    // TODO (Prompt 5): iniciar transacción Webpay real
    // TODO (Prompt 4): registrar transacción en DB y actualizar saldo TUC

    const folio = 'EST-' + Math.floor(Math.random() * 900000 + 100000);

    res.status(200).json({
      success: true,
      message: 'Deuda pagada correctamente (mock).',
      data: {
        folio,
        email,
        tuc_number,
        type: 'deuda',
        amount: DEUDA_MONTO,
        payment_method: payment_method || 'webpay',
        status: 'approved',
        timestamp: new Date().toISOString(),
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

    // TODO (Prompt 5): iniciar transacción Webpay real
    // TODO (Prompt 4): registrar transacción en DB y actualizar saldo TUC

    const folio = 'EST-' + Math.floor(Math.random() * 900000 + 100000);

    res.status(200).json({
      success: true,
      message: 'Recarga realizada correctamente (mock).',
      data: {
        folio,
        email,
        tuc_number,
        type: 'recarga',
        amount,
        payment_method: payment_method || 'webpay',
        status: 'approved',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { pagarDeuda, recargarSaldo };
