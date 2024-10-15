const express = require("express");
const router = express.Router();
const {
  getAllLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
} = require("../controllers/lessonController");
router.get("/", getAllLessons);

router.get("/:id", getLessonById);

router.post("/", createLesson);

router.put("/:id", updateLesson);

router.delete("/:id", deleteLesson);

module.exports = router;
