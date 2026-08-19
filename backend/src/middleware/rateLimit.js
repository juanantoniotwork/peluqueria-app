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

// Evita registros masivos automatizados (spam de negocios/cuentas nuevas).
// Más generoso que el de login porque aquí no hay "fuerza bruta" posible,
// solo abuso por volumen.
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados registros desde esta conexión. Inténtalo más tarde.' },
});

// Límite general de respaldo para toda la API: no protege de nada específico,
// pero pone techo a un cliente descontrolado o a scraping básico.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones. Inténtalo de nuevo en unos minutos.' },
});

module.exports = { loginLimiter, registerLimiter, generalLimiter };
