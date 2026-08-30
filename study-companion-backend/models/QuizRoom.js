const mongoose = require("mongoose");

const quizRoomSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    hostUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    status: {
      type: String,
      enum: ["waiting", "in_progress", "finished"],
      default: "waiting",
    },
    currentQuestionIndex: { type: Number, default: -1 },
    players: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name: String,
        score: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("QuizRoom", quizRoomSchema);
