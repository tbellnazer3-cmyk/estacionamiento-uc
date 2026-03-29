const { verifyToken } = require('../services/auth.service');

const UC_EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@(uc\.cl|puc\.cl)$/i;

// Verifica el JWT en el header Authorization: Bearer <token>
// Adjunta req.user con el payload decodificado.
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Token de autenticación requerido.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError'
      ? 'Sesión expirada. Inicia sesión nuevamente.'
      : 'Token inválido.';
    return res.status(401).json({ success: false, error: msg });
  }
}

function validateUCEmail(email) {
  return UC_EMAIL_REGEX.test(email);
}

module.exports = { requireAuth, validateUCEmail };
