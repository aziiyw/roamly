// === Trip memory: save and load past trips via localStorage ===
function saveCurrentTrip() {
  if (!data.trip.place || data.vocab.length === 0) return;
  const past = loadPastTrips().filter(t => t.place !== data.trip.place);
  past.unshift({ place: data.trip.place, flag: data.trip.flag, lang: data.trip.lang, langCode: data.trip.langCode, name: data.trip.name, dates: data.trip.dates, savedAt: Date.now(), vocabCount: data.vocab.length, vocab: data.vocab.slice(0, 50) });
  try { localStorage.setItem('roamly_trips', JSON.stringify(past.slice(0, 10))); } catch(e) {}
}
function loadPastTrips() {
  try { return JSON.parse(localStorage.getItem('roamly_trips') || '[]'); } catch(e) { return []; }
}
// Check if any past trip shares the same language as the current destination
function findMatchingLangTrip(langCode) {
  return loadPastTrips().find(t => t.langCode === langCode && t.vocab && t.vocab.length > 0);
}

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const destOption = (d) => `<button class="dest-option ${`${d.city}, ${d.country}` === data.trip.place ? 'selected' : ''}" data-dest="${d.city}|${d.country}|${d.flag}|${d.lang}|${d.langCode}"><span class="dest-flag">${d.flag}</span><span class="dest-name"><b>${d.city}</b><small>${d.country} · ${d.lang}</small></span></button>`;

// Fallback vocab for the quiz when the user hasn't scanned anything yet.
const starterVocabulary = [
  { word: '出口', reading: 'deguchi', meaning: 'Exit', place: 'Kyoto Station' },
  { word: '入口', reading: 'iriguchi', meaning: 'Entrance', place: 'Nishiki Market' },
  { word: 'おすすめ', reading: 'osusume', meaning: 'Recommendation', place: 'Kissa Kōyō' },
  { word: '現金のみ', reading: 'genkin nomi', meaning: 'Cash only', place: 'Fushimi Inari' },
  { word: 'お手洗い', reading: 'otearai', meaning: 'Restroom', place: 'Arashiyama Station' }
];

const icons = {
  arrow: '<svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>',
  camera: '<svg viewBox="0 0 24 24"><path d="M4 7h3l1.4-2h7.2L17 7h3v12H4z"/><circle cx="12" cy="13" r="3.2"/></svg>',
  image: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.4"/><path d="m5 18 5-5 3 3 2-2 4 4"/></svg>',
  swap: '<svg viewBox="0 0 24 24"><path d="M7 7h11M15 3l4 4-4 4M17 17H6M9 21l-4-4 4-4"/></svg>',
  home: '<svg viewBox="0 0 24 24"><path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-6h6v6"/></svg>',
  book: '<svg viewBox="0 0 24 24"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 5.5v16"/></svg>',
  map: '<svg viewBox="0 0 24 24"><path d="m9 18-6 3V6l6-3 6 3 6-3v15l-6 3z"/><path d="M9 3v15M15 6v15"/></svg>',
  spark: '<svg viewBox="0 0 24 24"><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="10.7" cy="10.7" r="6.7"/><path d="m16 16 4.4 4.4"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg>'
};

