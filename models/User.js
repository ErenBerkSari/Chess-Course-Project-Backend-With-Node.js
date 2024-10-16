const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
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
});

module.exports = mongoose.model("User", UserSchema);
