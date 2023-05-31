const Joi = require("joi");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(express.json());

const corsOptions = {
  origin: "https://game-news-liard.vercel.app",
};

app.use(cors(corsOptions));

app.post("/addNew", async (req, res) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    text: Joi.string().required(),
    image: Joi.string().uri().required(),
    category: Joi.string().required(),
    author: Joi.string().required(),
    type: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  try {
    const newsArticle = new NewsModel(req.body);
    await newsArticle.save();
    res.send("Upload successful...");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

const NewsModel = require("./Models/News");

app.use(express.json());
app.use(cors());
mongoose.set("strictQuery", true);

const dbConnect = () => {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
  });

  mongoose.connection.on("connected", () => {
    console.log("Connected to the database");
  });
};

app.get("/news", cors(), async (req, res) => {
  const limit = parseInt(req.query.limit);
  let category = req.query.category;

  if (isNaN(limit) || limit <= 0) {
    return res.status(400).json({ error: "Invalid limit parameter" });
  }

  try {
    let categoryExists = true;
    let error = null;

    if (category) {
      // Perform fuzzy matching for category
      category = new RegExp(category, "i");

      // Check if the category exists in the database
      const categoryCount = await NewsModel.countDocuments({ category }).exec();
      categoryExists = categoryCount > 0;

      if (!categoryExists) {
        error = "Category does not exist";
      }
    }

    const totalNewsCount = await NewsModel.countDocuments({}).exec();
    const query = categoryExists ? { category } : {};
    const newsList = await NewsModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({ newsList, totalNewsCount, error });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});

dbConnect();
