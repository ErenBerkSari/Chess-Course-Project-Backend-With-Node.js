const mongoose = require("mongoose");

const ArticleSchema = new mongoose.Schema({
  articleName: {
    type: String,
    required: true,
  },
  articleDesc: {
    type: String,
  },
  articleImage: {
    type: String,
  },
  articleContent: {
    type: mongoose.Schema.Types.Mixed,
  },
  articleWriter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [false, "Öğretmen ID'si zorunludur"],
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

const Article = mongoose.model("Article", ArticleSchema);
module.exports = Article;
