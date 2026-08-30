const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  getDueFlashcards,
  reviewFlashcard,
  getFlashcardTopics,
  getFlashcardsByTopic,
  deleteFlashcardsByTopic,
} = require("../controllers/flashcardController");

router.get("/topics", protect, getFlashcardTopics);
router.get("/topic/:topic", protect, getFlashcardsByTopic);
router.get("/due", protect, getDueFlashcards);
router.post("/:id/review", protect, reviewFlashcard);
router.delete("/topic/:topic", protect, deleteFlashcardsByTopic);

module.exports = router;
