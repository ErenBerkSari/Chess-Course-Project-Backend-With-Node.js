const mongoose = require("mongoose");

const ProgressSchema = new mongoose.Schema({
  overallProgress: {
    type: Number,
    required: true,
    default: 0,
  },
});
module.exports = mongoose.model("Progress", ProgressSchema);
