const express    = require('express')
const mongoose   = require('mongoose')
const cors       = require('cors')
const helmet     = require('helmet')
require('dotenv').config()

const newsRoutes = require('./Routes/newsRoutes')

const app = express()

app.use(helmet())
app.use(cors({
  origin: [
    'https://game-news-liard.vercel.app',
    'https://next-game-news.vercel.app',
    'http://localhost:3000',
  ],
  methods:     ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'x-api-key'],
}))

app.use(express.json({ limit: '1mb' }))

app.use('/news', newsRoutes)

app.get('/health', (_, res) => res.json({ status: 'ok' }))

app.use((_, res) => res.status(404).json({ error: 'Route not found' }))

app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status ?? 500).json({ error: err.message ?? 'Internal server error' })
})

if (require.main === module) {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not defined')
    process.exit(1)
  }

  mongoose.set('strictQuery', true)
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log('Connected to database')
      const port = process.env.PORT || 3000
      app.listen(port, () => console.log(`Server running on port ${port}`))
    })
    .catch(err => {
      console.error('Database connection failed:', err)
      process.exit(1)
    })
}

module.exports = app