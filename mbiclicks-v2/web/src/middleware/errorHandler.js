import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'

export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(422).json({
      message: 'Data tidak sah',
      errors: err.flatten().fieldErrors,
    })
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({ message: 'Rekod sudah wujud (duplikasi)' })
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Rekod tidak dijumpai' })
    }
  }

  console.error(err)
  res.status(err.status ?? 500).json({
    message: err.message ?? 'Ralat pelayan',
  })
}
