const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getWeakTopics } = require("../controllers/topicController");
const { generateTopicRetest } = require("../controllers/retestController");

router.get("/weak", protect, getWeakTopics);
router.post("/:topic/retest", protect, generateTopicRetest);

module.exports = router;
