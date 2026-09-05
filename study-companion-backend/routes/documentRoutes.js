const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const { protect } = require("../middleware/authMiddleware");
const {
  uploadDocument,
  getDocuments,
  getDocumentById,
  generateQuizFromDocument,
  getQuizzesForDocument,
} = require("../controllers/documentController");

router.post("/upload", protect, upload.single("file"), uploadDocument);
router.get("/", protect, getDocuments);
router.get("/:id", protect, getDocumentById);
router.post("/:id/quiz", protect, generateQuizFromDocument);
router.get("/:id/quizzes", protect, getQuizzesForDocument);

module.exports = router;
