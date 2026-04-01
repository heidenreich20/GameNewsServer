const mongoose = require("mongoose");

const NewsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "title required"],
      trim: true,
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
      index: true,
    },
    author: {
      type: String,
      required: [true, "author required"],
    },
    console: {
      type: [String],
      default: [],
    },
    type: {
      type: String,
      required: [true, "type required"],
    },
  },
  { timestamps: true }
);

NewsSchema.index({ title: "text", text: "text" });

const News = mongoose.model("News", NewsSchema);
module.exports = News;