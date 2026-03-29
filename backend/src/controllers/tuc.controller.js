const TucBalance  = require('../models/TucBalance');
const Transaction = require('../models/Transaction');

const DEUDA_MONTO = 2350;
const TUC_REGEX   = /^\d{4}-\d{7}-\d$/;

// GET /api/tuc/:tucNumber
// Retorna el saldo actual de una TUC.
async function getTucBalance(req, res, next) {
  try {
    const { tucNumber } = req.params;

    if (!TUC_REGEX.test(tucNumber)) {
      return res.status(422).json({
        success: false,
        error: 'Formato de TUC inválido. Esperado: YYYY-NNNNNNN-D',
      });
    }

    const record = TucBalance.findByTuc(tucNumber);

    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'TUC no encontrada. Verifica el número ingresado.',
      });
    }

    const tieneDeuda = record.balance < DEUDA_MONTO;

    res.status(200).json({
      success: true,
      data: {
        tuc_number: record.tuc_number,
        balance:    record.balance,
        has_debt:   tieneDeuda,
        debt_amount: tieneDeuda ? DEUDA_MONTO - record.balance : 0,
        updated_at: record.updated_at,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getTucBalance };
