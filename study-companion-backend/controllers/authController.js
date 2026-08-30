const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Document = require("../models/documents");
const Flashcard = require("../models/Flashcard");
const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");
const StudyLog = require("../models/StudyLog");
const TopicMastery = require("../models/topicMastery");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const generateToken = (userID) => {
  return jwt.sign({ id: userID }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide name, email and password" });
    }

    const lowerCaseEmail = email.toLowerCase().trim();

    if (!emailRegex.test(lowerCaseEmail)) {
      return res.status(400).json({
        message: "Please provide a valid email",
      });
    }

    const userExist = await User.findOne({
      email: lowerCaseEmail,
    });

    if (userExist) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: lowerCaseEmail,
      passwordHash: hashedPassword,
    });

    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email },
      token: generateToken(user.id),
    });
  } catch (err) {
    res.status(500).json({ message: "Signup Failed", error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    const lowerCaseEmail = email.toLowerCase().trim();
    const trimmeedPassword = password;

    const user = await User.findOne({
      email: lowerCaseEmail,
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(trimmeedPassword, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    res.json({
      user: { id: user._id, name: user.name, email: user.email },
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: name.trim() },
      { new: true },
    ).select("-passwordHash");
    res.json({ user });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update profile", error: err.message });
  }
};

// PATCH /api/auth/password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id);

    if (user.passwordHash) {
      if (!currentPassword) {
        return res
          .status(400)
          .json({ message: "Current password is required" });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return res
          .status(401)
          .json({ message: "Current password is incorrect" });
      }
    }
    // Google-only accounts have no passwordHash yet — let them set one directly, no current password needed

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to change password", error: err.message });
  }
};

// DELETE /api/auth/me
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    await Promise.all([
      Document.deleteMany({ userId }),
      Flashcard.deleteMany({ userId }),
      Quiz.deleteMany({ userId }),
      QuizAttempt.deleteMany({ userId }),
      StudyLog.deleteMany({ userId }),
      TopicMastery.deleteMany({ userId }),
    ]);

    await User.findByIdAndDelete(userId);

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete account", error: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};
