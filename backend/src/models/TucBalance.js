const { getDb } = require('../db/database');

const TucBalance = {
  findByTuc(tucNumber) {
    return getDb()
      .prepare('SELECT * FROM tuc_balances WHERE tuc_number = ?')
      .get(tucNumber);
  },

  // Crea el registro de saldo si no existe (balance inicial = 0)
  upsert(tucNumber, balance = 0) {
    getDb().prepare(`
      INSERT INTO tuc_balances (tuc_number, balance, updated_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(tuc_number) DO UPDATE SET
        balance    = excluded.balance,
        updated_at = datetime('now')
    `).run(tucNumber, balance);
    return this.findByTuc(tucNumber);
  },

  // Suma un monto al saldo actual (usado al confirmar un pago)
  addBalance(tucNumber, amount) {
    getDb().prepare(`
      UPDATE tuc_balances
      SET balance = balance + ?, updated_at = datetime('now')
      WHERE tuc_number = ?
    `).run(amount, tucNumber);
    return this.findByTuc(tucNumber);
  },
};

module.exports = TucBalance;
