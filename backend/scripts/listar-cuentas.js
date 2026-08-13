// Lista los negocios y usuarios registrados.
//
//   npm run cuentas                      -> usa la BD del .env (local)
//   DATABASE_URL="postgres://..." npm run cuentas   -> otra BD (p.ej. producción)
//
// No muestra contraseñas: están hasheadas con bcrypt y no son recuperables.

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function hostDe(url) {
  try {
    return new URL(url).host;
  } catch {
    return '(desconocido)';
  }
}

(async () => {
  console.log(`Base de datos: ${hostDe(process.env.DATABASE_URL)}\n`);

  const businesses = await prisma.business.findMany({
    include: {
      users: { orderBy: { createdAt: 'asc' } },
      _count: { select: { appointments: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  if (businesses.length === 0) {
    console.log('No hay ningún negocio registrado.');
    return;
  }

  console.log(`${businesses.length} negocio(s) registrado(s):\n`);

  for (const business of businesses) {
    const fecha = business.createdAt.toISOString().slice(0, 10);
    console.log(`▸ ${business.name}`);
    console.log(`    email del negocio : ${business.email}`);
    console.log(`    alta              : ${fecha}`);
    console.log(`    citas             : ${business._count.appointments}`);
    for (const user of business.users) {
      console.log(`    acceso            : ${user.email}  (${user.name})`);
    }
    console.log('');
  }
})()
  .catch((err) => {
    console.error('Error al consultar la base de datos:', err.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
