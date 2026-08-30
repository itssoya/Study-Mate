const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    subject: { type: String },
    topics: [{ type: String }],
    rawText: { type: String },
    fileType: {
      type: String,
      enum: ["pdf", "docx", "pptx"],
      required: true,
    },
    status: {
      type: String,
      enum: ["processing", "ready", "failed"],
      default: "processing",
    },
  },
  { timestamps: true },
);

documentSchema.index({ userId: 1 });

module.exports = mongoose.model("Document", documentSchema);
