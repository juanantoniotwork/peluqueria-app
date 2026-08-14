const bcrypt = require('bcryptjs');
const { z } = require('zod');
const prisma = require('../lib/prisma');
const { signToken } = require('../utils/jwt');
const { isAdminEmail, adminCount } = require('../middleware/adminAuth');

const registerSchema = z.object({
  businessName: z.string().min(2),
  businessEmail: z.string().email(),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

async function register(req, res) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten() });
  }

  const { businessName, businessEmail, name, email, password } = parsed.data;

  const [existingBusiness, existingUser] = await Promise.all([
    prisma.business.findUnique({ where: { email: businessEmail } }),
    prisma.user.findUnique({ where: { email } }),
  ]);

  if (existingBusiness) {
    return res.status(409).json({ error: 'Ya existe un negocio con ese email' });
  }
  if (existingUser) {
    return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await prisma.$transaction(async (tx) => {
    const business = await tx.business.create({
      data: { name: businessName, email: businessEmail },
    });

    const user = await tx.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        businessId: business.id,
      },
    });

    return { business, user };
  });

  const token = signToken({ userId: result.user.id, businessId: result.business.id });

  return res.status(201).json({
    token,
    user: { id: result.user.id, email: result.user.email, name: result.user.name },
    business: { id: result.business.id, name: result.business.name, email: result.business.email },
  });
}

async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten() });
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { business: true },
  });

  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const token = signToken({ userId: user.id, businessId: user.businessId });

  return res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name },
    business: { id: user.business.id, name: user.business.name, email: user.business.email },
  });
}

// Datos de la sesión actual. Sirve para que el frontend sepa con qué cuenta
// está entrando realmente y si tiene acceso al panel de administración.
// Solo devuelve información del propio usuario autenticado.
async function me(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { business: true },
  });

  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  return res.json({
    user: { id: user.id, email: user.email, name: user.name },
    business: { id: user.business.id, name: user.business.name, email: user.business.email },
    isAdmin: isAdminEmail(user.email),
    adminConfigured: adminCount() > 0,
  });
}

module.exports = { register, login, me };
