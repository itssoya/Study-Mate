const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  getMe,
  updateProfile,
  changePassword,
  deleteAccount,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, getMe);

router.patch("/me", protect, updateProfile);
router.patch("/password", protect, changePassword);
router.delete("/me", protect, deleteAccount);

module.exports = router;
