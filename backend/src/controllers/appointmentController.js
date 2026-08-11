const { z } = require('zod');
const prisma = require('../lib/prisma');
const { parseDateOnly, formatDate } = require('../utils/dateUtils');

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const createSchema = z.object({
  clientName: z.string().min(1),
  date: z.string().regex(DATE_REGEX, 'Formato de fecha inválido (YYYY-MM-DD)'),
  time: z.string().min(1),
});

const updateSchema = createSchema.partial();

function serialize(appointment) {
  return {
    id: appointment.id,
    clientName: appointment.clientName,
    date: formatDate(appointment.date),
    time: appointment.time,
  };
}

async function list(req, res) {
  const { date, from, to } = req.query;
  const where = { businessId: req.user.businessId };

  if (date) {
    if (!DATE_REGEX.test(date)) {
      return res.status(400).json({ error: 'Formato de fecha inválido (YYYY-MM-DD)' });
    }
    where.date = parseDateOnly(date);
  } else if (from || to) {
    where.date = {};
    if (from) where.date.gte = parseDateOnly(from);
    if (to) where.date.lte = parseDateOnly(to);
  }

  const appointments = await prisma.appointment.findMany({
    where,
    orderBy: [{ date: 'asc' }, { time: 'asc' }],
  });

  res.json(appointments.map(serialize));
}

async function create(req, res) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten() });
  }

  const { clientName, date, time } = parsed.data;

  const appointment = await prisma.appointment.create({
    data: {
      clientName,
      date: parseDateOnly(date),
      time,
      businessId: req.user.businessId,
    },
  });

  res.status(201).json(serialize(appointment));
}

async function update(req, res) {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten() });
  }

  const existing = await prisma.appointment.findFirst({
    where: { id: req.params.id, businessId: req.user.businessId },
  });
  if (!existing) {
    return res.status(404).json({ error: 'Cita no encontrada' });
  }

  const data = parsed.data;

  const appointment = await prisma.appointment.update({
    where: { id: existing.id },
    data: {
      clientName: data.clientName,
      date: data.date ? parseDateOnly(data.date) : undefined,
      time: data.time,
    },
  });

  res.json(serialize(appointment));
}

async function remove(req, res) {
  const existing = await prisma.appointment.findFirst({
    where: { id: req.params.id, businessId: req.user.businessId },
  });
  if (!existing) {
    return res.status(404).json({ error: 'Cita no encontrada' });
  }

  await prisma.appointment.delete({ where: { id: existing.id } });
  res.status(204).send();
}

module.exports = { list, create, update, remove };
