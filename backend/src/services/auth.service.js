const jwt    = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET  = process.env.JWT_SECRET || 'dev_secret_cambiar_en_produccion';
const JWT_EXPIRES = '24h';
const SALT_ROUNDS = 10;

function hashPassword(password) {
  return bcrypt.hashSync(password, SALT_ROUNDS);
}

function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

// Genera un JWT con el payload dado; expira en 24h.
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

// Verifica y decodifica el token. Lanza error si es inválido o expirado.
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { hashPassword, comparePassword, generateToken, verifyToken };
