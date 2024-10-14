const express = require("express");
const {
  refresh,
  login,
  register,
  logout,
  extractTokenInfo,
} = require("../controllers/userController");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/extract-token-info", extractTokenInfo);

module.exports = router;
