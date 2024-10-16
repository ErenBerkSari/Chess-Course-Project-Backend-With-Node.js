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
router.get("/", getAllLessons);

router.get("/:id", getLessonById);

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin", "teacher"]),
  createLesson
);

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
