const express = require("express");
const router = express.Router();
const {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
} = require("../controllers/articleController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
router.get("/", getAllArticles);

router.get("/:articleId", authMiddleware, getArticleById);

router.post("/", authMiddleware, createArticle);

router.put(
  "/:articleId",
  authMiddleware,
  roleMiddleware(["admin", "teacher"]),
  updateArticle
);

router.delete(
  "/:articleId",
  authMiddleware,
  roleMiddleware(["admin", "teacher"]),
  deleteArticle
);

module.exports = router;
