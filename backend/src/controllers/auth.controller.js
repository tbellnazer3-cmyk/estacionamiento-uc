const { validationResult } = require('express-validator');
const { validateUCEmail }  = require('../middleware/auth.middleware');
const User                 = require('../models/User');
const TucBalance           = require('../models/TucBalance');

// POST /api/auth/login
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

    const user = User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Credenciales incorrectas.' });
    }

    // TODO (Prompt 6): verificar password con bcrypt
    // Por ahora aceptamos cualquier contraseña no vacía
    if (!password) {
      return res.status(401).json({ success: false, error: 'Credenciales incorrectas.' });
    }

    // TODO (Prompt 6): emitir JWT real con jsonwebtoken
    const token = 'mock-jwt-' + Buffer.from(email).toString('base64') + '-' + Date.now();

    const balance = TucBalance.findByTuc(user.tuc_number);

    res.status(200).json({
      success: true,
      message: 'Login exitoso.',
      data: {
        token,
        user: {
          id:         user.id,
          email:      user.email,
          tuc_number: user.tuc_number,
          balance:    balance ? balance.balance : 0,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { login };
