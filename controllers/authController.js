const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Token = require("../models/Token");

const register = async (req, res) => {
  const { username, password, email, role } = req.body;

  if (!username || !password || !email) {
    return res
      .status(400)
      .json({ message: "Lütfen gerekli tüm alanları doldurunuz." });
  }
  try {
    const existingUser = await User.findOne({ username });
    const existingEmail = await User.findOne({ email });
    if (existingUser || existingEmail) {
      let message = "";

      if (existingUser) {
        message += "Kullanıcı adı zaten mevcut. ";
      }

      if (existingEmail) {
        message += "Email zaten kayıtlı.";
      }

      return res.status(409).json({ message });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      password: hashedPassword,
      email,
      role,
    });
    await newUser.save();

    const accessToken = jwt.sign(
      {
        userId: newUser._id,
        role: newUser.role,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "10m" }
    );

    const refreshToken = jwt.sign(
      {
        userId: newUser._id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    const tokenRecord = new Token({
      userId: newUser._id,
      refreshToken,
    });
    await tokenRecord.save();

    const userId = newUser._id;
    res.json({ accessToken, userId, refreshToken, email });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      const match = await bcrypt.compare(password, user.password);

      if (match) {
        const accessToken = jwt.sign(
          {
            userId: user._id,
            role: user.role,
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "10m" }
        );

        const refreshToken = jwt.sign(
          {
            userId: user._id,
          },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: "1d" }
        );

        await Token.findOneAndUpdate(
          { userId: user._id },
          { refreshToken },
          { upsert: true }
        );
        const userId = user._id;
        res.json({ accessToken, userId, refreshToken, email });
      } else {
        return res.status(406).json({ message: "Invalid credentials" });
      }
    } else {
      return res.status(406).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const refresh = async (req, res) => {
  const { refreshToken } = req.body;

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
  const refreshToken = req.body.refreshToken;
  if (refreshToken) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );

      await Token.findOneAndDelete({
        userId: decoded.userId,
        refreshToken: refreshToken,
      });

      res.status(200).json({ message: "Logout successful" });
    } catch (error) {
      res.status(406).json({ message: "Logout failed" });
    }
  } else {
    res.status(400).json({ message: "No token provided" });
  }
};

const extractTokenInfo = (req, res) => {
  const token = req.body.token;

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
module.exports = { register, login, refresh, logout, extractTokenInfo };
