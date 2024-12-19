const Lesson = require("../models/Lesson");
const Progress = require("../models/Progress");
const User = require("../models/User");

const getUserProgress = async (req, res) => {
  const id = req.params.userId;
  try {
    const user = await User.findById(id);
    if (!user || !user.progressInUser) {
      return res.status(404).json({ message: "İlerleme bulunamadı." });
    }

    const progress = await Progress.findById(user.progressInUser);

    if (!progress) {
      return res.status(404).json({ message: "İlerleme verisi bulunamadı." });
    }
    res.status(200).json({
      overallProgress: progress.overallProgress,
      beginnerProgress: progress.beginnerProgress,
      middleProgress: progress.middleProgress,
      advancedProgress: progress.advancedProgress,
    });
  } catch (error) {
    console.error("Backend error:", error); // Hata mesajını logla
    res.status(500).json({ message: "İlerleme getirilirken bir hata oluştu." });
  }
};

const updateUserProgress = async (req, res) => {
  const userId = req.user.userId;

  try {
    // Kullanıcıyı ders detaylarıyla birlikte al
    const user = await User.findById(userId).populate("lessons.lessonId");
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    const allLessons = await Lesson.find();
    const allCompletedLessons = user.lessons.length;

    // Seviye bazında dersler
    const allBeginnerLessons = await Lesson.find({ lessonLevel: "Beginner" });
    const completedBeginnerLessons = user.lessons.filter(
      (lesson) =>
        lesson.lessonId.lessonLevel === "Beginner" && lesson.isCompleted
    );

    const allMiddleLessons = await Lesson.find({ lessonLevel: "Middle" });
    const completedMiddleLessons = user.lessons.filter(
      (lesson) => lesson.lessonId.lessonLevel === "Middle" && lesson.isCompleted
    );

    const allAdvancedLessons = await Lesson.find({ lessonLevel: "Advanced" });
    const completedAdvancedLessons = user.lessons.filter(
      (lesson) =>
        lesson.lessonId.lessonLevel === "Advanced" && lesson.isCompleted
    );

    // İlerleme hesaplama
    const totalLessons = allLessons.length;

    const overallProgress =
      totalLessons === 0 ? 0 : (allCompletedLessons / totalLessons) * 100;

    const beginnerProgress =
      allBeginnerLessons.length === 0
        ? 0
        : (completedBeginnerLessons.length / allBeginnerLessons.length) * 100;

    const middleProgress =
      allMiddleLessons.length === 0
        ? 0
        : (completedMiddleLessons.length / allMiddleLessons.length) * 100;

    const advancedProgress =
      allAdvancedLessons.length === 0
        ? 0
        : (completedAdvancedLessons.length / allAdvancedLessons.length) * 100;

    // İlgili Progress belgesini güncelle
    const progress = await Progress.findByIdAndUpdate(
      user.progressInUser,
      {
        overallProgress,
        beginnerProgress,
        middleProgress,
        advancedProgress,
      },
      { new: true }
    );

    res.status(200).json({
      message: "İlerleme başarıyla güncellendi.",
      progress,
    });
  } catch (error) {
    console.error("İlerleme güncelleme hatası:", error);
    res
      .status(500)
      .json({ message: "İlerleme güncellenirken bir hata oluştu." });
  }
};

module.exports = { getUserProgress, updateUserProgress };
