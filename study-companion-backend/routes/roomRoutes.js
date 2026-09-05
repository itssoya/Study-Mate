const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const { protect } = require("../middleware/authMiddleware");
const {
  createRoom,
  getRoom,
  getRoomQuiz,
  createRoomFromDocument,
} = require("../controllers/roomController");

router.post("/create", protect, upload.single("file"), createRoom);
router.get("/:code", protect, getRoom);
router.get("/:code/quiz", protect, getRoomQuiz);
router.post("/create-from-document", protect, createRoomFromDocument);

module.exports = router;
