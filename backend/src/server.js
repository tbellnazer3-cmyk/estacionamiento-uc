require('dotenv').config({ path: '../.env' });

const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const morgan    = require('morgan');
const rateLimit = require('express-rate-limit');

const paymentRoutes = require('./routes/payment.routes');
const tucRoutes     = require('./routes/tuc.routes');
const authRoutes    = require('./routes/auth.routes');
const userRoutes    = require('./routes/user.routes');
const errorHandler  = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// ─── Rate limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
  max:      Number(process.env.RATE_LIMIT_MAX)        || 100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, error: 'Demasiadas peticiones. Intenta de nuevo en 15 minutos.' },
});

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(o => o.trim())
  : ['http://localhost:5500', 'http://127.0.0.1:5500'];

// ─── Middleware global ────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: (origin, cb) => {
    // Permitir peticiones sin origin (ej. Webpay server-to-server) y orígenes en lista
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origen no permitido — ${origin}`));
  },
  methods: ['GET', 'POST'],
  credentials: true,
}));
app.use(limiter);
app.use(morgan(isProd ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // necesario para el return de Webpay

// ─── Rutas ────────────────────────────────────────────────────────────────────
app.use('/api/payment', paymentRoutes);
app.use('/api/tuc',     tucRoutes);
app.use('/api/auth',    authRoutes);
app.use('/api/user',    userRoutes);

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
