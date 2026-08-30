const StudyLog = require("../models/StudyLog");
const TopicMastery = require("../models/topicMastery");

const MASTERY_THRESHOLD = 90;

async function getTopicMasteryFromQuizzes(userId) {
  const stats = await StudyLog.aggregate([
    { $match: { userId, type: "quiz", topic: { $ne: null } } },
    {
      $group: {
        _id: "$topic",
        total: { $sum: 1 },
        correctCount: { $sum: { $cond: ["$correct", 1, 0] } },
      },
    },
    {
      $project: {
        topic: "$_id",
        _id: 0,
        total: 1,
        masteryPercent: {
          $round: [
            { $multiply: [{ $divide: ["$correctCount", "$total"] }, 100] },
            0,
          ],
        },
      },
    },
    { $sort: { masteryPercent: -1 } },
  ]);

  const explicit = await TopicMastery.find({ userId, mastered: true }).select(
    "topic",
  );
  const explicitSet = new Set(explicit.map((t) => t.topic));

  return stats.map((t) => ({
    ...t,
    mastered: explicitSet.has(t.topic) || t.masteryPercent >= MASTERY_THRESHOLD,
  }));
}

module.exports = { getTopicMasteryFromQuizzes, MASTERY_THRESHOLD };
