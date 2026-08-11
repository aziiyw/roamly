/** Gentle spaced-repetition policy kept independent from screen components. */
export function shouldOfferRecallQuiz(word, random = Math.random()) {
  return word.seen > 1 && word.status !== 'New' && random < 0.35;
}

export function scoreRecall(word, correct) {
  const level = Math.max(0, Math.min(100, word.level + (correct ? 18 : -12)));
  return { ...word, level, status: correct && level >= 70 ? 'Mastered' : correct ? 'Learning' : 'Seen before' };
}
