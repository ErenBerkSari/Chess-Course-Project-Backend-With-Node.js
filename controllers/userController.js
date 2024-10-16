const User = require("../models/User");
const bcrypt = require("bcrypt");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, password, role } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }
    if (username) user.username = username;
    if (email) user.email = email;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }
    if (role) user.role = role;

    await user.save();
    res.status(200).json({ message: "Kullanıcı güncellendi", user });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    res.status(200).json({ message: "Kullanıcı silindi", user });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

const getUserLessons = async (req, res) => {
  try {
    const userId = req.user.userId || req.params.userId;

    const user = await User.findById(userId).populate("lessons");

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    if (!user.lessons || user.lessons.length === 0) {
      return res.status(204).json({ message: "Kayıtlı ders bulunmuyor." });
    }

    // Kullanıcının derslerini döndür
    return res.status(200).json({ lessons: user.lessons });
  } catch (error) {
    return res.status(500).json({ message: "Sunucu hatası", error });
  }
};

const enrollInLesson = async (req, res) => {
  const { lessonId } = req.body;
  const userId = req.user.userId;

  try {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Ders bulunamadı." });
    }

    const user = await User.findById(userId);
    if (user.lessons.includes(lessonId)) {
      return res.status(400).json({ message: "Zaten bu derse kayıtlısınız." });
    }

    user.lessons.push(lessonId);
    await user.save();

    res.status(200).json({ message: "Derse başarıyla kayıt oldunuz.", lesson });
  } catch (error) {
    res.status(500).json({ message: "Derse kayıt olurken bir hata oluştu." });
  }
};
const unenrollFromLesson = async (req, res) => {
  const { lessonId } = req.body;
  const userId = req.user.userId;

  try {
    const user = await User.findById(userId);
    if (!user.lessons.includes(lessonId)) {
      return res.status(400).json({ message: "Bu derse kayıtlı değilsiniz." });
    }

    user.lessons = user.lessons.filter((id) => id.toString() !== lessonId);
    await user.save();

    res.status(200).json({ message: "Ders kaydınız başarıyla silindi." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Ders kaydınızı silerken bir hata oluştu." });
  }
};
module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserLessons,
  enrollInLesson,
  unenrollFromLesson,
};