// Destinations the user can pick from. Each has a flag emoji, city, country, and language tag.
const destinations = [
  { city: 'Kyoto', country: 'Japan', flag: '🌸', lang: 'Japanese', langCode: 'ja' },
  { city: 'Paris', country: 'France', flag: '🥐', lang: 'French', langCode: 'fr' },
  { city: 'Rome', country: 'Italy', flag: '🏛️', lang: 'Italian', langCode: 'it' },
  { city: 'Barcelona', country: 'Spain', flag: '💃', lang: 'Spanish', langCode: 'es' },
  { city: 'Seoul', country: 'South Korea', flag: '🍡', lang: 'Korean', langCode: 'ko' },
  { city: 'Bangkok', country: 'Thailand', flag: '🛕', lang: 'Thai', langCode: 'th' },
  { city: 'Lisbon', country: 'Portugal', flag: '🌊', lang: 'Portuguese', langCode: 'pt' },
  { city: 'Berlin', country: 'Germany', flag: '🍺', lang: 'German', langCode: 'de' },
  { city: 'Istanbul', country: 'Türkiye', flag: '🕌', lang: 'Turkish', langCode: 'tr' },
  { city: 'Mexico City', country: 'Mexico', flag: '🌮', lang: 'Spanish', langCode: 'es' },
  { city: 'Cairo', country: 'Egypt', flag: '🐫', lang: 'Arabic', langCode: 'ar' },
  { city: 'Amsterdam', country: 'Netherlands', flag: '🌷', lang: 'Dutch', langCode: 'nl' },
  { city: 'Tokyo', country: 'Japan', flag: '🇯🇵', lang: 'Japanese', langCode: 'ja' },
  { city: 'Osaka', country: 'Japan', flag: '🇯🇵', lang: 'Japanese', langCode: 'ja' },
  { city: 'Busan', country: 'South Korea', flag: '🇰🇷', lang: 'Korean', langCode: 'ko' },
  { city: 'Shanghai', country: 'China', flag: '🇨🇳', lang: 'Mandarin', langCode: 'zh' },
  { city: 'Beijing', country: 'China', flag: '🇨🇳', lang: 'Mandarin', langCode: 'zh' },
  { city: 'Hong Kong', country: 'China', flag: '🇭🇰', lang: 'Cantonese', langCode: 'zh' },
  { city: 'Taipei', country: 'Taiwan', flag: '🇹🇼', lang: 'Mandarin', langCode: 'zh' },
  { city: 'Chiang Mai', country: 'Thailand', flag: '🇹🇭', lang: 'Thai', langCode: 'th' },
  { city: 'Singapore', country: 'Singapore', flag: '🇸🇬', lang: 'English', langCode: 'en' },
  { city: 'Kuala Lumpur', country: 'Malaysia', flag: '🇲🇾', lang: 'Malay', langCode: 'ms' },
  { city: 'Bali', country: 'Indonesia', flag: '🇮🇩', lang: 'Indonesian', langCode: 'id' },
  { city: 'Jakarta', country: 'Indonesia', flag: '🇮🇩', lang: 'Indonesian', langCode: 'id' },
  { city: 'Hanoi', country: 'Vietnam', flag: '🇻🇳', lang: 'Vietnamese', langCode: 'vi' },
  { city: 'Ho Chi Minh City', country: 'Vietnam', flag: '🇻🇳', lang: 'Vietnamese', langCode: 'vi' },
  { city: 'Manila', country: 'Philippines', flag: '🇵🇭', lang: 'Filipino', langCode: 'tl' },
  { city: 'Phnom Penh', country: 'Cambodia', flag: '🇰🇭', lang: 'Khmer', langCode: 'km' },
  { city: 'Luang Prabang', country: 'Laos', flag: '🇱🇦', lang: 'Lao', langCode: 'lo' },
  { city: 'Yangon', country: 'Myanmar', flag: '🇲🇲', lang: 'Burmese', langCode: 'my' },
  { city: 'Kathmandu', country: 'Nepal', flag: '🇳🇵', lang: 'Nepali', langCode: 'ne' },
  { city: 'New Delhi', country: 'India', flag: '🇮🇳', lang: 'Hindi', langCode: 'hi' },
  { city: 'Mumbai', country: 'India', flag: '🇮🇳', lang: 'Hindi', langCode: 'hi' },
  { city: 'Jaipur', country: 'India', flag: '🇮🇳', lang: 'Hindi', langCode: 'hi' },
  { city: 'Dubai', country: 'UAE', flag: '🇦🇪', lang: 'Arabic', langCode: 'ar' },
  { city: 'Abu Dhabi', country: 'UAE', flag: '🇦🇪', lang: 'Arabic', langCode: 'ar' },
  { city: 'Doha', country: 'Qatar', flag: '🇶🇦', lang: 'Arabic', langCode: 'ar' },
  { city: 'Tel Aviv', country: 'Israel', flag: '🇮🇱', lang: 'Hebrew', langCode: 'he' },
  { city: 'Jerusalem', country: 'Israel', flag: '🇮🇱', lang: 'Hebrew', langCode: 'he' },
  { city: 'Antalya', country: 'Türkiye', flag: '🇹🇷', lang: 'Turkish', langCode: 'tr' },
  { city: 'Amman', country: 'Jordan', flag: '🇯🇴', lang: 'Arabic', langCode: 'ar' },
  { city: 'Beirut', country: 'Lebanon', flag: '🇱🇧', lang: 'Arabic', langCode: 'ar' },
  { city: 'Muscat', country: 'Oman', flag: '🇴🇲', lang: 'Arabic', langCode: 'ar' },
  { city: 'Tbilisi', country: 'Georgia', flag: '🇬🇪', lang: 'Georgian', langCode: 'ka' },
  { city: 'Yerevan', country: 'Armenia', flag: '🇦🇲', lang: 'Armenian', langCode: 'hy' },
  { city: 'Baku', country: 'Azerbaijan', flag: '🇦🇿', lang: 'Azerbaijani', langCode: 'az' },
  { city: 'Almaty', country: 'Kazakhstan', flag: '🇰🇿', lang: 'Kazakh', langCode: 'kk' },
  { city: 'Ulaanbaatar', country: 'Mongolia', flag: '🇲🇳', lang: 'Mongolian', langCode: 'mn' },
  { city: 'Nice', country: 'France', flag: '🇫🇷', lang: 'French', langCode: 'fr' },
  { city: 'Florence', country: 'Italy', flag: '🇮🇹', lang: 'Italian', langCode: 'it' },
  { city: 'Venice', country: 'Italy', flag: '🇮🇹', lang: 'Italian', langCode: 'it' },
  { city: 'Milan', country: 'Italy', flag: '🇮🇹', lang: 'Italian', langCode: 'it' },
  { city: 'Madrid', country: 'Spain', flag: '🇪🇸', lang: 'Spanish', langCode: 'es' },
  { city: 'Seville', country: 'Spain', flag: '🇪🇸', lang: 'Spanish', langCode: 'es' },
  { city: 'Granada', country: 'Spain', flag: '🇪🇸', lang: 'Spanish', langCode: 'es' },
  { city: 'Porto', country: 'Portugal', flag: '🇵🇹', lang: 'Portuguese', langCode: 'pt' },
  { city: 'Munich', country: 'Germany', flag: '🇩🇪', lang: 'German', langCode: 'de' },
  { city: 'Hamburg', country: 'Germany', flag: '🇩🇪', lang: 'German', langCode: 'de' },
  { city: 'Rotterdam', country: 'Netherlands', flag: '🇳🇱', lang: 'Dutch', langCode: 'nl' },
  { city: 'Brussels', country: 'Belgium', flag: '🇧🇪', lang: 'French', langCode: 'fr' },
  { city: 'Bruges', country: 'Belgium', flag: '🇧🇪', lang: 'Dutch', langCode: 'nl' },
  { city: 'Vienna', country: 'Austria', flag: '🇦🇹', lang: 'German', langCode: 'de' },
  { city: 'Prague', country: 'Czechia', flag: '🇨🇿', lang: 'Czech', langCode: 'cs' },
  { city: 'Budapest', country: 'Hungary', flag: '🇭🇺', lang: 'Hungarian', langCode: 'hu' },
  { city: 'Warsaw', country: 'Poland', flag: '🇵🇱', lang: 'Polish', langCode: 'pl' },
  { city: 'Krakow', country: 'Poland', flag: '🇵🇱', lang: 'Polish', langCode: 'pl' },
  { city: 'Athens', country: 'Greece', flag: '🇬🇷', lang: 'Greek', langCode: 'el' },
  { city: 'Santorini', country: 'Greece', flag: '🇬🇷', lang: 'Greek', langCode: 'el' },
  { city: 'Copenhagen', country: 'Denmark', flag: '🇩🇰', lang: 'Danish', langCode: 'da' },
  { city: 'Stockholm', country: 'Sweden', flag: '🇸🇪', lang: 'Swedish', langCode: 'sv' },
  { city: 'Oslo', country: 'Norway', flag: '🇳🇴', lang: 'Norwegian', langCode: 'no' },
  { city: 'Bergen', country: 'Norway', flag: '🇳🇴', lang: 'Norwegian', langCode: 'no' },
  { city: 'Helsinki', country: 'Finland', flag: '🇫🇮', lang: 'Finnish', langCode: 'fi' },
  { city: 'Riga', country: 'Latvia', flag: '🇱🇻', lang: 'Latvian', langCode: 'lv' },
  { city: 'Tallinn', country: 'Estonia', flag: '🇪🇪', lang: 'Estonian', langCode: 'et' },
  { city: 'Vilnius', country: 'Lithuania', flag: '🇱🇹', lang: 'Lithuanian', langCode: 'lt' },
  { city: 'Dublin', country: 'Ireland', flag: '🇮🇪', lang: 'Irish', langCode: 'ga' },
  { city: 'Edinburgh', country: 'Scotland', flag: '🏴', lang: 'English', langCode: 'en' },
  { city: 'London', country: 'England', flag: '🇬🇧', lang: 'English', langCode: 'en' },
  { city: 'Zurich', country: 'Switzerland', flag: '🇨🇭', lang: 'German', langCode: 'de' },
  { city: 'Geneva', country: 'Switzerland', flag: '🇨🇭', lang: 'French', langCode: 'fr' },
  { city: 'Interlaken', country: 'Switzerland', flag: '🇨🇭', lang: 'German', langCode: 'de' },
  { city: 'Reykjavik', country: 'Iceland', flag: '🇮🇸', lang: 'Icelandic', langCode: 'is' },
  { city: 'Zagreb', country: 'Croatia', flag: '🇭🇷', lang: 'Croatian', langCode: 'hr' },
  { city: 'Split', country: 'Croatia', flag: '🇭🇷', lang: 'Croatian', langCode: 'hr' },
  { city: 'Dubrovnik', country: 'Croatia', flag: '🇭🇷', lang: 'Croatian', langCode: 'hr' },
  { city: 'Ljubljana', country: 'Slovenia', flag: '🇸🇮', lang: 'Slovene', langCode: 'sl' },
  { city: 'Bratislava', country: 'Slovakia', flag: '🇸🇰', lang: 'Slovak', langCode: 'sk' },
  { city: 'Belgrade', country: 'Serbia', flag: '🇷🇸', lang: 'Serbian', langCode: 'sr' },
  { city: 'Sarajevo', country: 'Bosnia and Herzegovina', flag: '🇧🇦', lang: 'Bosnian', langCode: 'bs' },
  { city: 'Skopje', country: 'North Macedonia', flag: '🇲🇰', lang: 'Macedonian', langCode: 'mk' },
  { city: 'Tirana', country: 'Albania', flag: '🇦🇱', lang: 'Albanian', langCode: 'sq' },
  { city: 'Sofia', country: 'Bulgaria', flag: '🇧🇬', lang: 'Bulgarian', langCode: 'bg' },
  { city: 'Bucharest', country: 'Romania', flag: '🇷🇴', lang: 'Romanian', langCode: 'ro' },
  { city: 'Kyiv', country: 'Ukraine', flag: '🇺🇦', lang: 'Ukrainian', langCode: 'uk' },
  { city: 'Moscow', country: 'Russia', flag: '🇷🇺', lang: 'Russian', langCode: 'ru' },
  { city: 'Saint Petersburg', country: 'Russia', flag: '🇷🇺', lang: 'Russian', langCode: 'ru' },
  { city: 'Marrakech', country: 'Morocco', flag: '🇲🇦', lang: 'Arabic', langCode: 'ar' },
  { city: 'Tunis', country: 'Tunisia', flag: '🇹🇳', lang: 'Arabic', langCode: 'ar' },
  { city: 'Accra', country: 'Ghana', flag: '🇬🇭', lang: 'English', langCode: 'en' },
  { city: 'Lagos', country: 'Nigeria', flag: '🇳🇬', lang: 'English', langCode: 'en' },
  { city: 'Nairobi', country: 'Kenya', flag: '🇰🇪', lang: 'Swahili', langCode: 'sw' },
  { city: 'Zanzibar', country: 'Tanzania', flag: '🇹🇿', lang: 'Swahili', langCode: 'sw' },
  { city: 'Cape Town', country: 'South Africa', flag: '🇿🇦', lang: 'English', langCode: 'en' },
  { city: 'Addis Ababa', country: 'Ethiopia', flag: '🇪🇹', lang: 'Amharic', langCode: 'am' },
  { city: 'Dakar', country: 'Senegal', flag: '🇸🇳', lang: 'French', langCode: 'fr' },
  { city: 'Cancun', country: 'Mexico', flag: '🇲🇽', lang: 'Spanish', langCode: 'es' },
  { city: 'Oaxaca', country: 'Mexico', flag: '🇲🇽', lang: 'Spanish', langCode: 'es' },
  { city: 'New York', country: 'USA', flag: '🇺🇸', lang: 'English', langCode: 'en' },
  { city: 'Los Angeles', country: 'USA', flag: '🇺🇸', lang: 'English', langCode: 'en' },
  { city: 'San Francisco', country: 'USA', flag: '🇺🇸', lang: 'English', langCode: 'en' },
  { city: 'Miami', country: 'USA', flag: '🇺🇸', lang: 'English', langCode: 'en' },
  { city: 'Honolulu', country: 'USA', flag: '🇺🇸', lang: 'English', langCode: 'en' },
  { city: 'Vancouver', country: 'Canada', flag: '🇨🇦', lang: 'English', langCode: 'en' },
  { city: 'Toronto', country: 'Canada', flag: '🇨🇦', lang: 'English', langCode: 'en' },
  { city: 'Montreal', country: 'Canada', flag: '🇨🇦', lang: 'French', langCode: 'fr' },
  { city: 'Quebec City', country: 'Canada', flag: '🇨🇦', lang: 'French', langCode: 'fr' },
  { city: 'Rio de Janeiro', country: 'Brazil', flag: '🇧🇷', lang: 'Portuguese', langCode: 'pt' },
  { city: 'Sao Paulo', country: 'Brazil', flag: '🇧🇷', lang: 'Portuguese', langCode: 'pt' },
  { city: 'Buenos Aires', country: 'Argentina', flag: '🇦🇷', lang: 'Spanish', langCode: 'es' },
  { city: 'Cusco', country: 'Peru', flag: '🇵🇪', lang: 'Spanish', langCode: 'es' },
  { city: 'Lima', country: 'Peru', flag: '🇵🇪', lang: 'Spanish', langCode: 'es' },
  { city: 'Santiago', country: 'Chile', flag: '🇨🇱', lang: 'Spanish', langCode: 'es' },
  { city: 'Bogota', country: 'Colombia', flag: '🇨🇴', lang: 'Spanish', langCode: 'es' },
  { city: 'Medellin', country: 'Colombia', flag: '🇨🇴', lang: 'Spanish', langCode: 'es' },
  { city: 'Cartagena', country: 'Colombia', flag: '🇨🇴', lang: 'Spanish', langCode: 'es' },
  { city: 'Havana', country: 'Cuba', flag: '🇨🇺', lang: 'Spanish', langCode: 'es' },
  { city: 'Quito', country: 'Ecuador', flag: '🇪🇨', lang: 'Spanish', langCode: 'es' },
  { city: 'Guatemala City', country: 'Guatemala', flag: '🇬🇹', lang: 'Spanish', langCode: 'es' },
  { city: 'San Jose', country: 'Costa Rica', flag: '🇨🇷', lang: 'Spanish', langCode: 'es' },
  { city: 'Panama City', country: 'Panama', flag: '🇵🇦', lang: 'Spanish', langCode: 'es' },
  { city: 'Sydney', country: 'Australia', flag: '🇦🇺', lang: 'English', langCode: 'en' },
  { city: 'Melbourne', country: 'Australia', flag: '🇦🇺', lang: 'English', langCode: 'en' },
  { city: 'Auckland', country: 'New Zealand', flag: '🇳🇿', lang: 'English', langCode: 'en' },
  { city: 'Queenstown', country: 'New Zealand', flag: '🇳🇿', lang: 'English', langCode: 'en' },
  { city: 'Suva', country: 'Fiji', flag: '🇫🇯', lang: 'English', langCode: 'en' }
];

