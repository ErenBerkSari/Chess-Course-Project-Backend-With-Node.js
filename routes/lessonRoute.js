const express = require("express");
const router = express.Router();
const {
  getAllLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
} = require("../controllers/lessonController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
router.get("/", authMiddleware, getAllLessons);

router.get("/:lessonId", authMiddleware, getLessonById);

router.post("/", authMiddleware, createLesson);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin", "teacher"]),
  updateLesson
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin", "teacher"]),
  deleteLesson
);

module.exports = router;
