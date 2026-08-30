const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const { protect } = require("../middleware/authMiddleware");
const {
  uploadDocument,
  getDocuments,
  getDocumentById,
} = require("../controllers/documentController");

router.post("/upload", protect, upload.single("file"), uploadDocument);
router.get("/", protect, getDocuments);
router.get("/:id", protect, getDocumentById);

module.exports = router;