const data = {
  trip: { name: 'Spring in Kyoto', place: 'Kyoto, Japan', flag: '🌸', lang: 'Japanese', langCode: 'ja', dates: 'Mar 24 – Apr 7', dateStart: '', dateEnd: '' },
  vocab: [],
  pastTrips: []
};

let state = { screen: 'welcome', mode: 'learn', showQuiz: false, quizAnswered: false, query: '', category: 'All', uploadedImage: '', analysis: null, scanError: '' };
const app = document.querySelector('#app');

// System prompt + GLM request shape, mirrored from api/analyze.js so the
// client-side call behaves identically to the old serverless function.
const ANALYZE_SYSTEM_PROMPT = `You are Roamly, a kind travel-language companion. Analyse a photo containing foreign-language text. Return ONLY valid JSON with this exact shape:
{
  "detectedText":"...",
  "translation":"...",
  "romanisation":"...",
  "naturalNote":"...",
  "vocabulary":[{
    "word":"...", "reading":"...", "meaning":"...", "category":"Food|Transport|Shopping|Hotels|Directions|Signs", "importance":"high|medium", "box":{"x":0,"y":0,"width":0,"height":0}
  }]
}
Choose at most 5 useful, common travel words. Coordinates must be normalized 0–1000 relative to the image, and the translation should sound natural in English.`;

