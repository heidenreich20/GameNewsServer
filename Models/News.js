const mongoose = require("mongoose");

const NewsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "title required"],
    },

    text: {
      type: String,
      required: [true, "text required"],
    },

    image: {
      type: String,
      required: [true, "image required"],
    },
    category: {
      type: String,
      required: [true, "category required"],
    },

    author: {
      type: String,
      required: [true, "author required"],
    },
    console: {
      type: Array,
    },
    type: {
      type: String,
      required: [true, "type required"],
    },
  },
  { timestamps: true }
);

const News = mongoose.model("News", NewsSchema);
module.exports = News;
