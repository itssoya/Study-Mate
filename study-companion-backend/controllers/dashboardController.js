const Flashcard = require("../models/Flashcard");
const { getTopicMasteryFromQuizzes } = require("../services/masteryService");

exports.getHomeDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const dueGroups = await Flashcard.aggregate([
      { $match: { userId, nextDueDate: { $lte: new Date() } } },
      { $group: { _id: "$topic", dueCount: { $sum: 1 } } },
      { $sort: { dueCount: -1 } },
      { $limit: 1 },
    ]);

    const upNext =
      dueGroups.length > 0
        ? {
            topic: dueGroups[0]._id,
            cardsToMaster: dueGroups[0].dueCount,
            dueToday: true,
          }
        : null;

    const topicMasteryData = await getTopicMasteryFromQuizzes(userId);
    const topicsMasteredCount = topicMasteryData.filter(
      (t) => t.mastered,
    ).length;
    const overallMastery =
      topicMasteryData.length > 0
        ? Math.round(
            topicMasteryData.reduce((sum, t) => sum + t.masteryPercent, 0) /
              topicMasteryData.length,
          )
        : 0;

    res.json({
      greetingName: req.user.name.split(" ")[0],
      streak: req.user.streak,
      upNext,
      overallMastery,
      topicsMasteredCount,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to load home dashboard", error: err.message });
  }
};
