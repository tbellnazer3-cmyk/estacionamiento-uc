-- EstacionaUC — Schema SQLite
-- Ejecutado automáticamente por database.js al iniciar el servidor.

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ─── Usuarios ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  email        TEXT    NOT NULL UNIQUE,
  password_hash TEXT   NOT NULL,
  tuc_number   TEXT    NOT NULL UNIQUE,
  created_at   DATETIME DEFAULT (datetime('now'))
);

-- ─── Saldos TUC ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tuc_balances (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  tuc_number  TEXT    NOT NULL UNIQUE,
  balance     INTEGER NOT NULL DEFAULT 0,   -- en CLP
  updated_at  DATETIME DEFAULT (datetime('now'))
);

-- ─── Transacciones ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tuc_number     TEXT    NOT NULL,
  type           TEXT    NOT NULL CHECK(type IN ('deuda', 'recarga')),
  amount         INTEGER NOT NULL CHECK(amount > 0),
  status         TEXT    NOT NULL DEFAULT 'pending'
                         CHECK(status IN ('pending', 'approved', 'failed')),
  folio          TEXT    UNIQUE,
  webpay_token   TEXT,
  created_at     DATETIME DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_transactions_user   ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_tuc    ON transactions(tuc_number);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
