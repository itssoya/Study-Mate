const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  getQuizzes,
  getQuizById,
  submitQuizAttempt,
  deleteQuiz,
} = require("../controllers/quizController");

router.get("/", protect, getQuizzes);
router.get("/:id", protect, getQuizById);
router.post("/:id/attempt", protect, submitQuizAttempt);
router.delete("/:id", protect, deleteQuiz);

module.exports = router;
