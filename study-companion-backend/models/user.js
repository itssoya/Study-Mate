const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String },
    streak: { type: Number, default: 0 },
    googleId: { type: String, unique: true, sparse: true },
    avatarUrl: { type: String },
    lastStudyDate: { type: Date },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
module.exports = User;
