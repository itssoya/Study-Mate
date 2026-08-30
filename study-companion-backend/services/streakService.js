const User = require("../models/user");

async function updateUserStreak(userId) {
  const user = await User.findById(userId);
  if (!user) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!user.lastStudyDate) {
    user.streak = 1;
    user.lastStudyDate = today;
    await user.save();
    return user;
  }

  const lastStudy = new Date(user.lastStudyDate); // <-- this declaration is likely missing/broken in your file
  lastStudy.setHours(0, 0, 0, 0);

  const diffDays = Math.round((today - lastStudy) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return user;
  } else if (diffDays === 1) {
    user.streak += 1;
  } else {
    user.streak = 1;
  }

  user.lastStudyDate = today;
  await user.save();
  return user;
}

module.exports = { updateUserStreak };
