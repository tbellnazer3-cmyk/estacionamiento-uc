const { Router } = require('express');
const { body }   = require('express-validator');
const { pagarDeuda, recargarSaldo } = require('../controllers/payment.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = Router();

const emailValidation = body('email')
  .trim()
  .notEmpty().withMessage('El correo es obligatorio.')
  .matches(/^[a-zA-Z0-9._%+\-]+@(uc\.cl|puc\.cl)$/i)
  .withMessage('Debes usar un correo @uc.cl o @puc.cl.');

const tucValidation = body('tuc_number')
  .trim()
  .notEmpty().withMessage('El número de TUC es obligatorio.')
  .matches(/^\d{4}-\d{7}-\d$/)
  .withMessage('Formato de TUC inválido. Esperado: YYYY-NNNNNNN-D');

// POST /api/payment/deuda — pagar deuda pendiente ($2.350)
router.post(
  '/deuda',
  requireAuth,
  [emailValidation, tucValidation],
  pagarDeuda
);

// POST /api/payment/recharge — recargar saldo TUC
router.post(
  '/recharge',
  requireAuth,
  [
    emailValidation,
    tucValidation,
    body('amount')
      .isInt({ min: 2350 })
      .withMessage('El monto mínimo de recarga es $2.350.'),
  ],
  recargarSaldo
);

module.exports = router;
