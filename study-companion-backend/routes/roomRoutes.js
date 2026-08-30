const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const { protect } = require("../middleware/authMiddleware");
const { createRoom, getRoom } = require("../controllers/roomController");

router.post("/create", protect, upload.single("file"), createRoom);
router.get("/:code", protect, getRoom);

module.exports = router;
