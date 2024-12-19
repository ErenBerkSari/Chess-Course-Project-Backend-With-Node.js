const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  profileImage: {
    type: String,
    default: "",
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  role: {
    type: String,
    enum: ["student", "teacher", "admin"],
    default: "student",
  },
  progressInUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Progress",
  },
  userLevel: {
    type: String,
    default: "Beginner",
  },
  lessons: [
    {
      lessonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
      },
      isCompleted: {
        type: Boolean,
        default: false,
      },
    },
  ],
  articles: [
    {
      articleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Article",
      },
    },
  ],
});
module.exports = mongoose.model("User", UserSchema);