// Calls Z.AI's GLM vision model. If glmProxyUrl is set in config.js, requests
// go through the proxy (key stays hidden). Otherwise calls GLM directly (key
// is public in the browser — use a throwaway key).
async function analyzeImageClientSide(dataUrl) {
  const config = window.ROAMLY_CONFIG || {};

  // OPTION A: use proxy (key hidden server-side)
  if (config.glmProxyUrl) {
    const proxyResp = await fetch(config.glmProxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: dataUrl })
    });
    if (!proxyResp.ok) {
      const err = await proxyResp.json().catch(() => ({}));
      throw new Error(err.error || `The translation service is unavailable (${proxyResp.status}).`);
    }
    const data = await proxyResp.json();
    return parseGLMJson(data.content || '');
  }

  // OPTION B: call GLM directly (key is public in config.js)
  if (!config.glmApiKey || config.glmApiKey === 'PASTE-YOUR-THROWAWAY-ZAI-KEY-HERE') {
    throw new Error("Roamly's API key isn't configured. Open config.js and paste a Z.AI key.");
  }
  const glmResponse = await fetch(config.glmEndpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.glmApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.glmModel || 'glm-5v-turbo',
      messages: [{ role: 'user', content: [{ type: 'image_url', image_url: { url: dataUrl } }, { type: 'text', text: ANALYZE_SYSTEM_PROMPT }] }],
      thinking: { type: 'disabled' },
      temperature: 0.2
    })
  });
  if (!glmResponse.ok) throw new Error(`The translation service is unavailable (GLM ${glmResponse.status}).`);
  const glmData = await glmResponse.json();
  const content = glmData.choices?.[0]?.message?.content || '';
  return parseGLMJson(content);
}

// Robustly parse the JSON object out of GLM's response. GLM often wraps output
// in ```json fences, sometimes emits raw control characters inside strings, and
// occasionally produces malformed JSON (e.g. {"x":115,135,485,935} for box
// coordinates). This tries strict parse first, then repairs common issues,
// then falls back to regex field extraction so we always return something.
function parseGLMJson(content) {
  if (!content || typeof content !== 'string') {
    throw new Error('The AI returned an empty response. Please try another photo.');
  }
  // 1. Strip ```json fences and extract the outermost { ... } block
  let text = content.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    text = text.slice(firstBrace, lastBrace + 1);
  }
  // 2. Try strict parse
  try { return JSON.parse(text); } catch (e) { /* continue to repairs */ }
  // 3. Escape raw control characters inside string values
  const escaped = text.replace(/("(?:\\.|[^"\\])*")/g, (m) =>
    m.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t'));
  try { return JSON.parse(escaped); } catch (e) { /* continue to repairs */ }
  // 4. Fix malformed box objects: GLM sometimes writes {"x":115,135,485,935}
  //    instead of {"x":115,"y":135,"width":485,"height":935}. Detect the
  //    pattern "box":{"x":<num>,<num>,<num>,<num>} and rewrite it.
  const boxFixed = escaped.replace(
    /"box"\s*:\s*\{\s*"x"\s*:\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\}/g,
    '"box":{"x":$1,"y":$2,"width":$3,"height":$4}');
  try { return JSON.parse(boxFixed); } catch (e) { /* continue to fallback */ }
  // 5. Last resort: extract fields individually with regex so the user still
  //    gets a result even if the JSON is unrecoverably broken.
  return extractFieldsFallback(boxFixed);
}

