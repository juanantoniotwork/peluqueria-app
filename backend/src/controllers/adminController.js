const prisma = require('../lib/prisma');

// Devuelve datos a nivel de negocio (nombre, contacto, volumen de uso).
// No expone las citas concretas: esos son los clientes de cada peluquería.
async function listBusinesses(req, res) {
  const businesses = await prisma.business.findMany({
    include: {
      users: {
        select: { id: true, name: true, email: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      },
      _count: { select: { appointments: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const lastAppointments = await prisma.appointment.groupBy({
    by: ['businessId'],
    _max: { createdAt: true },
  });

  const lastActivityByBusiness = new Map(
    lastAppointments.map((row) => [row.businessId, row._max.createdAt])
  );

  res.json(
    businesses.map((business) => ({
      id: business.id,
      name: business.name,
      email: business.email,
      createdAt: business.createdAt,
      appointmentCount: business._count.appointments,
      lastActivityAt: lastActivityByBusiness.get(business.id) || null,
      users: business.users,
    }))
  );
}

module.exports = { listBusinesses };
