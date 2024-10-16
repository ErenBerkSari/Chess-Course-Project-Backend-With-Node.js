const mongoose = require("mongoose");

const LessonSchema = new mongoose.Schema({
  lessonName: {
    type: String,
    required: true,
  },
  lessonDesc: {
    type: String,
  },
  lessonImage: {
    type: String,
  },
  lessonContent: {
    type: mongoose.Schema.Types.Mixed,
  },
  lessonLevel: {
    type: String,
  },
  lessonTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
});

const Lesson = mongoose.model("Lesson", LessonSchema);
module.exports = Lesson;