// Regex-based fallback that pulls the top-level fields out of a broken JSON
// string. Vocabulary items are extracted individually so one bad entry doesn't
// discard the rest.
function extractFieldsFallback(text) {
  const getStr = (key) => {
    const m = text.match(new RegExp('"' + key + '"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"'));
    return m ? m[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : '';
  };
  const vocabMatches = [...text.matchAll(/"word"\s*:\s*"((?:[^"\\]|\\.)*)"\s*,\s*"reading"\s*:\s*"((?:[^"\\]|\\.)*)"\s*,\s*"meaning"\s*:\s*"((?:[^"\\]|\\.)*)"(?:[\s\S]*?"category"\s*:\s*"([^"]*)")?/g)];
  const vocabulary = vocabMatches.map(m => ({
    word: (m[1] || '').replace(/\\"/g, '"'),
    reading: (m[2] || '').replace(/\\"/g, '"'),
    meaning: (m[3] || '').replace(/\\"/g, '"'),
    category: m[4] || 'Signs'
  }));
  const result = {
    detectedText: getStr('detectedText'),
    translation: getStr('translation'),
    romanisation: getStr('romanisation'),
    naturalNote: getStr('naturalNote'),
    vocabulary
  };
  if (!result.translation && vocabulary.length === 0) {
    throw new Error('Could not read the AI response. Please try a clearer photo.');
  }
  return result;
}
const button = (label, cls = '', action = '') => `<button class="${cls}" data-action="${action}">${label}</button>`;
const icon = (name) => icons[name] || '';

function shell(content, active = 'home') {
  return `<div class="app-shell">
    <header class="topbar"><button class="wordmark" data-action="home">roamly<span>·</span></button><div class="top-actions"><button class="trip-pill" data-action="trip"><b>${data.trip.flag}</b><span>${data.trip.name}</span>${icon('arrow')}</button><button class="avatar">AZ</button></div></header>
    ${content}
    <nav class="bottom-nav"><button class="${active === 'home' ? 'active' : ''}" data-action="home">${icon('home')}<span>Home</span></button><button class="${active === 'scan' ? 'active' : ''}" data-action="scan">${icon('camera')}<span>Scan</span></button><button class="${active === 'vocab' ? 'active' : ''}" data-action="vocab">${icon('book')}<span>Words</span></button><button class="${active === 'trip' ? 'active' : ''}" data-action="trip">${icon('map')}<span>Trip</span></button></nav>
  </div>`;
}

function welcome() {
  app.innerHTML = `<section class="welcome">
    <div class="welcome-art"><div class="travel-card card-one"><b>bonjour</b></div><div class="travel-card card-two"><b>こんにちは</b></div><div class="travel-card card-three"><b>hola</b></div><div class="phrasebook"><div class="book-lines"><i></i><i></i><i></i></div><b>ROAM<br>PHRASES</b><span>✦</span></div><div class="pin">⌖</div><div class="ticket-stub">LANGUAGE<br>PASS</div></div>
    <div class="welcome-copy"><p class="eyebrow">YOUR TRAVEL LANGUAGE COMPANION</p><h1>Learn the <i>world</i><br>as you see it.</h1><p class="subcopy">Every sign, menu, and small discovery can become part of your story.</p></div>
    <button class="primary full" data-action="setup">Begin a trip <span>${icon('arrow')}</span></button>
    <p class="signin">Already exploring? <button data-action="home">Continue your trip</button></p>
  </section>`;
}

function setup() {
  const selectedDest = destinations.find(d => `${d.city}, ${d.country}` === data.trip.place) || destinations[0];
  app.innerHTML = `<section class="setup-page">
   <button class="back" data-action="welcome">←</button><div class="setup-head"><p class="eyebrow">FIRST, LET'S SET THE SCENE</p><h1>Where are you<br><i>roaming?</i></h1></div>
   <div class="place-card" id="dest-toggle"><div class="place-flag">${data.trip.flag}</div><div><span>Destination</span><strong>${data.trip.place}</strong></div>${icon('arrow')}</div>
   <div class="dest-picker" id="dest-picker"><input class="dest-search" id="dest-search" type="text" placeholder="Type a city, country, or language…" autocomplete="off"><div class="dest-list" id="dest-list">${destinations.map(d => destOption(d)).join('')}</div><p class="dest-hint">or pick from a few favourites below</p></div>
   <div class="form-row"><div><label>Trip name</label><input value="${data.trip.name}" data-field="tripName" /></div><div><label>Dates</label><div class="date-display" id="date-display">${data.trip.dates || 'Tap to choose dates'}</div></div></div>
   <div class="calendar-wrap" id="calendar-wrap"></div>
   <div class="memory-note"><div>♡</div><p>We'll keep every word you meet here in one lovely little Phrasebook.</p></div>
   <button class="primary full" data-action="startChapter">Start this chapter <span>${icon('arrow')}</span></button>
  </section>`;
  // Wire up destination picker: search-as-you-type filter over every city
  const picker = document.getElementById('dest-picker');
  const search = document.getElementById('dest-search');
  picker.style.display = 'none';
  document.getElementById('dest-toggle').addEventListener('click', () => { picker.style.display = picker.style.display === 'none' ? 'block' : 'none'; if (picker.style.display !== 'none') search.focus(); });
  search.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    const matches = destinations.filter(d => d.city.toLowerCase().includes(q) || d.country.toLowerCase().includes(q) || d.lang.toLowerCase().includes(q));
    document.getElementById('dest-list').innerHTML = matches.map(destOption).join('') || '<p class="dest-hint">No cities match — try another spelling</p>';
  });
  picker.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-dest]');
    if (!btn) return;
    const [city, country, flag, lang, langCode] = btn.dataset.dest.split('|');
    data.trip.place = `${city}, ${country}`; data.trip.flag = flag; data.trip.lang = lang; data.trip.langCode = langCode;
    data.trip.name = data.trip.name || `${city} adventure`;
    search.value = ''; picker.style.display = 'none'; render();
  });
  // Wire up trip name input
  document.querySelector('[data-field="tripName"]')?.addEventListener('input', (e) => { data.trip.name = e.target.value; });
  // Wire up calendar: hidden until the dates row is tapped; stays open while picking
  const calendarWrap = document.getElementById('calendar-wrap');
  calendarWrap.style.display = 'none';
  document.getElementById('date-display').addEventListener('click', () => { calendarWrap.style.display = calendarWrap.style.display === 'none' ? 'block' : 'none'; });
  buildCalendar();
}

// Lightweight calendar: user taps a start day, then an end day.
let calState = { month: new Date().getMonth(), year: new Date().getFullYear(), start: null, end: null };
function buildCalendar() {
  const wrap = document.getElementById('calendar-wrap');
  if (!wrap) return;
  // Restore from saved dates
  if (data.trip.dateStart) calState.start = new Date(data.trip.dateStart);
  if (data.trip.dateEnd) calState.end = new Date(data.trip.dateEnd);
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const days = ['S','M','T','W','T','F','S'];
  const y = calState.year, m = calState.month;
  const firstDay = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  let cells = '';
  for (let i = 0; i < firstDay; i++) cells += '<i class="cal-blank"></i>';
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(y, m, d);
    const ts = date.getTime();
    let cls = 'cal-day';
    if (calState.start && ts === calState.start.getTime()) cls += ' cal-start';
    if (calState.end && ts === calState.end.getTime()) cls += ' cal-end';
    if (calState.start && calState.end && ts > calState.start.getTime() && ts < calState.end.getTime()) cls += ' cal-in-range';
    cells += `<button class="${cls}" data-cal-day="${d}">${d}</button>`;
  }
  wrap.innerHTML = `<div class="cal-header"><button id="cal-prev" ${m === 0 && y === new Date().getFullYear() ? 'disabled' : ''}>←</button><b>${months[m]} ${y}</b><button id="cal-next">→</button></div><div class="cal-weekdays">${days.map(dd => `<span>${dd}</span>`).join('')}</div><div class="cal-grid">${cells}</div>`;
  // Wire up day clicks
  wrap.querySelectorAll('[data-cal-day]').forEach(btn => btn.addEventListener('click', (e) => {
    const d = parseInt(e.currentTarget.dataset.calDay);
    const date = new Date(y, m, d);
    if (!calState.start || (calState.start && calState.end)) { calState.start = date; calState.end = null; }
    else if (date < calState.start) { calState.end = calState.start; calState.start = date; }
    else { calState.end = date; }
    if (calState.start && calState.end) {
      data.trip.dateStart = calState.start.toISOString();
      data.trip.dateEnd = calState.end.toISOString();
      const fmt = (dt) => `${months[dt.getMonth()].slice(0,3)} ${dt.getDate()}`;
      data.trip.dates = `${fmt(calState.start)} – ${fmt(calState.end)}`;
      const display = document.getElementById('date-display');
      if (display) display.textContent = data.trip.dates;
    }
    buildCalendar();
  }));
  document.getElementById('cal-prev')?.addEventListener('click', () => { if (m === 0) { calState.month = 11; calState.year--; } else calState.month--; buildCalendar(); });
  document.getElementById('cal-next')?.addEventListener('click', () => { if (m === 11) { calState.month = 0; calState.year++; } else calState.month++; buildCalendar(); });
  // NOTE: the calendar stays open after selecting dates — the toggle in setup()
  // controls visibility, and selecting a start/end day never closes it.
}

