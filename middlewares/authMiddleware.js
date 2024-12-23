const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token =
    req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
  console.log("Token:", token);

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

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    console.log("Authenticated User:", req.user);
    next();
  });
};

module.exports = authMiddleware;
