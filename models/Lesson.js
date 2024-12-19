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
    enum: ["Beginner", "Middle", "Advanced"], // Bu alan dersin seviyesini tutar
  },
  lessonTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [false, "Öğretmen ID'si zorunludur"],
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  lessonTest: {
    type: [
      {
        question: String,
        options: [String],
        correctAnswer: String,
      },
    ],
    default: [], // Varsayılan olarak boş bir dizi
  },
});

const Lesson = mongoose.model("Lesson", LessonSchema);
module.exports = Lesson;
