import axios from 'axios'

const ac = axios.create({
  baseURL: process.env.AUTOCOUNT_API_URL,
  headers: {
    ...(process.env.AUTOCOUNT_API_KEY && {
      'X-API-Key': process.env.AUTOCOUNT_API_KEY,
    }),
  },
  timeout: 10_000,
})

export async function acGet(path, params = {}) {
  const res = await ac.get(path, { params })
  return res.data
}

export default ac
