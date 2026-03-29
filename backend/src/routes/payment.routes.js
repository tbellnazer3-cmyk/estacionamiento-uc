const { Router } = require('express');
const { body }   = require('express-validator');
const {
  initPayment,
  returnPayment,
  confirmPayment,
  pagarDeuda,
  recargarSaldo,
} = require('../controllers/payment.controller');
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

// ─── Flujo Webpay Plus ────────────────────────────────────────────────────────

// POST /api/payment/init — inicia transacción Webpay (devuelve URL de redirección)
router.post(
  '/init',
  requireAuth,
  [
    emailValidation,
    tucValidation,
    body('type')
      .isIn(['deuda', 'recarga'])
      .withMessage('El tipo debe ser "deuda" o "recarga".'),
    body('amount')
      .if(body('type').equals('recarga'))
      .isInt({ min: 2350 })
      .withMessage('El monto mínimo de recarga es $2.350.'),
  ],
  initPayment
);

// POST /api/payment/return — Webpay redirige aquí tras el pago (sin auth)
// Acepta tanto GET como POST porque Webpay puede usar cualquiera
router.post('/return', returnPayment);
router.get('/return',  returnPayment);

// POST /api/payment/confirm — consulta estado de una transacción por folio
router.post('/confirm', requireAuth, confirmPayment);

// ─── Rutas legacy (compatibilidad con Prompts anteriores) ─────────────────────
router.post('/deuda',   requireAuth, [emailValidation, tucValidation], pagarDeuda);
router.post('/recharge', requireAuth, [
  emailValidation,
  tucValidation,
  body('amount').isInt({ min: 2350 }).withMessage('El monto mínimo de recarga es $2.350.'),
], recargarSaldo);

module.exports = router;
