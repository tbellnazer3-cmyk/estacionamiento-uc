const Database = require('better-sqlite3');
const path     = require('path');
const fs       = require('fs');

const DB_PATH     = path.resolve(__dirname, '..', '..', '..', process.env.DB_URL || 'database.sqlite');
const SCHEMA_PATH = path.resolve(__dirname, '..', 'models', 'schema.sql');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    applySchema(db);
  }
  return db;
}

function applySchema(database) {
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  database.exec(schema);
}

// Cierra la conexión al apagar el proceso
process.on('exit', () => { if (db) db.close(); });
process.on('SIGINT',  () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

module.exports = { getDb };
