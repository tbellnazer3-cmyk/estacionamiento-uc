require('dotenv').config({ path: '../.env' });

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');

const paymentRoutes = require('./routes/payment.routes');
const tucRoutes     = require('./routes/tuc.routes');
const authRoutes    = require('./routes/auth.routes');
const errorHandler  = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware global ────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST'],
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // necesario para el return de Webpay

// ─── Rutas ────────────────────────────────────────────────────────────────────
app.use('/api/payment', paymentRoutes);
app.use('/api/tuc',     tucRoutes);
app.use('/api/auth',    authRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', project: 'EstacionaUC', version: '1.0.0' });
});

// ─── Error handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`EstacionaUC backend corriendo en http://localhost:${PORT}`);
});
