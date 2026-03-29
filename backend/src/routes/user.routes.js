const { Router }              = require('express');
const { getDashboard, getHistory } = require('../controllers/user.controller');
const { requireAuth }         = require('../middleware/auth.middleware');

const router = Router();

// GET /api/user/dashboard — saldo + deuda + últimas transacciones
router.get('/dashboard', requireAuth, getDashboard);

// GET /api/user/history?page=1&pageSize=10 — historial completo paginado
router.get('/history', requireAuth, getHistory);

module.exports = router;
