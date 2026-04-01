const NewsModel = require("../Models/News");
const Joi = require("joi");

const newsSchema = Joi.object({
  title: Joi.string().required(),
  text: Joi.string().required(),
  image: Joi.string().uri().required(),
  category: Joi.string().required(),
  author: Joi.string().required(),
  type: Joi.string().required(),
  console: Joi.array().items(Joi.string()).optional()
});

exports.createNews = async (req, res) => {
  const { error } = newsSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const newsArticle = new NewsModel(req.body);
    await newsArticle.save();
    res.status(201).json({ message: "Upload successful", article: newsArticle });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getNews = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const [totalNewsCount, newsList] = await Promise.all([
      NewsModel.countDocuments({}).exec(),
      NewsModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).exec()
    ]);

    res.json({
      newsList,
      totalNewsCount,
      currentPage: page,
      totalPages: Math.ceil(totalNewsCount / limit),
      hasNextPage: page * limit < totalNewsCount
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getNewsByCategory = async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  let { category } = req.query;

  try {
    const query = category ? { category: new RegExp(category, "i") } : {};
    const [totalNewsCount, categoryCount, newsList] = await Promise.all([
      NewsModel.countDocuments({}).exec(),
      category ? NewsModel.countDocuments(query).exec() : 0,
      NewsModel.find(query).sort({ createdAt: -1 }).limit(limit).exec()
    ]);

    res.json({
      newsList,
      categoryCount,
      totalNewsCount,
      error: (category && categoryCount === 0) ? "Category does not exist" : null
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getNewsById = async (req, res) => {
  try {
    const article = await NewsModel.findById(req.params.id).exec();
    if (!article) return res.status(404).json({ error: "Article not found" });
    res.json({ article });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};