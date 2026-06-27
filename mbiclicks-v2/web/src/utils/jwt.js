import jwt from 'jsonwebtoken'

export function signAccess(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES ?? '15m',
  })
}

export function signRefresh(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES ?? '7d',
  })
}

export function verifyRefresh(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET)
}

export function verifyAccess(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET)
}

// Token khas untuk calendar feed — tahan 1 tahun
export function signCalendarFeed(userId) {
  return jwt.sign({ sub: userId, type: 'cal' }, process.env.JWT_ACCESS_SECRET, { expiresIn: '365d' })
}

export function verifyCalendarFeed(token) {
  const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
  if (payload.type !== 'cal') throw new Error('Bukan token kalendar')
  return payload
}