function memory() {
  // Separate page shown right after setup when a past trip shared this language.
  const match = findMatchingLangTrip(data.trip.langCode);
  if (!match) { state.screen = 'modeChoice'; return render(); }
  app.innerHTML = `<section class="mode-choice-page">
    <button class="back" data-action="setup">←</button>
    <div class="choice-top"><span class="trip-mini">↻</span><p class="eyebrow">A PAST ${data.trip.lang.toUpperCase()} TRIP</p><h1>Rejog your<br><i>memory?</i></h1><p>You learned ${match.vocabCount} ${match.lang} words during your ${match.place} trip. A fast quiz will wake them up again before you roam.</p></div>
    <div class="memory-preview">${(match.vocab || []).slice(0, 4).map(w => `<span>${w.word}</span>`).join('')}</div>
    <button class="primary full" data-action="memoryQuiz">${icon('spark')} Yes — quiz me <span>${icon('arrow')}</span></button>
    <button class="choice-later" data-action="modeChoice">Skip for now — show me the modes</button>
  </section>`;
}

function modeChoice() {
  app.innerHTML = `<section class="mode-choice-page">
    <div class="choice-top"><span class="trip-mini">${data.trip.flag}</span><p class="eyebrow">${data.trip.name.toUpperCase()} IS READY</p><h1>How would you like<br>to <i>explore?</i></h1><p>Choose what feels right for this moment. You can switch whenever you need to.</p></div>
    <label class="mode-option learn-option"><input type="file" accept="image/*" data-upload-mode="learn"><span class="option-icon">✦</span><div><b>Learn as you translate</b><p>Upload a photo and we'll pull out helpful words to keep.</p><small>UPLOAD A PHOTO <span>→</span></small></div></label>
    <label class="mode-option translate-option"><input type="file" accept="image/*" data-upload-mode="translate"><span class="option-icon">あ</span><div><b>Just translate</b><p>Upload a sign, menu, or ticket for a quick translation.</p><small>UPLOAD A PHOTO <span>→</span></small></div></label>
    <button class="choice-later" data-action="home">Maybe later — take me to my trip</button>
  </section>`;
}

function dashboard() {
 return shell(`<section class="page dashboard"><div class="greeting"><div><p class="eyebrow">FRIDAY, MARCH 28</p><h1>Ohayō, Amber <span>☀︎</span></h1><p>Ready for another little discovery?</p></div><div class="streak"><b>7</b><span>day<br>streak</span></div></div>
 <section class="today-card"><div class="today-decoration">⌁</div><p class="eyebrow">TODAY'S LITTLE MOMENT</p><h2>Let the world around you<br>teach you something.</h2><p>Point, scan, and let curiosity do the rest.</p><button class="dark-btn" data-action="scan">Scan what you see ${icon('camera')}</button></section>
 <div class="stats-grid"><div><strong>24</strong><span>words met</span></div><div><strong>8</strong><span>scans made</span></div><div><strong>71<small>%</small></strong><span>remembered</span></div></div>
 <div class="section-heading"><div><p class="eyebrow">A GENTLE REFRESH</p><h2>Say hello again</h2></div><button data-action="vocab">See all ${icon('arrow')}</button></div>
 <div class="review-card"><div class="review-word"><span>入口</span><small>iriguchi</small></div><div class="review-copy"><b>You've met this one before</b><p>at Nishiki Market · 3 times</p><div class="mini-progress"><i style="width:53%"></i></div></div><button class="round-btn" data-action="quiz">${icon('arrow')}</button></div>
 <div class="section-heading recent"><div><p class="eyebrow">YOUR RECENT TRAIL</p><h2>Small discoveries</h2></div></div>
 <div class="trail"><div class="trail-photo market">おすすめ</div><div><b>Morning at Kissa Kōyō</b><p>3 new words · 10:42 am</p></div><span>Food</span></div>
 </section>`, 'home');
}

function scan() {
 const isLearn = state.mode === 'learn';
 return shell(`<section class="page scan-page"><div class="scan-head"><div><p class="eyebrow">${isLearn ? 'MAKE IT STICK, NATURALLY' : 'JUST THE TRANSLATION'}</p><h1>${isLearn ? 'Learn new words<br>as you <i>meet them</i>' : 'Translate<br>what you <i>see.</i>'}</h1></div><button class="mode-switch" data-action="switchMode"><span>${icon('swap')}</span><b>${isLearn ? 'Learn' : 'Translate'}</b><small>mode</small></button></div>
 <div class="scan-tabs"><button class="${isLearn ? 'selected' : ''}" data-action="learn">Learn from it</button><button class="${!isLearn ? 'selected' : ''}" data-action="translate">Quick translate</button></div>
 <div class="camera-area"><div class="scan-corners"></div><div class="camera-symbol">${icon('camera')}</div><b class="snap-heading">Snap the world around you</b><p>Signs, menus, tickets, labels — anything you're curious about.</p><div class="scan-actions"><label class="upload-button">${icon('camera')} Take photo<input type="file" accept="image/*" capture="environment" data-upload-mode="${state.mode}"></label><label class="upload-button light-upload">${icon('image')} Upload<input type="file" accept="image/*" data-upload-mode="${state.mode}"></label></div></div>
 <div class="tip"><span>${icon('spark')}</span><p>${isLearn ? 'We\'ll pull out the words that are most likely to come in handy again.' : 'We\'ll show the natural meaning, pronunciation, and helpful context.'}</p></div>
 </section>`, 'scan');
}

function result() {
 const isLearn = state.mode === 'learn';
 const scan = state.analysis;
 if (!scan) { state.screen = 'scanError'; return render(); }
 const firstWord = scan.vocabulary?.[0] || { word: scan.detectedText, reading: scan.romanisation, meaning: scan.translation, category: 'Signs', box: {x:300,y:350,width:380,height:150} };
 return shell(`<section class="page result-page"><div class="result-top"><button class="back" data-action="scan">←</button><div class="mode-chip">${isLearn ? '✦ Learning from your find' : '◌ Quick translation'}</div><button class="more">•••</button></div>
  <div class="source-preview uploaded-preview" style="background-image:linear-gradient(#173b3d88,#173b3d88),url('${state.uploadedImage}')"><span class="upload-label">Your scan</span>${scan.vocabulary?.slice(0,3).map(v=>`<i class="live-highlight" style="left:${(v.box?.x||0)/10}%;top:${(v.box?.y||0)/10}%;width:${(v.box?.width||200)/10}%;height:${(v.box?.height||80)/10}%"><b>${v.word}</b></i>`).join('')}</div>
  <div class="translation"><p class="eyebrow">YOU'RE LOOKING AT</p><h2>${scan.translation}</h2><p class="reading">${scan.detectedText} <span>${scan.romanisation || ''}</span><button>♬</button></p><p class="natural">${scan.naturalNote}</p></div>
  ${isLearn ? learningPanel(firstWord) : `<div class="translate-note"><span>✦</span><p><b>Sounds more natural:</b> "${scan.translation}"</p></div>`}
  <div class="notebook-nudge"><span>✦</span><p><b>Very cute first meeting!</b><small>${firstWord.word} is now tucked into your Phrasebook.</small></p></div>
  <button class="notebook-cta full" data-action="vocab"><span class="cta-book">▤</span> Open your Phrasebook <span>→</span></button>
  <button class="text-scan-again" data-action="scan">${icon('camera')} Scan something else</button>
 </section>`, 'scan');
}

