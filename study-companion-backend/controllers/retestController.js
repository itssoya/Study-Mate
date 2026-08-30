const Document = require("../models/documents");
const Quiz = require("../models/Quiz");
const aiService = require("../services/aiService");

exports.generateTopicRetest = async (req, res) => {
  try {
    const { topic } = req.params;
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

    const { questions } = await aiService.generateTopicRetestQuiz(
      document.rawText,
      topic,
    );

    const quiz = await Quiz.create({
      documentId,
      userId: req.user._id,
      topic,
      isRetest: true,
      questions,
    });

    res.status(201).json({ quiz });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to generate retest quiz", error: err.message });
  }
};
