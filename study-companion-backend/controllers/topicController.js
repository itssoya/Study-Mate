const studyLog = require("../models/StudyLog");

exports.getWeakTopics = async (req, res) => {
  try {
    const userId = req.user._Id;

    const topics = await studyLog.aggregate([
      { $match: { userId, correct: { $ne: null }, topic: { $ne: null } } },
      {
        $group: {
          _id: "$topic",
          total: { $sum: 1 },
          correctCount: { $sum: { $cond: ["$correct", 1, 0] } },
        },
      },
      { $match: { total: { $gte: 3 } } },
      {
        $project: {
          topic: "$_id",
          _id: 0,
          attempts: "$total",
          accuracy: {
            $round: [
              { $multiply: [{ $divide: ["$correctCount", "$total"] }, 100] },
              0,
            ],
          },
        },
      },
      { $sort: { accuracy: 1 } },
      { $limit: 10 },
    ]);

    const withPriority = topics.map((t) => ({
      ...t,
      priority: t.accuracy < 40 ? "high" : t.accuracy < 65 ? "medium" : "low",
    }));

    res.json({ topics: withPriority });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch weak topics", error: err.message });
  }
};
