const mongoose = require("mongoose");

const topicMasterySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    topic: { type: String, required: true },
    mastered: { type: Boolean, default: false },
    masteredAt: { type: Date },
  },
  { timestamps: true },
);

topicMasterySchema.index(
  { userId: 1, documentId: 1, topic: 1 },
  { unique: true },
);

module.exports = mongoose.model("TopicMastery", topicMasterySchema);
