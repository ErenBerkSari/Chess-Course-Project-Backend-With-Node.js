const Article = require("../models/Article");
const User = require("../models/User");

const getAllArticles = async (req, res) => {
  try {
    const { articleWriter } = req.query;

    let filter = {};

    if (articleWriter) {
      filter.articleWriter = articleWriter;
    }

    const articles = await Article.find(filter)
      .populate("articleWriter")
      .sort("-createdAt");

    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ message: "Makaleler yüklenirken bir hata oluştu." });
  }
};

const getArticleById = async (req, res) => {
  const { articleId } = req.params;
  console.log("Gelen ID:", articleId); // ID kontrolü

  try {
    const article = await Article.findById(articleId).populate("articleWriter");
    if (!article) {
      return res.status(404).json({ message: "Makale bulunamadı." });
    }
    res.status(200).json(article);
  } catch (error) {
    res.status(500).json({ message: "Makale getirilirken bir hata oluştu." });
  }
};

const createArticle = async (req, res) => {
  const userId = req.user.userId;
  console.log("article userId:", userId);

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "Kullanıcı bulunamadı." });
  }

  const {
    articleName,
    articleDesc,
    articleImage,
    articleWriter,
    articleContent,
  } = req.body;

  console.log("Gelen Veriler:", req.body); // Gelen verileri logla

  if (!articleName) {
    return res
      .status(400)
      .json({ message: "Makale adı ve öğretmen zorunludur." });
  }

  try {
    const newArticle = new Article({
      articleName,
      articleDesc,
      articleImage,
      articleWriter,
      articleContent,
    });

    try {
      await newArticle.validate();
    } catch (validationError) {
      console.error("Validasyon Hatası:", validationError.errors);
      return res.status(400).json({
        message: "Validasyon Hatası",
        errors: validationError.errors,
      });
    }

    const savedArticle = await newArticle.save();
    const articleId = savedArticle._id;
    console.log("Eklenecek articleId:", articleId);

    user.articles.push({ articleId });
    try {
      await user.save();
      console.log("Makale kullanıcının articles listesine eklendi.");
    } catch (saveError) {
      console.error("Kullanıcıyı kaydederken hata oluştu:", saveError);
      return res.status(500).json({
        message: "Makale oluşturulurken bir hata oluştu.",
        error: error.message,
      });
    }

    console.log("Kaydedilen Makale:", savedArticle);
    res.status(201).json(newArticle);
  } catch (error) {
    console.error("Makale Oluşturma Hatası:", error);
    res.status(500).json({ message: "Makale oluşturulurken bir hata oluştu." });
  }
};

const updateArticle = async (req, res) => {
  const { id } = req.params;
  const { articleName, articleDesc, articleImage, articleContent } = req.body;
  try {
    const updatedArticle = await Article.findByIdAndUpdate(
      id,
      {
        articleName,
        articleDesc,
        articleImage,
        articleContent,
      },
      { new: true } // Güncel dökümanı döndür
    );
    if (!updatedArticle) {
      return res.status(404).json({ message: "Makale bulunamadı." });
    }

    res.status(200).json(updatedArticle);
  } catch (error) {
    res.status(500).json({ message: "Makale güncellenirken bir hata oluştu." });
  }
};

const deleteArticle = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedArticle = await Article.findByIdAndDelete(id);

    if (!deletedArticle) {
      return res.status(404).json({ message: "Makale bulunamadı." });
    }

    res.status(200).json({ message: "Makale başarıyla silindi." });
  } catch (error) {
    res.status(500).json({ message: "Makale silinirken bir hata oluştu." });
  }
};

module.exports = {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  updateArticle,
  deleteArticle,
};
