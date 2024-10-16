const Progress = require("../models/Progress");
const User = require("../models/User");

const getUserProgress = async (req, res) => {
  const id = req.user.userId;

  try {
    const progress = await User.findById(id).populate(
      "progressInUser",
      "overallProgress"
    );
    if (!progress || !progress.progressInUser) {
      return res.status(404).json({ message: "İlerleme bulunamadı." });
    }
    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: "İlerleme getirilirken bir hata oluştu." });
  }
};
module.exports = { getUserProgress };
