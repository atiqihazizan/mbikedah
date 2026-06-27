import { z } from 'zod'
import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma.js'
import { signAccess, signRefresh, verifyRefresh } from '../utils/jwt.js'
import { logActivity } from '../utils/activityLog.js'

const staffNoSchema = z.object({ staffNo: z.string().min(1) })

const loginSchema = z.object({
  staffNo: z.string().min(1),
  password: z.string().min(1).optional(),
})

// Step 1 — check staffNo, tentukan sama ada perlu password
export async function checkStaff(req, res, next) {
  try {
    const { staffNo } = staffNoSchema.parse(req.body)

    const user = await prisma.user.findUnique({
      where: { staffNo },
      select: { id: true, isActive: true, role: { select: { slug: true } } },
    })

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'No. staf tidak dijumpai atau tidak aktif' })
    }

    const requirePassword = user.role?.slug === 'admin'
    res.json({ requirePassword })
  } catch (err) {
    next(err)
  }
}

async function issueTokens(user, res, req) {
  const accessToken  = signAccess(user.id)
  const refreshToken = signRefresh(user.id)

  await prisma.refreshToken.create({
    data: {
      userId:    user.id,
      token:     refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } })

  logActivity({ userId: user.id, userName: user.name, action: 'LOGIN', module: 'auth', req })

  const { password: _, ...userSafe } = user
  res.json({ accessToken, refreshToken, user: userSafe })
}

// Step 2 — login sebenar
export async function login(req, res, next) {
  try {
    const { staffNo, password } = loginSchema.parse(req.body)

    const user = await prisma.user.findUnique({
      where: { staffNo },
      include: {
        role: { include: { permissions: true } },
        department: true,
        position:   true,
      },
    })

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'No. staf tidak dijumpai atau tidak aktif' })
    }

    // Admin wajib verify password
    if (user.role?.slug === 'admin') {
      if (!password) {
        return res.status(400).json({ message: 'Kata laluan diperlukan untuk admin' })
      }
      const valid = await bcrypt.compare(password, user.password)
      if (!valid) {
        return res.status(401).json({ message: 'Kata laluan tidak betul' })
      }
    }

    await issueTokens(user, res, req)
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

    const payload    = verifyRefresh(refreshToken)
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

// Tukar kata laluan — pengguna sendiri
export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = z.object({
      currentPassword: z.string().min(1),
      newPassword:     z.string().min(6, 'Kata laluan baru sekurang-kurangnya 6 aksara'),
    }).parse(req.body)

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, password: true },
    })

    const valid = await bcrypt.compare(currentPassword, user.password)
    if (!valid) {
      return res.status(400).json({ message: 'Kata laluan semasa tidak betul' })
    }

    const hashed = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } })

    res.json({ message: 'Kata laluan berjaya dikemaskini' })
  } catch (err) {
    next(err)
  }
}
