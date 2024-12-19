const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Token = require("../models/tokenModel");
const User = require("../models/userModel");

// Utility function for signing tokens
const signToken = (payload, secret, options) => {
  return jwt.sign(payload, secret, options);
};

// Utility function for setting cookies
const setCookie = (res, name, value, options = {}) => {
  res.cookie(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    ...options,
  });
};

// Register user
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Girdiğiniz bilgilerle kayıtlı bir hesap mevcut." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "Kayıt başarılı!" });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Geçersiz kullanıcı adı veya şifre." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Geçersiz kullanıcı adı veya şifre." });
    }

    const accessToken = signToken(
      { userId: user._id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = signToken(
      { userId: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    await Token.findOneAndUpdate(
      { userId: user._id },
      { token: refreshToken },
      { upsert: true, new: true }
    );

    setCookie(res, "refreshToken", refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Sunucu hatası." });
  }
};

// Refresh token
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken)
      return res.status(401).json({ message: "Yetkisiz erişim." });

    const existingToken = await Token.findOne({ token: refreshToken });
    if (!existingToken)
      return res.status(403).json({ message: "Geçersiz refresh token." });

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const accessToken = signToken(
      { userId: decoded.userId, role: decoded.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Refresh error:", error);
    res.status(403).json({ message: "Token doğrulama hatası." });
  }
};

// Check auth status
exports.checkAuthStatus = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ message: "Yetkisiz erişim." });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    res.status(200).json({ userId: decoded.userId, role: decoded.role });
  } catch (error) {
    console.error("Auth status error:", error);
    res.status(401).json({ message: "Token doğrulama hatası." });
  }
};
