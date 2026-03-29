// Middleware de autenticación JWT
// Actualmente devuelve un usuario mock hasta implementar JWT en Prompt 6.

const UC_EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@(uc\.cl|puc\.cl)$/i;

function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Token de autenticación requerido.' });
  }

  const token = authHeader.split(' ')[1];

  // TODO (Prompt 6): verificar JWT real con jsonwebtoken
  // Por ahora aceptamos cualquier token no vacío y adjuntamos un usuario mock
  if (!token) {
    return res.status(401).json({ success: false, error: 'Token inválido.' });
  }

  req.user = {
    id: 1,
    email: 'estudiante@uc.cl',
    tuc_number: '2024-0001234-7',
  };

  next();
}

function validateUCEmail(email) {
  return UC_EMAIL_REGEX.test(email);
}

module.exports = { requireAuth, validateUCEmail };
