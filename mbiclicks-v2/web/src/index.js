import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import path from 'path'
import { fileURLToPath } from 'url'
import { errorHandler } from './middleware/errorHandler.js'
import routes from './routes/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT ?? 4000
const PUBLIC_DIR = path.join(__dirname, '..', 'public')

app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*' }))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// API routes — mesti sebelum static serving
app.use('/api', routes)
app.get('/health', (_, res) => res.json({ status: 'ok', ts: new Date() }))

// Serve Next.js static export dari public/
app.use(express.static(PUBLIC_DIR))

// SPA fallback — semua route yang tak match → index.html
app.get('/*path', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'))
})

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`)
})
