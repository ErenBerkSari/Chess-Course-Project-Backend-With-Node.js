const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Token = require("../models/Token");
const Progress = require("../models/Progress");

const register = async (req, res) => {
  const { username, password, email, role } = req.body;

  // Gerekli alanların kontrolü
  if (!username || !password || !email) {
    return res
      .status(400)
      .json({ message: "Lütfen tüm gerekli alanları doldurunuz." });
  }

  try {
    // Kullanıcı adı ve e-posta kontrolü
    const existingUser = await User.findOne({ username });
    const existingEmail = await User.findOne({ email });

    if (existingUser || existingEmail) {
      let message = "";
      if (existingUser) message += "Kullanıcı adı zaten kayıtlı. ";
      if (existingEmail) message += "Email zaten kayıtlı.";
      return res.status(409).json({ message });
    }

    // Şifreyi hashleme
    const hashedPassword = await bcrypt.hash(password, 10);

    // İlerleme verisini oluşturma
    const newProgress = new Progress({
      overallProgress: 0,
    });
    await newProgress.save();

    // Yeni kullanıcıyı kaydetme
    const newUser = new User({
      username,
      password: hashedPassword,
      email,
      role,
      progressInUser: newProgress._id,
    });
    await newUser.save();

    // Token oluşturma
    const accessToken = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30m" }
    );

    const refreshToken = jwt.sign(
      { userId: newUser._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    // Refresh token veritabanına kaydedilir
    await Token.create({
      userId: newUser._id,
      refreshToken,
    });

    // Çerez ayarları
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 10 * 60 * 1000, // 10 dakika
      path: "/",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000, // 1 gün
      path: "/",
    });

    // Başarılı yanıt
    res.status(201).json({
      userId: newUser._id,
      email,
      role: newUser.role,
      message: "Kayıt başarılı.",
    });
  } catch (error) {
    console.error("Sunucu hatası: ", error);
    res.status(500).json({
      message: "Sunucuda bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login işlemi başlatıldı", { email, password });

  try {
    // Kullanıcı kontrolü
    const user = await User.findOne({ email });
    if (!user) {
      console.log("Kullanıcı bulunamadı.");
      return res.status(404).json({
        message:
          "Kullanıcı bulunamadı. Lütfen e-posta adresinizi kontrol edin.",
      });
    }

    // Şifre kontrolü
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log("Yanlış şifre girildi.");
      return res
        .status(401)
        .json({ message: "Yanlış şifre. Lütfen tekrar deneyin." });
    }

    // Token oluşturma
    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1m" }
    );
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    // Refresh token veritabanına kaydetme
    await Token.findOneAndUpdate(
      { userId: user._id },
      { refreshToken },
      { upsert: true }
    );

    // Çerez ayarları
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 10 * 60 * 1000,
      path: "/",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });

    console.log("Login işlemi başarılı");

    res.json({ userId: user._id, email, role: user.role });
  } catch (error) {
    console.error("Sunucu hatası", error);

    // Hata detaylarını loglama
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message:
          "Geçersiz veri gönderildi. Lütfen giriş bilgilerinizi kontrol edin.",
      });
    }

    res.status(500).json({
      message:
        "Beklenmedik bir sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

//COOKİYE EKLE ACCESS TOKENİ SONRA UNUTMUŞSSUN
const refresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken; // Cookie'den refresh token'ı al

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token sağlanmadı" });
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.userId);
    const tokenRecord = await Token.findOne({ userId: user._id, refreshToken });

    if (!user || !tokenRecord) {
      return res
        .status(403)
        .json({ message: "Geçersiz veya süresi dolmuş refresh token" });
    }

    const accessToken = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "10m" }
    );

    res.json({ accessToken, username: user.username });
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Yetkisiz: Geçersiz veya süresi dolmuş refresh token" });
  }
};

const logout = async (req, res) => {
  console.log("Logout işlemi başlatıldı");
  res.clearCookie("accessToken", {
    httpOnly: true,
    path: "/",
    secure: true,
    sameSite: "none", // Cross-domain için none kullanın
  });
  console.log("accessToken çerezi temizlendi");
  res.clearCookie("refreshToken", {
    httpOnly: true,
    path: "/",
    secure: true,
    sameSite: "none", // Cross-domain için none kullanın
  });
  console.log("refreshToken çerezi temizlendi");
  res.status(200).json({ message: "Logout successful" });
  console.log("Logout işlemi başarılı");
};

const testMethod = async (req, res) => {
  console.log("Tüm cookies:", req.cookies);
  console.log("Access token:", req.cookies.accessToken);
  res.json({
    cookies: req.cookies,
    message: "Cookie test",
  });
};

const extractTokenInfo = (req, res) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(400).json({ message: "Token sağlanmadı" });
  }

  try {
    // Token'ı doğrula ve bilgileri al
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Token'daki bilgileri döndür
    const { userId, role, iat, exp } = decoded;

    res.status(200).json({ userId, role, iat, exp });
  } catch (error) {
    return res.status(401).json({ message: "Geçersiz token" });
  }
};

const checkAuthStatus = async (req, res) => {
  try {
    // Access token'ı cookie'den al
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      throw new Error("No access token");
    }

    // Token'ı doğrula
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    // Kullanıcıyı bul
    const user = await User.findById(decoded.userId)
      .select("-password")
      .populate("progressInUser");

    if (!user) {
      throw new Error("User not found");
    }

    res.json({
      userId: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      progress: user.progressInUser,
    });
  } catch (error) {
    // Access token geçersizse veya süresi dolmuşsa, refresh token ile yenilemeyi dene
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      const tokenRecord = await Token.findOne({
        userId: decoded.userId,
        refreshToken,
      });

      if (!tokenRecord) {
        throw new Error("Invalid refresh token");
      }

      const user = await User.findById(decoded.userId)
        .select("-password")
        .populate("progressInUser");

      if (!user) {
        throw new Error("User not found");
      }

      // Yeni access token oluştur
      const newAccessToken = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "30m" }
      );

      // Yeni access token'ı cookie olarak ayarla
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: true,
        maxAge: 10 * 60 * 1000,
        sameSite: "none", // Cross-domain için none kullanın
      });

      res.json({
        userId: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        progress: user.progressInUser,
      });
    } catch (refreshError) {
      res.status(401).json({ message: "Authentication required" });
    }
  }
};
module.exports = {
  register,
  login,
  refresh,
  logout,
  extractTokenInfo,
  checkAuthStatus,
  testMethod,
};
