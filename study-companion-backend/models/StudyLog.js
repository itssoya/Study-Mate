const mongoose = require("mongoose");

const studyLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: { type: String, enum: ["flashcard", "quiz"], required: true },
    topic: { type: String },
    correct: { type: Boolean },
    durationSeconds: { type: Number, default: 15 },
  },
  { timestamps: true },
);

studyLogSchema.index({ userId: 1, createdAt: 1 });

module.exports = mongoose.model("StudyLog", studyLogSchema);
