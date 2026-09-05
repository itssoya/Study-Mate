const fs = require("fs");
const path = require("path");
const Document = require("../models/documents");
const Quiz = require("../models/Quiz");
const aiService = require("../services/aiService");
const { extractText } = require("../services/textExtractionService");
const { ALLOWED_TYPES } = require("../middleware/uploadMiddleware");

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("1. File received:", req.file.originalname);

    const fileType = ALLOWED_TYPES[req.file.mimetype];
    console.log("2. File type:", fileType);

    const t1 = Date.now();
    const text = await extractText(req.file.path, fileType);
    console.log(
      `3. Text extracted, length: ${text.length} (${Date.now() - t1}ms)`,
    );

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
    console.log("4. Document saved to DB");

    fs.unlinkSync(req.file.path);

    const t2 = Date.now();
    const { subject, topics, questions } =
      await aiService.generateDocumentAnalysis(text);
    console.log(
      `5. Subject, topics, and quiz generated in one call (${Date.now() - t2}ms):`,
      subject,
      topics,
    );

    document.subject = subject;
    document.topics = topics;
    document.status = "ready";
    await document.save();
    console.log("6. Document updated with subject/topics");

    await Quiz.create({
      documentId: document._id,
      userId: req.user._id,
      topic: subject,
      questions,
    });
    console.log("7. Quiz saved");

    return res.status(201).json({
      document,
      quizGenerated: true,
    });
  } catch (err) {
    console.error("Upload failed at step:", err.message);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    const isAiOverloaded =
      err.message?.includes("503") ||
      err.message?.includes("overloaded") ||
      err.message?.includes("high demand");

    res.status(isAiOverloaded ? 503 : 500).json({
      message: isAiOverloaded
        ? "Our AI provider is experiencing high demand right now."
        : "Upload failed",
      error: err.message,
      retryable: isAiOverloaded,
    });
  }
};

// POST /api/documents/:id/quiz — generate a fresh quiz from an already-uploaded document
exports.generateQuizFromDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }
    if (!document.rawText) {
      return res
        .status(400)
        .json({
          message:
            "This document has no extracted text to generate a quiz from",
        });
    }

    const topics = document.topics?.length
      ? document.topics
      : [document.subject || "General"];
    const { questions } = await aiService.generateQuiz(
      document.rawText,
      topics,
    );

    const quiz = await Quiz.create({
      documentId: document._id,
      userId: req.user._id,
      topic: document.subject || "General",
      questions,
    });

    res.status(201).json({ quiz });
  } catch (err) {
    const isAiOverloaded =
      err.message?.includes("503") ||
      err.message?.includes("overloaded") ||
      err.message?.includes("high demand");

    res.status(isAiOverloaded ? 503 : 500).json({
      message: isAiOverloaded
        ? "Our AI provider is experiencing high demand right now."
        : "Failed to generate quiz",
      error: err.message,
      retryable: isAiOverloaded,
    });
  }
};

// GET /api/documents/:id/quizzes — all quizzes generated from this specific document
exports.getQuizzesForDocument = async (req, res) => {
  try {
    const quizzes = await Quiz.find({
      documentId: req.params.id,
      userId: req.user._id,
    }).sort({ createdAt: -1 });
    const formatted = quizzes.map((q) => ({
      _id: q._id,
      topic: q.topic,
      isRetest: q.isRetest,
      questionCount: q.questions.length,
      createdAt: q.createdAt,
    }));
    res.json({ quizzes: formatted });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch quizzes", error: err.message });
  }
};

// GET /api/documents  — list all of the logged-in user's documents
exports.getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user._id }).select(
      "-rawText",
    );
    res.json({ documents });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch documents", error: err.message });
  }
};

// GET /api/documents/:id — get one document, including full text
exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }
    res.json({ document });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch document", error: err.message });
  }
};
