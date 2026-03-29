const { Router } = require('express');
const { body }   = require('express-validator');
const { login }  = require('../controllers/auth.controller');

const router = Router();

// POST /api/auth/login — autenticación con correo UC
router.post(
  '/login',
  [
    body('email')
      .trim()
      .notEmpty().withMessage('El correo es obligatorio.')
      .isEmail().withMessage('Formato de correo inválido.'),
    body('password')
      .notEmpty().withMessage('La contraseña es obligatoria.'),
  ],
  login
);

module.exports = router;
