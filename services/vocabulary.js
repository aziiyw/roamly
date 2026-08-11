export const starterVocabulary = [
  { word: '出口', reading: 'deguchi', meaning: 'Exit', category: 'Directions', seen: 4, level: 88, status: 'Mastered', place: 'Kyoto Station' },
  { word: '入口', reading: 'iriguchi', meaning: 'Entrance', category: 'Directions', seen: 3, level: 53, status: 'Learning', place: 'Nishiki Market' },
  { word: 'おすすめ', reading: 'osusume', meaning: 'Recommendation', category: 'Food', seen: 2, level: 42, status: 'Learning', place: 'Kissa Kōyō' },
  { word: '現金のみ', reading: 'genkin nomi', meaning: 'Cash only', category: 'Shopping', seen: 1, level: 18, status: 'Seen before', place: 'Fushimi Inari' },
  { word: 'お手洗い', reading: 'otearai', meaning: 'Restroom', category: 'Directions', seen: 1, level: 10, status: 'New', place: 'Arashiyama Station' }
];

export function recordEncounter(word, place) {
  return { ...word, seen: word.seen + 1, place: word.place || place };
}
