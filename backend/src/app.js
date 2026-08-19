const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authMiddleware = require('./middleware/auth');
const { generalLimiter } = require('./middleware/rateLimit');
const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointments');
const adminRoutes = require('./routes/admin');

const app = express();

// Railway/Vercel están detrás de un proxy: sin esto, express-rate-limit vería
// siempre la IP del proxy en vez de la del cliente real.
app.set('trust proxy', 1);

// Cabeceras de seguridad estándar (X-Frame-Options, X-Content-Type-Options,
// desactiva X-Powered-By, etc.). La API solo devuelve JSON, así que la
// Content-Security-Policy por defecto de helmet no afecta a nada aquí.
app.use(helmet());

// Orígenes desde los que se permite llamar a la API. El de producción va
// fijo porque ya lo conocemos; CORS_ORIGIN (coma-separado) permite añadir
// más (previews de Vercel, otro dominio, etc.) sin tocar código.
const defaultOrigins = ['https://peluqueria-app-blush.vercel.app', 'http://localhost:5173'];
const extraOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([...defaultOrigins, ...extraOrigins])];

app.use(
  cors({
    origin: allowedOrigins,
  })
);

app.use(express.json({ limit: '100kb' }));

app.use(generalLimiter);

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/auth', authRoutes);
app.use('/appointments', authMiddleware, appointmentRoutes);
app.use('/admin', authMiddleware, adminRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
