const { Router } = require('express');
const { getTucBalance } = require('../controllers/tuc.controller');
const { requireAuth }   = require('../middleware/auth.middleware');

const router = Router();

// GET /api/tuc/:tucNumber — consultar saldo de una TUC
router.get('/:tucNumber', requireAuth, getTucBalance);

module.exports = router;
