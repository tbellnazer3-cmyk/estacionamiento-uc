const { Router }             = require('express');
const { body }               = require('express-validator');
const { register, login, verify } = require('../controllers/auth.controller');
const { requireAuth }        = require('../middleware/auth.middleware');

const router = Router();

const emailRule = body('email')
  .trim()
  .notEmpty().withMessage('El correo es obligatorio.')
  .isEmail().withMessage('Formato de correo inválido.');

const passwordRule = body('password')
  .notEmpty().withMessage('La contraseña es obligatoria.')
  .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.');

const tucRule = body('tuc_number')
  .trim()
  .notEmpty().withMessage('El número de TUC es obligatorio.')
  .matches(/^\d{4}-\d{7}-\d$/).withMessage('Formato de TUC inválido. Esperado: YYYY-NNNNNNN-D');

// POST /api/auth/register — crear cuenta con correo UC
router.post('/register', [emailRule, passwordRule, tucRule], register);

// POST /api/auth/login — iniciar sesión, devuelve JWT
router.post('/login', [emailRule, passwordRule], login);

// GET /api/auth/verify — verifica que el token sea válido y devuelve datos del usuario
router.get('/verify', requireAuth, verify);

module.exports = router;
