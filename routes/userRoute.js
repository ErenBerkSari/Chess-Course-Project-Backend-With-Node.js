const express = require("express");
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserLessons,
  enrollInLesson,
  unenrollFromLesson,
} = require("../controllers/userController");
const { getUserProgress } = require("../controllers/progressController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

// Tüm kullanıcıları getir
router.get("/", getAllUsers);

// Kullanıcının tüm derslerini getir
router.get("/userLessons", getUserLessons);

// ID ile kullanıcı getir
router.get("/:id", getUserById);

// ID ile kullanıcı getir
router.get("/overallProgress", getUserProgress);

// Kullanıcıyı derse kaydet
router.post("/enroll", enrollInLesson);

// Kullanıcıyı güncelle
router.put("/:id", authMiddleware, roleMiddleware(["admin"]), updateUser);

// Kullanıcıyı sil
router.delete("/:id", authMiddleware, roleMiddleware(["admin"]), deleteUser);

// Kullanıcıyı derse kaydet
router.delete("/unenroll", unenrollFromLesson);
module.exports = router;
