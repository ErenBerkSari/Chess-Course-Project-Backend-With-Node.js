const jwt = require("jsonwebtoken");
const app = express();
app.use(cookieParser());

const authMiddleware = (req, res, next) => {
  // const token = req.cookies.accessToken; // Cookie'den token al
  // console.log("tokeni neden alamıyorum:", token);
  // console.log("Headers:", req.headers);
  // console.log("Cookies:", req.cookies);

  // if (!token) {
  //   return res.status(401).json({ message: "Unauthorized, token missing" });
  // }

  // jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
  //   if (err) {
  //     if (err.name === "TokenExpiredError") {
  //       return res.status(403).json({ message: "Token has expired" });
  //     } else {
  //       return res.status(403).json({ message: "Invalid token" });
  //     }
  //   }

  //   // Doğrulanan kullanıcı bilgilerini req.user'a ekle
  //   req.user = {
  //     userId: decoded.userId,
  //     role: decoded.role,
  //   };

  //   console.log("Authenticated User:", req.user);
  //   next();
  // });
  console.log("Middleware'deki cookies:", req.cookies);
  next();
};

module.exports = authMiddleware;
