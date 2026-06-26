import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { signAccess, signRefresh, verifyRefresh } from '../utils/jwt.js'

const loginSchema = z.object({
  staffNo: z.string().min(1),
})

export async function login(req, res, next) {
  try {
    const { staffNo } = loginSchema.parse(req.body)

    const user = await prisma.user.findUnique({
      where: { staffNo },
      include: {
        role: { include: { permissions: true } },
        department: true,
        position: true,
      },
    })

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'No. staf tidak dijumpai' })
    }

    const accessToken = signAccess(user.id)
    const refreshToken = signRefresh(user.id)

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    })

    const { password: _, ...userSafe } = user

    res.json({ accessToken, refreshToken, user: userSafe })
  } catch (err) {
    next(err)
  }
}

export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) return res.status(401).json({ message: 'Token diperlukan' })

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } })
    if (!stored || stored.expiresAt < new Date()) {
      return res.status(401).json({ message: 'Token tamat atau tidak sah' })
    }

    const payload = verifyRefresh(refreshToken)
    const accessToken = signAccess(payload.sub)

    res.json({ accessToken })
  } catch {
    res.status(401).json({ message: 'Token tidak sah' })
  }
}

export async function logout(req, res, next) {
  try {
    const refreshToken = req.body?.refreshToken
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } })
    }
    res.json({ message: 'Berjaya log keluar' })
  } catch (err) {
    next(err)
  }
}

export async function me(req, res) {
  const { password: _, ...userSafe } = req.user
  res.json(userSafe)
}
