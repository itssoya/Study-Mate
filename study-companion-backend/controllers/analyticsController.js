const StudyLog = require("../models/StudyLog");
const Flashcard = require("../models/Flashcard");
const { getTopicMasteryFromQuizzes } = require("../services/masteryService");

async function getAccuracyTrend(userId) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const trend = await StudyLog.aggregate([
    {
      $match: {
        userId,
        createdAt: { $gte: startDate },
        correct: { $ne: null },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        total: { $sum: 1 },
        correctCount: { $sum: { $cond: ["$correct", 1, 0] } },
      },
    },
    {
      $project: {
        date: "$_id",
        _id: 0,
        accuracy: {
          $round: [
            { $multiply: [{ $divide: ["$correctCount", "$total"] }, 100] },
            0,
          ],
        },
      },
    },
    { $sort: { date: 1 } },
  ]);

  const improvement =
    trend.length >= 2
      ? trend[trend.length - 1].accuracy - trend[0].accuracy
      : 0;

  return { trend, improvementPercent: improvement };
}

async function getStudyTime(userId) {
  const now = new Date();

  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);

  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(now.getDate() - 14);

  const [total, lastWeek, priorWeek] = await Promise.all([
    StudyLog.aggregate([
      { $match: { userId } },
      { $group: { _id: null, s: { $sum: "$durationSeconds" } } },
    ]),

    StudyLog.aggregate([
      { $match: { userId, createdAt: { $gte: weekAgo } } },
      { $group: { _id: null, s: { $sum: "$durationSeconds" } } },
    ]),

    StudyLog.aggregate([
      { $match: { userId, createdAt: { $gte: twoWeeksAgo, $lt: weekAgo } } },
      { $group: { _id: null, s: { $sum: "$durationSeconds" } } },
    ]),
  ]);

  const toHours = (arr) => Math.round(((arr[0]?.s || 0) / 3600) * 10) / 10;

  return {
    totalHours: toHours(total),
    hoursChangeFromLastWeek: toHours(lastWeek) - toHours(priorWeek),
  };
}

async function getCardsMastered(userId) {
  const [userCount, allCounts] = await Promise.all([
    Flashcard.countDocuments({ userId, state: "mastered" }),
    Flashcard.aggregate([
      { $match: { state: "mastered" } },
      { $group: { _id: "$userId", count: { $sum: 1 } } },
    ]),
  ]);

  const usersBelow = allCounts.filter((u) => u.count < userCount).length;

  const percentileRank =
    allCounts.length > 0
      ? Math.round((usersBelow / allCounts.length) * 100)
      : 100;

  return {
    cardsMastered: userCount,
    topPercent: Math.max(1, 100 - percentileRank),
  };
}

async function getActivity(userId) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 365);

  return StudyLog.aggregate([
    { $match: { userId, createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
}

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const [accuracyTrend, studyTime, cardsMastered, topicMastery, activity] =
      await Promise.all([
        getAccuracyTrend(userId),
        getStudyTime(userId),
        getCardsMastered(userId),
        getTopicMasteryFromQuizzes(userId),
        getActivity(userId),
      ]);

    res.json({
      streak: req.user.streak,
      accuracyTrend,
      studyTime,
      cardsMastered,
      topicMastery,
      activity,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to load dashboard", error: err.message });
  }
};
