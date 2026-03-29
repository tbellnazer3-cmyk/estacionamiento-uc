// seed.js — Inserta datos de prueba en la base de datos
// Uso: npm run seed  (desde /backend/)

require('dotenv').config({ path: '../../.env' });

const { getDb }   = require('./database');
const User        = require('../models/User');
const TucBalance  = require('../models/TucBalance');
const Transaction = require('../models/Transaction');
const { hashPassword } = require('../services/auth.service');

const SEED_USERS = [
  { email: 'estudiante1@uc.cl',  password: 'password123', tucNumber: '2024-0001234-7' },
  { email: 'estudiante2@uc.cl',  password: 'password123', tucNumber: '2024-0007654-3' },
  { email: 'estudiante3@puc.cl', password: 'password123', tucNumber: '2024-0009999-1' },
];

const SEED_BALANCES = [
  { tucNumber: '2024-0001234-7', balance: 12350 },
  { tucNumber: '2024-0007654-3', balance: 0     },
  { tucNumber: '2024-0009999-1', balance: 4700  },
];

function seed() {
  const db = getDb();

  console.log('Limpiando datos anteriores...');
  db.exec('DELETE FROM transactions; DELETE FROM tuc_balances; DELETE FROM users;');

  console.log('Insertando usuarios (con bcrypt)...');
  const createdUsers = SEED_USERS.map(u =>
    User.create({ email: u.email, passwordHash: hashPassword(u.password), tucNumber: u.tucNumber })
  );

  console.log('Insertando saldos TUC...');
  SEED_BALANCES.forEach(b => TucBalance.upsert(b.tucNumber, b.balance));

  console.log('Insertando transacciones de prueba...');
  Transaction.create({ userId: createdUsers[0].id, tucNumber: '2024-0001234-7', type: 'recarga', amount: 10000,  folio: 'EST-100001', status: 'approved' });
  Transaction.create({ userId: createdUsers[0].id, tucNumber: '2024-0001234-7', type: 'deuda',   amount: 2350,   folio: 'EST-100002', status: 'approved' });
  Transaction.create({ userId: createdUsers[1].id, tucNumber: '2024-0007654-3', type: 'deuda',   amount: 2350,   folio: 'EST-100003', status: 'pending'  });
  Transaction.create({ userId: createdUsers[2].id, tucNumber: '2024-0009999-1', type: 'recarga', amount: 4700,   folio: 'EST-100004', status: 'approved' });

  console.log('');
  console.log('✅ Seed completado.');
  console.log('');
  console.log('Credenciales de prueba:');
  SEED_USERS.forEach(u => console.log(`  ${u.email}  /  ${u.password}  (TUC: ${u.tucNumber})`));
  process.exit(0);
}

seed();
