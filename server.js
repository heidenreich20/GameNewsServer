const Joi = require("joi");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(express.json());

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

app.get("/news", async (req, res) => {
  NewsModel.find({}, (err, result) => {
    if (err) {
      res.send(err);
    }
    res.send(result);
  }).sort({ createdAt: -1 });
});

app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});

dbConnect();