function loading() {
  app.innerHTML = `<section class="loading-page"><div class="loading-photo" ${state.uploadedImage ? `style="background-image:url('${state.uploadedImage}')"` : ''}></div><div class="scan-orbit"><i></i><i></i><i></i></div><p class="eyebrow">YOUR TRAVEL AI IS LOOKING</p><h1>Finding the words<br>worth <i>keeping.</i></h1><p>Reading the sign, translating naturally, and picking out useful travel vocabulary.</p></section>`;
}

function scanError() { return shell(`<section class="page scan-error"><div class="error-orb">!</div><p class="eyebrow">WE COULDN'T READ THAT ONE</p><h1>Let's give it<br>another <i>try.</i></h1><p>${state.scanError || 'Make sure a valid Z.AI key is set in config.js, then try a clear photo.'}</p><button class="primary full" data-action="scan">${icon('camera')} Try another photo</button></section>`, 'scan'); }

function learningPanel(word) { return `<div class="learning-panel"><div class="section-heading"><div><p class="eyebrow">TAKE A LITTLE WITH YOU</p><h2>Useful words here</h2></div><span class="count">1 worth keeping</span></div>
 <div class="word-row"><div><b>${word.word}</b><small>${word.reading || ''} · ${word.meaning || ''}</small></div><span class="tag directions">${word.category || 'Signs'}</span><button class="save-word" data-action="saved">✓</button></div>
 <div class="first-met"><span>⌖</span><p><b>First met on your ${data.trip.name} trip</b><small>Added from your latest scan</small></p></div>
 <p class="gentle-caption">Words from today appear again later, in gentle little ways.</p></div>`; }

function vocab() {
 const list = data.vocab.filter(v => (state.category === 'All' || v.category === state.category) && `${v.word} ${v.meaning}`.toLowerCase().includes(state.query.toLowerCase()));
 return shell(`<section class="page vocab-page"><div class="vocab-head"><div class="vocab-head-row"><div><p class="eyebrow">YOUR PHRASEBOOK</p><h1>Words you've<br><i>met.</i></h1><p>Collected around ${data.trip.place}</p></div><button class="quiz-fab" data-action="quiz">${icon('spark')} Test yourself</button></div></div><div class="search"><span>${icon('search')}</span><input placeholder="Find a word" value="${state.query}" data-input="query"><button>${icon('x')}</button></div>
 <div class="notebook"><div class="notebook-rings"><i></i><i></i><i></i><i></i></div><div class="notebook-cover"><span>✦</span></div><div class="notebook-pages"><div class="page-tabs">${['All','Food','Transport','Directions','Shopping'].map(c=>`<button class="${state.category===c?'selected':''}" data-category="${c}">${c}</button>`).join('')}</div><div class="page-title"><span>${state.category==='All'?'EVERYTHING I\'VE MET':state.category.toUpperCase()}</span><b>${list.length} little ${list.length===1?'word':'words'}</b></div><div class="word-list">${list.map(v => `<article class="vocab-word"><div class="word-main"><b>${v.word}</b><span>${v.reading}</span></div><div class="word-detail"><strong>${v.meaning}</strong><p>First met at ${v.place} <span>♡</span></p><div class="word-footer"><span class="status ${v.status.replace(' ','-').toLowerCase()}">${v.status}</span><span>seen ${v.seen}×</span></div></div><div class="level"><i style="height:${v.level}%"></i></div></article>`).join('')}</div></div></div>
 </section>`, 'vocab');
}

