import prisma from '../lib/prisma.js'

export async function logActivity({ userId, userName, action, module, targetId, detail, req }) {
  try {
    const ipAddress = req?.ip ?? req?.headers?.['x-forwarded-for'] ?? null
    await prisma.activityLog.create({
      data: {
        userId:    userId ?? null,
        userName:  userName ?? null,
        action,
        module,
        targetId:  targetId ?? null,
        detail:    detail ?? null,
        ipAddress: typeof ipAddress === 'string' ? ipAddress.split(',')[0].trim() : null,
      },
    })
  } catch {}
}
