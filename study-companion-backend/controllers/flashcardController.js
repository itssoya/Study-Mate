const Flashcard = require("../models/Flashcard");
const StudyLog = require("../models/StudyLog");
const { calculateNextReview } = require("../services/spacedRepetition");
const { updateUserStreak } = require("../services/streakService");

// GET /api/flashcards/due
exports.getDueFlashcards = async (req, res) => {
  try {
    const { documentId, topic } = req.query;

    const query = { userId: req.user._id, nextDueDate: { $lte: new Date() } };
    if (documentId) query.documentId = documentId;
    if (topic) query.topic = topic;

    const flashcards = await Flashcard.find(query).sort({ nextDueDate: 1 });
    res.json({ count: flashcards.length, flashcards });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch due flashcards", error: err.message });
  }
};

// POST /api/flashcards/:id/review
exports.reviewFlashcard = async (req, res) => {
  try {
    const { correct } = req.body;

    if (typeof correct !== "boolean") {
      return res
        .status(400)
        .json({ message: '"correct" must be true or false' });
    }

    const flashcard = await Flashcard.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!flashcard) {
      return res.status(404).json({ message: "Flashcard not found" });
    }

    const { easeFactor, interval, state, nextDueDate } = calculateNextReview(
      flashcard,
      correct,
    );
    flashcard.easeFactor = easeFactor;
    flashcard.interval = interval;
    flashcard.state = state;
    flashcard.nextDueDate = nextDueDate;
    flashcard.lastReviewed = new Date();
    await flashcard.save();

    await updateUserStreak(req.user._id);
    await StudyLog.create({
      userId: req.user._id,
      type: "flashcard",
      topic: flashcard.topic,
      correct,
      durationSeconds: req.body.durationSeconds || 15,
    });

    res.json({ flashcard });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update flashcard", error: err.message });
  }
};

// GET /api/flashcards/topics
exports.getFlashcardTopics = async (req, res) => {
  try {
    const topics = await Flashcard.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: "$topic",
          cardCount: { $sum: 1 },
          documentId: { $first: "$documentId" },
        },
      },
      { $project: { topic: "$_id", _id: 0, cardCount: 1, documentId: 1 } },
      { $sort: { topic: 1 } },
    ]);
    res.json({ topics });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch flashcard topics",
      error: err.message,
    });
  }
};

// GET /api/flashcards/topic/:topic  — ALL cards for a topic, not date-filtered
exports.getFlashcardsByTopic = async (req, res) => {
  try {
    const flashcards = await Flashcard.find({
      userId: req.user._id,
      topic: req.params.topic,
    }).sort({ createdAt: 1 });
    res.json({ count: flashcards.length, flashcards });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch flashcards", error: err.message });
  }
};

// DELETE /api/flashcards/topic/:topic
exports.deleteFlashcardsByTopic = async (req, res) => {
  try {
    const result = await Flashcard.deleteMany({
      userId: req.user._id,
      topic: req.params.topic,
    });
    res.json({
      message: "Flashcards deleted",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete flashcards", error: err.message });
  }
};
