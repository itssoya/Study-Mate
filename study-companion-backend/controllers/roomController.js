const fs = require("fs");
const path = require("path");
const Document = require("../models/documents");
const Quiz = require("../models/Quiz");
const QuizRoom = require("../models/QuizRoom");
const aiService = require("../services/aiService");
const { extractText } = require("../services/textExtractionService");
const { ALLOWED_TYPES } = require("../middleware/uploadMiddleware");

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars (0/O, 1/I)

async function generateUniqueRoomCode() {
  let code,
    exists = true;
  while (exists) {
    code = Array.from(
      { length: 6 },
      () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)],
    ).join("");
    exists = await QuizRoom.exists({ code });
  }
  return code;
}

// POST /api/rooms/create
exports.createRoom = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileType = ALLOWED_TYPES[req.file.mimetype];
    const text = await extractText(req.file.path, fileType);

    const document = await Document.create({
      userId: req.user._id,
      title: req.file.originalname.replace(
        path.extname(req.file.originalname),
        "",
      ),
      rawText: text,
      fileType,
      status: "processing",
    });
    fs.unlinkSync(req.file.path);

    const { subject, topics } = await aiService.detectSubjectAndTopics(text);
    const { questions } = await aiService.generateQuiz(text, topics);

    document.subject = subject;
    document.topics = topics;
    document.status = "ready";
    await document.save();

    const quiz = await Quiz.create({
      documentId: document._id,
      userId: req.user._id,
      topic: subject,
      questions,
    });

    const code = await generateUniqueRoomCode();

    const room = await QuizRoom.create({
      code,
      hostUserId: req.user._id,
      documentId: document._id,
      quizId: quiz._id,
      players: [{ userId: req.user._id, name: req.user.name, score: 0 }],
    });

    res.status(201).json({ room });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res
      .status(500)
      .json({ message: "Failed to create quiz room", error: err.message });
  }
};

// GET /api/rooms/:code
exports.getRoom = async (req, res) => {
  try {
    const room = await QuizRoom.findOne({
      code: req.params.code.toUpperCase(),
    });
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json({ room });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch room", error: err.message });
  }
};

exports.getRoomQuiz = async (req, res) => {
  try {
    const room = await QuizRoom.findOne({
      code: req.params.code.toUpperCase(),
    });
    if (!room) return res.status(404).json({ message: "Room not found" });

    const quiz = await Quiz.findById(room.quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    res.json({ quiz });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch room quiz", error: err.message });
  }
};

exports.createRoomFromDocument = async (req, res) => {
  try {
    const { documentId } = req.body;
    if (!documentId) {
      return res.status(400).json({ message: "documentId is required" });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
    });
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Reuse the most recent existing quiz for this document instead of generating a new one
    let quiz = await Quiz.findOne({
      documentId: document._id,
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    if (!quiz) {
      // Fallback only — shouldn't normally happen, since every upload generates a quiz automatically
      if (!document.rawText) {
        return res
          .status(400)
          .json({
            message: "This document has no extracted text to build a room from",
          });
      }
      const topics = document.topics?.length
        ? document.topics
        : [document.subject || "General"];
      const { questions } = await aiService.generateQuiz(
        document.rawText,
        topics,
      );
      quiz = await Quiz.create({
        documentId: document._id,
        userId: req.user._id,
        topic: document.subject || "General",
        questions,
      });
    }

    const code = await generateUniqueRoomCode();

    const room = await QuizRoom.create({
      code,
      hostUserId: req.user._id,
      documentId: document._id,
      quizId: quiz._id,
      players: [{ userId: req.user._id, name: req.user.name, score: 0 }],
    });

    res.status(201).json({ room });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create quiz room", error: err.message });
  }
};
