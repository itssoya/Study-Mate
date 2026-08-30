const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const ALLOWED_TYPES = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "pptx",
};

const filterFileType = (req, file, cb) => {
  if (ALLOWED_TYPES[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, DOCX, and PPTX files are allowed"), false);
  }
};

const upload = multer({
  storage,
  filterFileType,
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = upload;
module.exports.ALLOWED_TYPES = ALLOWED_TYPES;
