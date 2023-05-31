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
  let newsQuery = NewsModel.find().sort({ createdAt: -1 });

  if (isNaN(limit) || limit <= 0) {
    newsQuery = newsQuery.limit();
  } else {
    newsQuery = newsQuery.limit(limit);
  }

  // Get the selected category from the request query parameter
  const category = req.query.category;

  if (category) {
    newsQuery = newsQuery.where('category').equals(category);
  }
  
  try {
    let totalNewsCount;
    let newsList;

    if (category) {
      // Count the total number of news with the specified category
      totalNewsCount = await NewsModel.countDocuments({ category }).exec();
      
      // Retrieve the news list with the specified category
      newsList = await newsQuery.exec();
    } else {
      // Count the total number of all news
      totalNewsCount = await NewsModel.countDocuments({}).exec();

      // Retrieve all news
      newsList = await NewsModel.find().sort({ createdAt: -1 }).exec();
    }
    
    res.status(200).json({ newsList, totalNewsCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});



app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});

dbConnect();
