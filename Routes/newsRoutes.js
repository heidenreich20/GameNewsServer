const express = require("express");
const router = express.Router();
const newsController = require("../Controllers/newsController");
const validateNews = require("../Middleware/validateNews");

router.post("/", validateNews, newsController.createNews);
router.get("/", newsController.getNews);
router.get("/category", newsController.getNewsByCategory);
router.get("/:id", newsController.getNewsById);

module.exports = router;