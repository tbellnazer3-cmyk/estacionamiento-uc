const { validationResult } = require('express-validator');
const { validateUCEmail }  = require('../middleware/auth.middleware');
const User                 = require('../models/User');
const TucBalance           = require('../models/TucBalance');
const authService          = require('../services/auth.service');

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const { email, password, tuc_number } = req.body;

    if (!validateUCEmail(email)) {
      return res.status(422).json({
        success: false,
        error: 'Debes usar un correo institucional @uc.cl o @puc.cl.',
      });
    }

    if (User.emailExists(email)) {
      return res.status(409).json({ success: false, error: 'Este correo ya está registrado.' });
    }

    if (User.tucExists(tuc_number)) {
      return res.status(409).json({ success: false, error: 'Esta TUC ya está asociada a otra cuenta.' });
    }

    const passwordHash = authService.hashPassword(password);
    const user         = User.create({ email, passwordHash, tucNumber: tuc_number });

    // Crear registro de saldo TUC si no existe
    if (!TucBalance.findByTuc(tuc_number)) {
      TucBalance.upsert(tuc_number, 0);
    }

    const token = authService.generateToken({ id: user.id, email: user.email, tuc_number });

    res.status(201).json({
      success: true,
      message: 'Cuenta creada exitosamente.',
      data: {
        token,
        user: { id: user.id, email: user.email, tuc_number },
      },
    });
  } catch (err) {
    next(err);
  }
}

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
    if (!user || !authService.comparePassword(password, user.password_hash)) {
      return res.status(401).json({ success: false, error: 'Correo o contraseña incorrectos.' });
    }

    const token   = authService.generateToken({ id: user.id, email: user.email, tuc_number: user.tuc_number });
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

// GET /api/auth/verify  (requiere JWT válido en header)
async function verify(req, res, next) {
  try {
    const user    = User.findById(req.user.id);
    const balance = user ? TucBalance.findByTuc(user.tuc_number) : null;

    res.status(200).json({
      success: true,
      data: {
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

module.exports = { register, login, verify };
