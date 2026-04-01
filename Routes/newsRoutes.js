const express        = require('express')
const router         = express.Router()
const newsController = require('../Controllers/newsController')
const validateNews   = require('../Middleware/validateNews')
const auth           = require('../Middleware/auth')

// Write — protected
router.post('/', auth, validateNews, newsController.createNews)

// Read — public
router.get('/',          newsController.getNews)
router.get('/category',  newsController.getNewsByCategory)
router.get('/:id',       newsController.getNewsById)

module.exports = router