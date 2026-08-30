const mongoose = require("mongoose");

const flashcardSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    topic: { type: String },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    state: {
      type: String,
      enum: ["new", "learning", "reviewing", "mastered"],
      default: "new",
    },
    subtopic: { type: String },
    easeFactor: { type: Number, default: 2.5 },
    interval: { type: Number, default: 1 }, // days until next review
    nextDueDate: { type: Date, default: Date.now },
    lastReviewed: { type: Date },
  },
  { timestamps: true },
);

// speeds up your "cards due today" and "weak topics" queries
flashcardSchema.index({ userId: 1, nextDueDate: 1 });
flashcardSchema.index({ userId: 1, topic: 1 });

module.exports = mongoose.model("Flashcard", flashcardSchema);
