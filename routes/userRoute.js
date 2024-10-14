const express = require("express");
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

// Tüm kullanıcıları getir
router.get("/", getAllUsers);

// ID ile kullanıcı getir
router.get("/:id", getUserById);

// Kullanıcıyı güncelle
router.put("/:id", authMiddleware, roleMiddleware(["admin"]), updateUser);

// Kullanıcıyı sil
router.delete("/:id", authMiddleware, roleMiddleware(["admin"]), deleteUser);

module.exports = router;
