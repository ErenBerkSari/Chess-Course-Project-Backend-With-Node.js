const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 'uploads' klasörünün var olup olmadığını kontrol et, yoksa oluştur
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Dosyalar 'uploads' klasörüne kaydedilir
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName); // Dosya adı benzersiz hale getirilir
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Sadece JPEG, PNG ve JPG formatları desteklenir."), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Maksimum dosya boyutu: 5 MB
  fileFilter,
});

module.exports = upload;
