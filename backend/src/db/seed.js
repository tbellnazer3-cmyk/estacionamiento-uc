// seed.js — Inserta datos de prueba en la base de datos
// Uso: node src/db/seed.js

require('dotenv').config({ path: '../../.env' });

const { getDb }    = require('./database');
const User         = require('../models/User');
const TucBalance   = require('../models/TucBalance');
const Transaction  = require('../models/Transaction');

const SEED_USERS = [
  { email: 'estudiante1@uc.cl',  passwordHash: '$2b$10$mock_hash_1', tucNumber: '2024-0001234-7' },
  { email: 'estudiante2@uc.cl',  passwordHash: '$2b$10$mock_hash_2', tucNumber: '2024-0007654-3' },
  { email: 'estudiante3@puc.cl', passwordHash: '$2b$10$mock_hash_3', tucNumber: '2024-0009999-1' },
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

  console.log('Insertando usuarios...');
  const createdUsers = SEED_USERS.map(u => User.create(u));

  console.log('Insertando saldos TUC...');
  SEED_BALANCES.forEach(b => TucBalance.upsert(b.tucNumber, b.balance));

  console.log('Insertando transacciones de prueba...');
  const folios = ['EST-100001', 'EST-100002', 'EST-100003', 'EST-100004'];

  Transaction.create({
    userId:    createdUsers[0].id,
    tucNumber: '2024-0001234-7',
    type:      'recarga',
    amount:    10000,
    folio:     folios[0],
    status:    'approved',
  });
  Transaction.create({
    userId:    createdUsers[0].id,
    tucNumber: '2024-0001234-7',
    type:      'deuda',
    amount:    2350,
    folio:     folios[1],
    status:    'approved',
  });
  Transaction.create({
    userId:    createdUsers[1].id,
    tucNumber: '2024-0007654-3',
    type:      'deuda',
    amount:    2350,
    folio:     folios[2],
    status:    'pending',
  });
  Transaction.create({
    userId:    createdUsers[2].id,
    tucNumber: '2024-0009999-1',
    type:      'recarga',
    amount:    4700,
    folio:     folios[3],
    status:    'approved',
  });

  console.log('✅ Seed completado.');
  console.log('   Usuarios:', createdUsers.length);
  console.log('   Saldos TUC:', SEED_BALANCES.length);
  console.log('   Transacciones:', folios.length);
  process.exit(0);
}

seed();
