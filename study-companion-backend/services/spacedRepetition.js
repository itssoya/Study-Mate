function calculateNextReview(flashcard, isCorrect) {
  let { easeFactor, interval, state } = flashcard;

  if (isCorrect) {
    if (state === "new") {
      interval = 1;
      state = "learning";
    } else if (state === "learning") {
      interval = 3;
      state = "reviewing";
    } else {
      interval = Math.round(interval * easeFactor);
      easeFactor = Math.min(easeFactor + 0.1, 3.0);
    }
    if (interval >= 21) state = "mastered";
  } else {
    interval = 1;
    easeFactor = Math.max(easeFactor - 0.2, 1.3);
    state = "learning";
  }

  const nextDueDate = new Date();
  nextDueDate.setDate(nextDueDate.getDate() + interval);

  return { easeFactor, interval, state, nextDueDate };
}

module.exports = { calculateNextReview };
