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

// Elimina un negocio y, en cascada, sus usuarios y todas sus citas.
// Es irreversible, así que se exige confirmar el nombre exacto y se impide
// borrar el negocio propio (evita que un admin se deje sin acceso).
async function deleteBusiness(req, res) {
  const { id } = req.params;
  const { confirmName } = req.body;

  const business = await prisma.business.findUnique({
    where: { id },
    include: { _count: { select: { users: true, appointments: true } } },
  });

  if (!business) {
    return res.status(404).json({ error: 'Negocio no encontrado' });
  }

  if (business.id === req.user.businessId) {
    return res.status(400).json({ error: 'No puedes eliminar tu propio negocio' });
  }

  if (typeof confirmName !== 'string' || confirmName.trim() !== business.name) {
    return res.status(400).json({
      error: 'El nombre de confirmación no coincide con el del negocio',
    });
  }

  await prisma.business.delete({ where: { id: business.id } });

  console.warn(
    `[admin] Negocio eliminado: "${business.name}" (${business.id}) ` +
      `— ${business._count.users} usuario(s), ${business._count.appointments} cita(s) — ` +
      `por el usuario ${req.user.id}`
  );

  res.json({
    deleted: {
      id: business.id,
      name: business.name,
      users: business._count.users,
      appointments: business._count.appointments,
    },
  });
}

module.exports = { listBusinesses, deleteBusiness };
