const express = require("express");
const {
  refresh,
  login,
  register,
  logout,
  extractTokenInfo,
  checkAuthStatus,
} = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/status", checkAuthStatus);
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/extract-token-info", authMiddleware, extractTokenInfo);

module.exports = router;
