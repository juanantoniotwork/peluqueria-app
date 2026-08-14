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

function isAdminEmail(email) {
  if (!email) return false;
  return adminEmails().includes(email.trim().toLowerCase());
}

// Cuántos administradores hay configurados. Se usa solo para diagnóstico:
// nunca se exponen los emails concretos.
function adminCount() {
  return adminEmails().length;
}

async function adminMiddleware(req, res, next) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { email: true },
  });

  if (!user || !isAdminEmail(user.email)) {
    return res.status(403).json({ error: 'Acceso no autorizado' });
  }

  next();
}

module.exports = adminMiddleware;
module.exports.isAdminEmail = isAdminEmail;
module.exports.adminCount = adminCount;
