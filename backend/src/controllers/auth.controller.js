const { validationResult } = require('express-validator');
const { validateUCEmail }  = require('../middleware/auth.middleware');

// POST /api/auth/login
// Autentica un estudiante con correo UC y devuelve un token mock.
async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    if (!validateUCEmail(email)) {
      return res.status(422).json({
        success: false,
        error: 'Debes usar un correo institucional @uc.cl o @puc.cl.',
      });
    }

    // TODO (Prompt 6): verificar contraseña con bcrypt y emitir JWT real
    // Por ahora aceptamos cualquier contraseña no vacía
    if (!password || password.length < 1) {
      return res.status(401).json({ success: false, error: 'Contraseña incorrecta.' });
    }

    res.status(200).json({
      success: true,
      message: 'Login exitoso (mock).',
      data: {
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          email,
          tuc_number: '2024-0001234-7',
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { login };
