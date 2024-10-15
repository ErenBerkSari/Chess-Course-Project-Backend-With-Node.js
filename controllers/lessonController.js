const Lesson = require("../models/Lesson");

const getAllLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find().populate(
      "lessonTeacher",
      "username email"
    );
    res.status(200).json(lessons);
  } catch (error) {
    res.status(500).json({ message: "Dersler yüklenirken bir hata oluştu." });
  }
};

const getLessonById = async (req, res) => {
  const { id } = req.params;
  try {
    const lesson = await Lesson.findById(id).populate(
      "lessonTeacher",
      "username email"
    );
    if (!lesson) {
      return res.status(404).json({ message: "Ders bulunamadı." });
    }
    res.status(200).json(lesson);
  } catch (error) {
    res.status(500).json({ message: "Ders getirilirken bir hata oluştu." });
  }
};

const createLesson = async (req, res) => {
  const {
    lessonName,
    lessonDesc,
    lessonImage,
    lessonLevel,
    lessonTeacher,
    lessonContent,
  } = req.body;
  if (!lessonName || !lessonTeacher) {
    return res
      .status(400)
      .json({ message: "Ders adı ve öğretmen zorunludur." });
  }
  try {
    const newLesson = new Lesson({
      lessonName,
      lessonDesc,
      lessonImage,
      lessonLevel,
      lessonTeacher,
      lessonContent,
    });
    await newLesson.save();
    res.status(201).json(newLesson);
  } catch (error) {
    res.status(500).json({ message: "Ders oluşturulurken bir hata oluştu." });
  }
};

const updateLesson = async (req, res) => {
  const { id } = req.params;
  const {
    lessonName,
    lessonDesc,
    lessonImage,
    lessonLevel,
    lessonIsCompleted,
    lessonContent,
  } = req.body;
  try {
    const updatedLesson = await Lesson.findByIdAndUpdate(
      id,
      {
        lessonName,
        lessonDesc,
        lessonImage,
        lessonLevel,
        lessonIsCompleted,
        lessonContent,
      },
      { new: true } // Güncel dökümanı döndür
    );
    if (!updatedLesson) {
      return res.status(404).json({ message: "Ders bulunamadı." });
    }

    res.status(200).json(updatedLesson);
  } catch (error) {
    res.status(500).json({ message: "Ders güncellenirken bir hata oluştu." });
  }
};

const deleteLesson = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedLesson = await Lesson.findByIdAndDelete(id);

    if (!deletedLesson) {
      return res.status(404).json({ message: "Ders bulunamadı." });
    }

    res.status(200).json({ message: "Ders başarıyla silindi." });
  } catch (error) {
    res.status(500).json({ message: "Ders silinirken bir hata oluştu." });
  }
};

module.exports = {
  getAllLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
};
