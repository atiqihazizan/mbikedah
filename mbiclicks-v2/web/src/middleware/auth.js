import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma.js'

export async function authenticate(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token diperlukan' })
  }

  const token = header.slice(7)
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        role: { include: { permissions: true } },
        department: true,
        position: true,
      },
    })
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Akaun tidak aktif' })
    }
    req.user = user
    next()
  } catch {
    return res.status(401).json({ message: 'Token tidak sah atau telah tamat' })
  }
}

export function authorize(module, action = 'canView') {
  return (req, res, next) => {
    const permissions = req.user?.role?.permissions ?? []
    const perm = permissions.find((p) => p.module === module)
    if (!perm?.[action]) {
      return res.status(403).json({ message: 'Akses tidak dibenarkan' })
    }
    next()
  }
}

export function requireRole(...slugs) {
  return (req, res, next) => {
    if (!slugs.includes(req.user?.role?.slug)) {
      return res.status(403).json({ message: 'Peranan tidak mencukupi' })
    }
    next()
  }
}
