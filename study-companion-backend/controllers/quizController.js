const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");
const Flashcard = require("../models/Flashcard");
const StudyLog = require("../models/StudyLog");
const aiService = require("../services/aiService");
const { updateUserStreak } = require("../services/streakService");
const TopicMastery = require("../models/topicMastery");

// GET /api/quizzes/:id
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.json({ quiz });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch quiz", error: err.message });
  }
};

// POST /api/quizzes/:id/attempt
exports.submitQuizAttempt = async (req, res) => {
  try {
    const { answers } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: "answers array is required" });
    }

    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const scoredAnswers = answers.map(
      ({ questionIndex, selectedAnswer, durationSeconds }) => {
        const question = quiz.questions[questionIndex];
        const correct = question
          ? question.correctAnswer === selectedAnswer
          : false;
        return { questionIndex, selectedAnswer, correct, durationSeconds };
      },
    );
    const score = scoredAnswers.filter((a) => a.correct).length;

    const wrongAnswers = scoredAnswers.filter((a) => !a.correct);
    let flashcardsCreated = 0;

    const totalQuestions = quiz.questions.length;
    let topicMastered = false;

    if (quiz.isRetest && score === totalQuestions) {
      await TopicMastery.findOneAndUpdate(
        {
          userId: req.user._id,
          documentId: quiz.documentId,
          topic: quiz.topic,
        },
        { mastered: true, masteredAt: new Date() },
        { upsert: true },
      );
      await Flashcard.deleteMany({
        userId: req.user._id,
        documentId: quiz.documentId,
        topic: quiz.topic,
      });
      topicMastered = true;
    }

    const attempt = await QuizAttempt.create({
      quizId: quiz._id,
      userId: req.user._id,
      score,
      answers: scoredAnswers,
    });

    await updateUserStreak(req.user._id);

    await StudyLog.insertMany(
      scoredAnswers.map((a) => ({
        userId: req.user._id,
        type: "quiz",
        topic: quiz.topic,
        correct: a.correct,
        durationSeconds: a.durationSeconds || 15,
      })),
    );

    // Mistake-driven flashcard generation
    if (wrongAnswers.length > 0) {
      const wrongQuestionsData = wrongAnswers.map((a) => {
        const q = quiz.questions[a.questionIndex];
        return {
          question: q.question,
          correctAnswer: q.correctAnswer,
          topic: q.topic,
        };
      });

      const { flashcards } =
        await aiService.generateFlashcardsFromMistakes(wrongQuestionsData);

      const existing = await Flashcard.find({
        userId: req.user._id,
        documentId: quiz.documentId,
        topic: quiz.topic,
      }).select("question");
      const existingSet = new Set(existing.map((f) => f.question));

      const newCards = flashcards.filter((c) => !existingSet.has(c.question));

      if (newCards.length > 0) {
        await Flashcard.insertMany(
          newCards.map((card) => ({
            documentId: quiz.documentId,
            userId: req.user._id,
            topic: quiz.topic, // macro — same subject for every card from this quiz
            subtopic: card.topic, // fine-grained concept, shown as a small label if you want later
            question: card.question,
            answer: card.answer,
          })),
        );
        flashcardsCreated = newCards.length;
      }
    }
    res.status(201).json({
      attempt,
      totalQuestions: quiz.questions.length,
      scorePercent: Math.round((score / quiz.questions.length) * 100),
      flashcardsCreated,
      topicMastered,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to submit quiz attempt", error: err.message });
  }
};

// GET /api/quizzes
exports.getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ userId: req.user._id })
      .populate("documentId", "title")
      .sort({ createdAt: -1 });

    const formatted = quizzes.map((q) => ({
      _id: q._id,
      topic: q.topic,
      isRetest: q.isRetest,
      questionCount: q.questions.length,
      documentTitle: q.documentId?.title || "Unknown document",
      createdAt: q.createdAt,
    }));

    res.json({ quizzes: formatted });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch quizzes", error: err.message });
  }
};

// DELETE /api/quizzes/:id
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    await QuizAttempt.deleteMany({ quizId: quiz._id, userId: req.user._id });
    await Quiz.deleteOne({ _id: quiz._id });

    res.json({ message: "Quiz deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete quiz", error: err.message });
  }
};
