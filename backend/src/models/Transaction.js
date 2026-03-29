const { getDb } = require('../db/database');

const Transaction = {
  create({ userId, tucNumber, type, amount, folio, status = 'pending', webpayToken = null }) {
    const stmt = getDb().prepare(`
      INSERT INTO transactions (user_id, tuc_number, type, amount, status, folio, webpay_token)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(userId, tucNumber, type, amount, status, folio, webpayToken);
    return this.findById(result.lastInsertRowid);
  },

  findById(id) {
    return getDb()
      .prepare('SELECT * FROM transactions WHERE id = ?')
      .get(id);
  },

  findByFolio(folio) {
    return getDb()
      .prepare('SELECT * FROM transactions WHERE folio = ?')
      .get(folio);
  },

  findByWebpayToken(token) {
    return getDb()
      .prepare('SELECT * FROM transactions WHERE webpay_token = ?')
      .get(token);
  },

  updateStatus(id, status) {
    getDb().prepare('UPDATE transactions SET status = ? WHERE id = ?').run(status, id);
    return this.findById(id);
  },

  updateWebpayToken(id, token) {
    getDb().prepare('UPDATE transactions SET webpay_token = ? WHERE id = ?').run(token, id);
  },

  // Últimas N transacciones de un usuario
  findByUser(userId, limit = 10) {
    return getDb().prepare(`
      SELECT * FROM transactions
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `).all(userId, limit);
  },

  // Historial paginado
  findByUserPaginated(userId, page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;
    const rows = getDb().prepare(`
      SELECT * FROM transactions
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(userId, pageSize, offset);

    const { total } = getDb()
      .prepare('SELECT COUNT(*) AS total FROM transactions WHERE user_id = ?')
      .get(userId);

    return { rows, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  },
};

module.exports = Transaction;
