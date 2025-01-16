const User = require("../models/User");
const Progress = require("../models/Progress");
const { updateUserProgress } = require("../controllers/progressController");
const bcrypt = require("bcrypt");
const Lesson = require("../models/Lesson");
const path = require("path");
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
};
const getTopUsers = async (req, res) => {
  try {
    // Kullanıcıları ve progressInUser'ı populate ediyoruz, password'ü hariç tutuyoruz
    const users = await User.find()
      .select("-password")
      .populate("progressInUser");

    // Kullanıcıları genel ilerlemeye göre azalan sırayla sıralıyoruz
    const sortedUsers = users.sort(
      (a, b) =>
        (b.progressInUser?.overallProgress || 0) -
        (a.progressInUser?.overallProgress || 0)
    );

    // İlk 5 kullanıcıyı alıyoruz
    const topUsers = sortedUsers.slice(0, 5);

    // İlk 5 kullanıcıyı geri gönderiyoruz
    res.status(200).json(topUsers);
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

const completeLesson = async (req, res) => {
  const userId = req.user.userId;
  console.log("back userId:", userId);
  const { lessonId } = req.params;
  console.log("back lessonId:", lessonId);

  try {
    const user = await User.findById(userId);
    user.lessons.push({ lessonId, isCompleted: true });
    await user.save();
    await updateUserProgress(userId);

    res.status(200).json({ message: "Ders başarıyla tamamlandı." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Ders tamamlama sırasında bir hata oluştu." });
  }
};

const lessonIsCompleted = async (req, res) => {
  const userId = req.user.userId;
  console.log("back userId:", userId);
  const { lessonId } = req.params;
  console.log("back lessonId:", lessonId);
  try {
    const user = await User.findById(userId);

    const isCompleted = user.lessons.some(
      (lesson) => lesson.lessonId.toString() === lessonId && lesson.isCompleted
    );

    res.status(200).json({ isCompleted }); // Boolean değeri döndür
  } catch (error) {
    console.error("Lesson completion check error:", error);
    res.status(500).json({
      message: "Lesson completion status could not be verified",
      error: error.message,
    });
  }
};

const getCompletedLessons = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Kullanıcıyı bul ve tamamlanmış dersleri çek
    const user = await User.findById(userId).populate({
      path: "lessons.lessonId",
      match: { "lessons.isCompleted": true },
    });

    const completedLessons = user.lessons
      .filter((lesson) => lesson.isCompleted)
      .map((lesson) => lesson.lessonId);

    res.status(200).json({
      completedLessons,
      totalCompletedLessons: completedLessons.length,
    });
  } catch (error) {
    console.error("Tamamlanmış dersler getirme hatası:", error);
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
};

const uploadProfileImage = async (req, res) => {
  try {
    // Dosya geldiğini kontrol et
    if (!req.file) {
      return res.status(400).json({ message: "Dosya seçilmedi" });
    }

    const userId = req.params.userId;
    // Tam dosya yolunu kaydet
    const profileImagePath = `/uploads/${req.file.filename}`;

    console.log("Güncellenecek Kullanıcı ID:", userId);
    console.log("Güncellenecek Resim Yolu:", profileImagePath);

    // Kullanıcıyı bul ve güncelle
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage: profileImagePath },
      {
        new: true, // Güncellenmiş kullanıcıyı döndür
        runValidators: true, // Şema validasyonlarını çalıştır
      }
    );

    // Kullanıcı bulunamadıysa
    if (!updatedUser) {
      return res.status(404).json({
        message: "Kullanıcı bulunamadı",
        userId: userId,
      });
    }

    console.log("Güncellenmiş Kullanıcı:", updatedUser);

    res.status(200).json({
      message: "Profil resmi başarıyla yüklendi.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Güncelleme Hatası:", error);
    res.status(500).json({
      message: "Profil resmi yüklenirken hata oluştu",
      errorMessage: error.message,
      errorStack: error.stack,
    });
  }
};

// Export et
module.exports = uploadProfileImage;

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserLessons,
  enrollInLesson,
  unenrollFromLesson,
  completeLesson,
  lessonIsCompleted,
  getCompletedLessons,
  uploadProfileImage,
  getTopUsers,
};
