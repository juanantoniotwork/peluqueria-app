const prisma = require('../lib/prisma');

// Los administradores de la plataforma se definen por email en la variable de
// entorno ADMIN_EMAILS (separados por comas). Se comprueba contra la base de
// datos en cada petición: el JWT solo dice quién eres, no si eres admin.
function adminEmails() {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

async function adminMiddleware(req, res, next) {
  const allowed = adminEmails();
  if (allowed.length === 0) {
    return res.status(403).json({ error: 'Acceso no autorizado' });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { email: true },
  });

  if (!user || !allowed.includes(user.email.toLowerCase())) {
    return res.status(403).json({ error: 'Acceso no autorizado' });
  }

  next();
}

module.exports = adminMiddleware;
