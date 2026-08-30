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

    const text = await extractText(req.file.path, fileType);
    console.log("3. Text extracted, length:", text.length);

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

    // Running AI pipeline — quiz only now; flashcards are generated
    // later from wrong quiz answers, not at upload time
    const { subject, topics } = await aiService.detectSubjectAndTopics(text);
    console.log("5. Subject/topics detected:", subject, topics);

    const { questions } = await aiService.generateQuiz(text, topics);
    console.log("6. Quiz generated:", questions.length, "questions");

    document.subject = subject;
    document.topics = topics;
    document.status = "ready";
    await document.save();
    console.log("7. Document updated with subject/topics");

    await Quiz.create({
      documentId: document._id,
      userId: req.user._id,
      topic: subject,
      questions,
    });
    console.log("8. Quiz saved");

    return res.status(201).json({
      document,
      quizGenerated: true,
    });
  } catch (err) {
    console.error("Upload failed at step:", err.message);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ message: "Upload failed", error: err.message });
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
