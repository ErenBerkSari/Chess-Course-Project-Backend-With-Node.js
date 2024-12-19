const jwt = require("jsonwebtoken");

// const authMiddleware = (req, res, next) => {
//   // Authorization başlığı var mı kontrol et
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1]; // Bearer token şeklinde

//   // Token yoksa 401 Unauthorized döndür
//   if (!token) return res.status(401).json({ message: "Token eksik" });

//   // Token'ı doğrula
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//     if (err) {
//       if (err.name === "TokenExpiredError") {
//         return res.status(403).json({ message: "Token süresi dolmuş" }); // Token expired
//       } else {
//         return res.status(403).json({ message: "Geçersiz token" }); // Token invalid
//       }
//     }

//     // Token geçerliyse kullanıcı bilgilerini req.user'a ekle
//     req.user = {
//       userId: decoded.userId,
//       username: decoded.username,
//       role: decoded.role,
//     };

//     console.log(req.user); // Kullanıcı bilgilerini kontrol için logla
//     next(); // Devam et
//   });
// };
const authMiddleware = (req, res, next) => {
  const token = req.cookies.accessToken; // Cookie'den token al
  if (!token) {
    return res.status(401).json({ message: "Unauthorized, token missing" });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(403).json({ message: "Token has expired" });
      } else {
        return res.status(403).json({ message: "Invalid token" });
      }
    }

    // Doğrulanan kullanıcı bilgilerini req.user'a ekle
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    console.log("Authenticated User:", req.user);
    next();
  });
};

module.exports = authMiddleware;
