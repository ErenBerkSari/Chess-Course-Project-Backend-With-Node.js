const express = require("express");
const {
  createCategory,
  deleteCategory,
  getAllCategories,
} = require("../controllers/categoryController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const router = express.Router();

router.post(
  "/addCategory",
  authMiddleware,
  roleMiddleware(["admin"]),
  createCategory
);
router.get("/deleteCategory/:id", deleteCategory);
router.get("/getAllCategories", getAllCategories);

module.exports = router;
