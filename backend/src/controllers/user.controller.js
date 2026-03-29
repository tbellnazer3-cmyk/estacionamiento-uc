const User        = require('../models/User');
const TucBalance  = require('../models/TucBalance');
const Transaction = require('../models/Transaction');

const DEUDA_MONTO = 2350;

// GET /api/user/dashboard
// Devuelve saldo TUC, deuda pendiente y últimas 10 transacciones del usuario autenticado.
async function getDashboard(req, res, next) {
  try {
    const user = User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado.' });
    }

    const balanceRecord = TucBalance.findByTuc(user.tuc_number);
    const balance       = balanceRecord ? balanceRecord.balance : 0;
    const hasDebt       = balance < DEUDA_MONTO;
    const debtAmount    = hasDebt ? DEUDA_MONTO - balance : 0;

    const transactions = Transaction.findByUser(user.id, 10);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id:         user.id,
          email:      user.email,
          tuc_number: user.tuc_number,
        },
        tuc: {
          balance,
          has_debt:    hasDebt,
          debt_amount: debtAmount,
          updated_at:  balanceRecord ? balanceRecord.updated_at : null,
        },
        recent_transactions: transactions,
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/user/history?page=1&pageSize=10
// Devuelve el historial completo de transacciones del usuario, paginado.
async function getHistory(req, res, next) {
  try {
    const page     = Math.max(1, parseInt(req.query.page)     || 1);
    const pageSize = Math.min(50, parseInt(req.query.pageSize) || 10);

    const result = Transaction.findByUserPaginated(req.user.id, page, pageSize);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard, getHistory };
