const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const newsRoutes = require("./Routes/newsRoutes");

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cors({
  origin: ["https://game-news-liard.vercel.app", "https://next-game-news.vercel.app", "http://localhost:3000"]
}));

app.use("/news", newsRoutes);

mongoose.set("strictQuery", true);

if (require.main === module) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log("Connected to database");
      app.listen(process.env.PORT || 3000, () => {
        console.log("Server running...");
      });
    })
    .catch(err => console.error(err));
}

module.exports = app;