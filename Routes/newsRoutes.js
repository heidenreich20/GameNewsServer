const express        = require('express')
const router         = express.Router()
const rateLimit      = require('express-rate-limit')
const newsController = require('../Controllers/newsController')
const validateNews   = require('../Middleware/validateNews')
const auth           = require('../Middleware/auth')

const readLimiter = rateLimit({
  windowMs: 60_000,
  max:      100,
  message:  { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders:   false,
})

const writeLimiter = rateLimit({
  windowMs: 60_000,
  max:      10,
  message:  { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders:   false,
})

router.post('/',         writeLimiter, auth, validateNews, newsController.createNews)
router.get('/',          readLimiter,  newsController.getNews)
router.get('/category',  readLimiter,  newsController.getNewsByCategory)
router.get('/:id',       readLimiter,  newsController.getNewsById)

module.exports = router