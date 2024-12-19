const express = require("express");
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserLessons,
  enrollInLesson,
  unenrollFromLesson,
  completeLesson,
  lessonIsCompleted,
  getCompletedLessons,
  uploadProfileImage,
  getTopUsers,
} = require("../controllers/userController");
const {
  getUserProgress,
  updateUserProgress,
} = require("../controllers/progressController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/multerMiddleware"); // Yukarıdaki multer ayarları

const router = express.Router();

router.get("/", authMiddleware, roleMiddleware(["admin"]), getAllUsers);

router.get("/top", getTopUsers);

router.get("/userLessons", authMiddleware, getUserLessons);

router.get("/:id", authMiddleware, getUserById);

router.get("/overallProgress/:userId", authMiddleware, getUserProgress);

router.put("/overallProgress/:userId", authMiddleware, updateUserProgress);

router.get("/completedLessons", authMiddleware, getCompletedLessons);

router.get("/:lessonId/lessonIsComplete", authMiddleware, lessonIsCompleted);

router.post(
  "/enroll",
  authMiddleware,
  roleMiddleware(["student"]),
  enrollInLesson
);

router.post(
  "/:lessonId/complete",
  authMiddleware,
  roleMiddleware(["student"]),
  completeLesson
);

router.post(
  "/uploadProfileImage/:userId",
  authMiddleware, // Kullanıcının doğrulamasını kontrol eder
  upload.single("profileImage"), // Resim yükleme işlemini yapar
  uploadProfileImage // Profil resmini günceller
);
router.put("/:id", authMiddleware, roleMiddleware(["admin"]), updateUser);

router.delete("/:id", authMiddleware, roleMiddleware(["admin"]), deleteUser);

router.delete(
  "/unenroll",
  authMiddleware,
  roleMiddleware(["student"]),
  unenrollFromLesson
);

module.exports = router;
