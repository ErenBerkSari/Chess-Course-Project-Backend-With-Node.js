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
  date: {
    type: Date,
    default: new Date(),
  },
  role: {
    type: String,
    enum: ["student", "teacher", "admin"],
    default: "student",
  },
});

module.exports = mongoose.model("User", UserSchema);
