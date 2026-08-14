const rateLimit = require('express-rate-limit');

// Limita los intentos de login por IP para dificultar la fuerza bruta contra
// contraseñas. No distingue por email: da igual qué cuenta se esté probando.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Inténtalo de nuevo en unos minutos.' },
});

module.exports = { loginLimiter };
