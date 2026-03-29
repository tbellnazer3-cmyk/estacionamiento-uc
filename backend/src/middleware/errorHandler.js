// Middleware centralizado de manejo de errores

function errorHandler(err, req, res, _next) {
  const status  = err.status  || 500;
  const message = err.message || 'Error interno del servidor.';

  if (process.env.NODE_ENV !== 'production') {
    console.error(`[ERROR] ${req.method} ${req.path} → ${status}: ${message}`);
  }

  res.status(status).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
