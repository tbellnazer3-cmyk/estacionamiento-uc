const { getDb } = require('../db/database');

const User = {
  findByEmail(email) {
    return getDb()
      .prepare('SELECT * FROM users WHERE email = ?')
      .get(email);
  },

  findById(id) {
    return getDb()
      .prepare('SELECT id, email, tuc_number, created_at FROM users WHERE id = ?')
      .get(id);
  },

  findByTuc(tucNumber) {
    return getDb()
      .prepare('SELECT id, email, tuc_number, created_at FROM users WHERE tuc_number = ?')
      .get(tucNumber);
  },

  create({ email, passwordHash, tucNumber }) {
    const stmt = getDb().prepare(
      'INSERT INTO users (email, password_hash, tuc_number) VALUES (?, ?, ?)'
    );
    const result = stmt.run(email, passwordHash, tucNumber);
    return { id: result.lastInsertRowid, email, tuc_number: tucNumber };
  },

  emailExists(email) {
    return !!getDb()
      .prepare('SELECT 1 FROM users WHERE email = ?')
      .get(email);
  },

  tucExists(tucNumber) {
    return !!getDb()
      .prepare('SELECT 1 FROM users WHERE tuc_number = ?')
      .get(tucNumber);
  },
};

module.exports = User;
