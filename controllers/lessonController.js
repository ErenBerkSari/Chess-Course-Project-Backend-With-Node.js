const Lesson = require("../models/Lesson");
const User = require("../models/User");

const getAllLessons = async (req, res) => {
  try {
    const { categoryId, lessonLevel } = req.query;
    let filter = {};

    if (categoryId) {
      filter.category = categoryId;
    }

    if (lessonLevel) {
      filter.lessonLevel = lessonLevel;
    }

    const lessons = await Lesson.find(filter)
      .populate("lessonTeacher", "username email")
      .sort("-createdAt");

    res.status(200).json(lessons);
  } catch (error) {
    res.status(500).json({ message: "Dersler yüklenirken bir hata oluştu." });
  }
};

const getLessonById = async (req, res) => {
  const { lessonId } = req.params;
  console.log("Gelen ID:", lessonId); // ID kontrolü

  try {
    const lesson = await Lesson.findById(lessonId).populate(
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
    lessonTest,
  } = req.body;
  console.log("Gelen Veriler:", req.body); // Gelen verileri logla

  if (!lessonName) {
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
      lessonTest,
    });
    try {
      await newLesson.validate();
    } catch (validationError) {
      console.error("Validasyon Hatası:", validationError.errors);
      return res.status(400).json({
        message: "Validasyon Hatası",
        errors: validationError.errors,
      });
    }
    const savedLesson = await newLesson.save();
    console.log("Kaydedilen Ders:", savedLesson);

    res.status(201).json(newLesson);
  } catch (error) {
    console.error("Ders Oluşturma Hatası:", error);

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
    lessonTest,
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
        lessonTest,
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
