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

const updateUserProgress = async (req, res) => {
  const userId = req.user.userId;
  try {
    const user = await User.findById(userId).populate("lessons.lessonId");
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }
    if (user.lessons.length === 0) {
      return res
        .status(204)
        .json({ message: "Kullanıcının kayıtlı dersi bulunmamaktadır." });
    }
    const completedLessons = user.lessons.filter(
      (lesson) => lesson.isCompleted
    ).length;
    const totalLessons = user.lessons.length;

    const progressPercentage =
      totalLessons === 0 ? 0 : (completedLessons / totalLessons) * 100;
    const progress = await Progress.findByIdAndUpdate(
      user.progressInUser,
      { overallProgress: progressPercentage },
      { new: true }
    );

    res
      .status(200)
      .json({ message: "İlerleme başarıyla güncellendi.", progress });
  } catch (error) {
    res
      .status(500)
      .json({ message: "İlerleme güncellenirken bir hata oluştu." });
  }
};
module.exports = { getUserProgress, updateUserProgress };
