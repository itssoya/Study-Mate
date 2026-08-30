const mongoose = require("mongoose");

const quizAttemptSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  score: { type: Number, required: true },
  answers: [
    {
      questionIndex: { type: Number },
      selectedAnswer: { type: String },
      correct: { type: Boolean },
    },
  ],
  completedAt: { type: Date, default: Date.now },
});

quizAttemptSchema.index({ userId: 1, quizId: 1 });

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);
