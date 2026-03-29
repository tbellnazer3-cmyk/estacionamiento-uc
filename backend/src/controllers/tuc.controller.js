// TUC mock data — se reemplazará con DB real en Prompt 4
const MOCK_BALANCES = {
  '2024-0001234-7': { balance: 12350, owner: 'María José Rodríguez' },
  '2024-0007654-3': { balance: 0,     owner: 'Carlos Pérez' },
  '2024-0009999-1': { balance: 4700,  owner: 'Ana Soto' },
};

// GET /api/tuc/:tucNumber
// Retorna el saldo actual de una TUC.
async function getTucBalance(req, res, next) {
  try {
    const { tucNumber } = req.params;
    const TUC_REGEX = /^\d{4}-\d{7}-\d$/;

    if (!TUC_REGEX.test(tucNumber)) {
      return res.status(422).json({
        success: false,
        error: 'Formato de TUC inválido. Esperado: YYYY-NNNNNNN-D',
      });
    }

    // TODO (Prompt 4): consultar saldo real desde DB
    const record = MOCK_BALANCES[tucNumber];

    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'TUC no encontrada. Verifica el número ingresado.',
      });
    }

    const tieneDeuda = record.balance < 2350;

    res.status(200).json({
      success: true,
      data: {
        tuc_number: tucNumber,
        owner: record.owner,
        balance: record.balance,
        has_debt: tieneDeuda,
        debt_amount: tieneDeuda ? 2350 - record.balance : 0,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getTucBalance };