function trip() {
  const pastTrips = loadPastTrips();
  const notebookColors = ['#f6dd98', '#e7e0f1', '#fce4d6', '#dce8d9', '#d6e9f0', '#fde2c4', '#e8dff5', '#d9eed7', '#f7d9e4', '#e4ecd6'];
  const pastTripList = pastTrips.length
    ? `<div class="past-trips">${pastTrips.map((t, i) => {
        const color = notebookColors[i % notebookColors.length];
        const cityOnly = (t.place || '').split(',')[0].trim() || t.name || 'Trip';
        return `<button class="past-trip-card" style="--nt-color:${color};--nt-color-soft:${color}cc;--nt-color-line:${color}99" data-action="openPastTrip" data-trip-idx="${i}">
          <span class="nt-icon" aria-hidden="true"><span class="nt-spine"></span><span class="nt-page"></span><span class="nt-lines"><i></i><i></i><i></i></span></span>
          <span class="nt-text"><b>${cityOnly}</b><small>${t.dates || (t.savedAt ? new Date(t.savedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '')}</small><span class="nt-count">${t.vocabCount || 0} ${(t.vocabCount === 1) ? 'word' : 'words'}</span></span>
        </button>`;
      }).join('')}</div>`
    : `<div class="past-trips empty"><p>Your past trips will turn into lovely little notebooks here.</p></div>`;
  return shell(`<section class="page trip-page"><div class="trip-hero"><span>${data.trip.flag}</span><p class="eyebrow">CURRENT CHAPTER</p><h1>${data.trip.name}</h1><p>${data.trip.dates} · ${data.trip.place}</p><button data-action="setup">Edit trip</button></div><div class="trip-stats"><div><strong>24</strong><span>words<br>collected</span></div><div><strong>8</strong><span>moments<br>scanned</span></div><div><strong>71%</strong><span>recall<br>rate</span></div></div><div class="section-heading past-trips-heading"><div><p class="eyebrow">YOUR LITTLE NOTEBOOKS</p><h2>Past journeys</h2></div></div>${pastTripList}</section>`, 'trip');
}

function quiz() {
 // Build quiz questions from saved vocab; fall back to starter set if empty
 const pool = (data.vocab.length >= 2 ? data.vocab : starterVocabulary).slice(0, 5);
 if (!state.quiz) state.quiz = { idx: 0, score: 0, answered: false, picked: null, order: shuffle(pool.map((_, i) => i)).slice(0, Math.min(3, pool.length)) };
 const q = state.quiz;
 const word = pool[q.order[q.idx]];
 if (!word) { // finished
   return shell(`<section class="page quiz-page"><button class="back" data-action="home">←</button><div class="quiz-done"><div class="quiz-flower">✦</div><p class="eyebrow">ALL DONE</p><h1>${q.score} out of ${q.order.length}<br><i>nice work!</i></h1><p>You remembered ${q.score} ${q.score===1?'word':'words'} this round.</p><button class="primary full" data-action="quizRestart">${icon('spark')} Quiz me again</button><button class="text-scan-again" data-action="vocab">Back to my Phrasebook</button></div></section>`, 'home');
 }
 // Generate 3 options: correct + 2 distractors
 const distractors = pool.filter((_, i) => !q.order.includes(i) || i !== q.order[q.idx]).map(w => w.meaning).filter(Boolean);
 const options = shuffle([word.meaning, ...shuffle(distractors).slice(0, 2)]).slice(0, 3);
 const isAnswered = q.answered;
 const isCorrect = q.picked === word.meaning;
 return shell(`<section class="page quiz-page"><button class="back" data-action="home">←</button><div class="quiz-steps">${q.order.map((_, i) => `<i class="${i === q.idx ? 'active' : i < q.idx ? 'done' : ''}"></i>`).join('')}<span>${q.idx + 1} of ${q.order.length}</span></div><div class="quiz-flower">✦</div><p class="eyebrow">A TINY HELLO AGAIN</p><h1>Do you remember<br>what this means?</h1><div class="quiz-word">${word.word}<span>${word.reading || ''}</span></div>${isAnswered ? `<div class="answer-reveal ${isCorrect ? 'correct' : 'wrong'}"><b>${word.meaning}</b><p>${isCorrect ? '✓ Exactly!' : 'Not quite — but now you know.'} You first met this word ${word.place ? 'at ' + word.place : 'on your trip'}.</p></div>` : `<div class="answer-options">${options.map(o => `<button class="${isAnswered && o === word.meaning ? 'correct-mark' : ''}" data-action="answer" data-pick="${o}">${o}</button>`).join('')}</div>`}${isAnswered ? `<button class="primary full quiz-next" data-action="quizNext">${q.idx + 1 < q.order.length ? 'Next word ' + icon('arrow') : 'See results ' + icon('arrow')}</button>` : ''}<p class="quiz-note">No pressure. Getting it wrong is how it starts to stick.</p></section>`, 'home');
 }

function render() {
  try {
    const views = { welcome, setup, modeChoice, memory, home: dashboard, scan, result, loading, scanError, vocab, trip, quiz };
    const html = views[state.screen]();
    // Some screen functions return an HTML string (via shell()), others set
    // app.innerHTML directly. Assign the return value if one was returned.
    if (html) app.innerHTML = html;
  } catch (err) {
    app.innerHTML = `<section style="padding:30px;font-family:monospace;font-size:12px;color:#c00;white-space:pre-wrap;"><b>Render error on screen: ${state.screen}</b>\n\n${(err && err.stack) || err}\n\n<button onclick="state.screen='loading';render()" style="margin-top:20px;padding:10px 20px;font-size:14px;cursor:pointer;">Back</button></section>`;
  }
}
window.chooseTravelMode = (mode) => { state.mode = mode; state.screen = 'scan'; render(); };
function uploadTravelImage(input, mode) {
  const image = input.files?.[0];
  if (!image) return;
  state.mode = mode;
  state.uploadedImage = URL.createObjectURL(image);
  state.analysis = null;
  state.scanError = '';
  state.screen = 'loading';
  render();
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      state.analysis = await analyzeImageClientSide(reader.result);
      const newWords = (state.analysis.vocabulary || []).map(word => ({ word: word.word, reading: word.reading || '', meaning: word.meaning || '', category: word.category || 'Signs', seen: 1, level: 15, status: 'New', place: data.trip.place }));
      data.vocab = [...newWords, ...data.vocab.filter(existing => !newWords.some(word => word.word === existing.word))];
      saveCurrentTrip();
      state.screen = 'result';
    } catch (error) {
      state.scanError = error.message || 'The translation service is unavailable.';
      state.screen = 'scanError';
    }
    render();
  };
  reader.onerror = () => { state.scanError = 'Could not read the image file.'; state.screen = 'scanError'; render(); };
  reader.readAsDataURL(image);
}
app.addEventListener('change', e => { if (e.target.matches('input[type="file"][data-upload-mode]')) uploadTravelImage(e.target, e.target.dataset.uploadMode); });
app.addEventListener('click', e => {
  const target = e.target.closest('[data-action], [data-category]');
  if (!target) return;
  if (target.dataset.category) { state.category = target.dataset.category; render(); return; }
  const a = target.dataset.action;
  // Play the Phrasebook-opening animation before showing the vocab page
  if (a === 'vocab') { openLexicon(); return; }
  if (a === 'welcome'||a==='setup'||a==='modeChoice'||a==='home'||a==='scan'||a==='result'||a==='vocab'||a==='trip'||a==='quiz') state.screen=a;
  if (a === 'startChapter') state.screen = findMatchingLangTrip(data.trip.langCode) ? 'memory' : 'modeChoice';
  if (a === 'memory') state.screen = 'memory';
  if (a === 'memoryQuiz') {
    // Load the past trip's words so the rejog quiz tests what they actually learned.
    const past = findMatchingLangTrip(data.trip.langCode);
    if (past && past.vocab && past.vocab.length) data.vocab = [...past.vocab];
    state.screen = 'quiz';
  }
  if (a === 'learn'||a==='translate') { state.mode=a; state.screen='scan'; }
  if (a==='switchMode') state.mode=state.mode==='learn'?'translate':'learn';
  if (a==='answer') { const pick = target.dataset.pick; if (state.quiz) { state.quiz.picked = pick; state.quiz.answered = true; const pool = (data.vocab.length >= 2 ? data.vocab : starterVocabulary); const word = pool[state.quiz.order[state.quiz.idx]]; if (pick === word?.meaning) state.quiz.score++; } }
  if (a==='quizNext') { if (state.quiz) { state.quiz.idx++; state.quiz.answered = false; state.quiz.picked = null; } }
  if (a==='quizRestart') { state.quiz = null; }
  if (a==='saved') { target.innerHTML='✓'; target.classList.add('is-saved'); }
  if (a==='openPastTrip') {
    const past = loadPastTrips()[parseInt(target.dataset.tripIdx, 10)];
    if (past && past.vocab && past.vocab.length) {
      data.vocab = [...past.vocab];
      openLexicon();
      return;
    } else if (past) {
      data.vocab = [];
      openLexicon();
      return;
    }
  }
  render();
});

// Plays the animated Phrasebook-opening transition (little yellow notebook opening), then shows vocab.
function openLexicon() {
  // Render the vocab page underneath first, so the overlay can fade out onto it.
  state.screen = 'vocab';
  render();
  const overlay = document.createElement('div');
  overlay.className = 'lexicon-transition';
  overlay.innerHTML = `<div class="lexicon-book">
    <div class="lexicon-spread">
      <div class="lexicon-page lexicon-page-left"><i></i><i></i><i></i><i></i><i></i></div>
      <div class="lexicon-page lexicon-page-right"><i></i><i></i><i></i><i></i><i></i></div>
      <div class="lexicon-flip">
        <div class="lexicon-flip-face lexicon-flip-front"><i></i><i></i><i></i><i></i><i></i></div>
        <div class="lexicon-flip-face lexicon-flip-back"><i></i><i></i><i></i><i></i><i></i></div>
      </div>
    </div>
    <div class="lexicon-cover"><span class="lc-title">Phrasebook</span><span class="lc-sub">${data.trip.name.toUpperCase()}</span></div>
  </div>`;
  document.body.appendChild(overlay);
  // Fade the overlay away into the vocab page (smooth, no hard cut).
  setTimeout(() => overlay.classList.add('lexicon-exit'), 1180);
  setTimeout(() => { overlay.remove(); }, 1630);
}
app.addEventListener('input', e => { if(e.target.dataset.input==='query') { state.query=e.target.value; render(); const input=document.querySelector('[data-input="query"]'); input?.focus(); input?.setSelectionRange(state.query.length,state.query.length); } });
render();
