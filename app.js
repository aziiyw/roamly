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

const data = {
  trip: { name: 'Spring in Kyoto', place: 'Kyoto, Japan', flag: '🌸', dates: 'Mar 24 – Apr 7' },
  vocab: []
};

let state = { screen: 'welcome', mode: 'learn', showQuiz: false, quizAnswered: false, query: '', category: 'All', uploadedImage: '', analysis: null, scanError: '' };
const app = document.querySelector('#app');

// DEBUG: surface any uncaught errors visibly on the page so we can see them
// without the browser console. Remove this block once issues are resolved.
window.addEventListener('error', (e) => {
  const dbg = document.createElement('div');
  dbg.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#c00;color:#fff;font:12px monospace;padding:8px;z-index:99999;white-space:pre-wrap;';
  dbg.textContent = 'JS ERROR: ' + (e.error?.stack || e.message);
  document.body.appendChild(dbg);
});

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

// Calls Z.AI's GLM vision model directly from the browser. Used when running
// on GitHub Pages (no server). The key comes from config.js — see the warning
// there; it is public, so use a throwaway key.
async function analyzeImageClientSide(dataUrl) {
  const config = window.ROAMLY_CONFIG || {};
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
  return JSON.parse(content.replace(/^```json\s*|\s*```$/g, '').trim());
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
  app.innerHTML = `<section class="setup-page">
   <button class="back" data-action="welcome">←</button><div class="setup-head"><p class="eyebrow">FIRST, LET'S SET THE SCENE</p><h1>Where are you<br><i>roaming?</i></h1></div>
   <div class="place-card"><div class="place-flag">${data.trip.flag}</div><div><span>Destination</span><strong>${data.trip.place}</strong></div>${icon('arrow')}</div>
   <div class="form-row"><div><label>Trip name</label><input value="${data.trip.name}" /></div><div><label>Dates</label><input value="${data.trip.dates}" /></div></div>
   <div class="memory-note"><div>♡</div><p>We’ll keep every word you meet here in one lovely little memory book.</p></div>
   <button class="primary full" data-action="modeChoice">Start this chapter <span>${icon('arrow')}</span></button>
  </section>`;
}

function modeChoice() {
  app.innerHTML = `<section class="mode-choice-page">
    <div class="choice-top"><span class="trip-mini">${data.trip.flag}</span><p class="eyebrow">${data.trip.name.toUpperCase()} IS READY</p><h1>How would you like<br>to <i>explore?</i></h1><p>Choose what feels right for this moment. You can switch whenever you need to.</p></div>
    <label class="mode-option learn-option"><input type="file" accept="image/*" data-upload-mode="learn"><span class="option-icon">✦</span><div><b>Learn as you translate</b><p>Upload a photo and we’ll pull out helpful words to keep.</p><small>UPLOAD A PHOTO <span>→</span></small></div></label>
    <label class="mode-option translate-option"><input type="file" accept="image/*" data-upload-mode="translate"><span class="option-icon">あ</span><div><b>Just translate</b><p>Upload a sign, menu, or ticket for a quick translation.</p><small>UPLOAD A PHOTO <span>→</span></small></div></label>
    <button class="choice-later" data-action="home">Maybe later — take me to my trip</button>
  </section>`;
}

function dashboard() {
 return shell(`<section class="page dashboard"><div class="greeting"><div><p class="eyebrow">FRIDAY, MARCH 28</p><h1>Ohayō, Amber <span>☀︎</span></h1><p>Ready for another little discovery?</p></div><div class="streak"><b>7</b><span>day<br>streak</span></div></div>
 <section class="today-card"><div class="today-decoration">⌁</div><p class="eyebrow">TODAY'S LITTLE MOMENT</p><h2>Let the street<br>teach you something.</h2><p>Point, scan, and let curiosity do the rest.</p><button class="dark-btn" data-action="scan">Scan what you see ${icon('camera')}</button></section>
 <div class="stats-grid"><div><strong>24</strong><span>words met</span></div><div><strong>8</strong><span>scans made</span></div><div><strong>71<small>%</small></strong><span>remembered</span></div></div>
 <div class="section-heading"><div><p class="eyebrow">A GENTLE NUDGE</p><h2>Say hello again</h2></div><button data-action="vocab">See all ${icon('arrow')}</button></div>
 <div class="review-card"><div class="review-word"><span>入口</span><small>iriguchi</small></div><div class="review-copy"><b>You’ve met this one before</b><p>at Nishiki Market · 3 times</p><div class="mini-progress"><i style="width:53%"></i></div></div><button class="round-btn" data-action="quiz">${icon('arrow')}</button></div>
 <div class="section-heading recent"><div><p class="eyebrow">YOUR RECENT TRAIL</p><h2>Small discoveries</h2></div></div>
 <div class="trail"><div class="trail-photo market">おすすめ</div><div><b>Morning at Kissa Kōyō</b><p>3 new words · 10:42 am</p></div><span>Food</span></div>
 </section>`, 'home');
}

function scan() {
 const isLearn = state.mode === 'learn';
 return shell(`<section class="page scan-page"><div class="scan-head"><div><p class="eyebrow">${isLearn ? 'MAKE IT STICK, NATURALLY' : 'UNDERSTAND IT, NATURALLY'}</p><h1>${isLearn ? 'What did you<br><i>find?</i>' : 'Translate what<br>you <i>see.</i>'}</h1></div><button class="mode-switch" data-action="switchMode"><span>${icon('swap')}</span><b>${isLearn ? 'Learn' : 'Translate'}</b><small>mode</small></button></div>
 <div class="scan-tabs"><button class="${isLearn ? 'selected' : ''}" data-action="learn">Learn from it</button><button class="${!isLearn ? 'selected' : ''}" data-action="translate">Quick translate</button></div>
 <div class="camera-area"><div class="scan-corners"></div><div class="camera-symbol">${icon('camera')}</div><b>Snap the world around you</b><p>Signs, menus, tickets, labels — anything you’re curious about.</p><div class="scan-actions"><label class="upload-button">${icon('camera')} Take photo<input type="file" accept="image/*" capture="environment" data-upload-mode="${state.mode}"></label><label class="upload-button light-upload">${icon('image')} Upload<input type="file" accept="image/*" data-upload-mode="${state.mode}"></label></div></div>
 <div class="tip"><span>${icon('spark')}</span><p>${isLearn ? 'We’ll pull out the words that are most likely to come in handy again.' : 'We’ll show the natural meaning, pronunciation, and helpful context.'}</p></div>
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
  ${isLearn ? learningPanel(firstWord) : `<div class="translate-note"><span>✦</span><p><b>Sounds more natural:</b> “${scan.translation}”</p></div>`}
  <div class="notebook-nudge"><span>✦</span><p><b>Very cute first meeting!</b><small>${firstWord.word} is now tucked into your Kyoto notebook.</small></p></div>
  <button class="notebook-cta full" data-action="vocab"><span class="cta-book">▤</span> Open my little notebook <span>→</span></button>
  <button class="text-scan-again" data-action="scan">${icon('camera')} Scan something else</button>
 </section>`, 'scan');
}

function loading() {
  app.innerHTML = `<section class="loading-page"><div class="loading-photo" ${state.uploadedImage ? `style="background-image:url('${state.uploadedImage}')"` : ''}></div><div class="scan-orbit"><i></i><i></i><i></i></div><p class="eyebrow">YOUR TRAVEL AI IS LOOKING</p><h1>Finding the words<br>worth <i>keeping.</i></h1><p>Reading the sign, translating naturally, and picking out useful travel vocabulary.</p><div class="loading-steps"><span>◌ Reading text</span><span>◌ Translating</span><span>◌ Choosing helpful words</span></div></section>`;
}

function scanError() { return shell(`<section class="page scan-error"><div class="error-orb">!</div><p class="eyebrow">WE COULDN'T READ THAT ONE</p><h1>Let’s give it<br>another <i>try.</i></h1><p>${state.scanError || 'Make sure a valid Z.AI key is set in config.js, then try a clear photo.'}</p><button class="primary full" data-action="scan">${icon('camera')} Try another photo</button></section>`, 'scan'); }

function learningPanel(word) { return `<div class="learning-panel"><div class="section-heading"><div><p class="eyebrow">TAKE A LITTLE WITH YOU</p><h2>Useful words here</h2></div><span class="count">1 worth keeping</span></div>
 <div class="word-row"><div><b>${word.word}</b><small>${word.reading || ''} · ${word.meaning || ''}</small></div><span class="tag directions">${word.category || 'Signs'}</span><button class="save-word" data-action="saved">✓</button></div>
 <div class="first-met"><span>⌖</span><p><b>First met on your ${data.trip.name} trip</b><small>Added from your latest scan</small></p></div>
 <p class="gentle-caption">Words from today appear again later, in gentle little ways.</p></div>`; }

function vocab() {
 const list = data.vocab.filter(v => (state.category === 'All' || v.category === state.category) && `${v.word} ${v.meaning}`.toLowerCase().includes(state.query.toLowerCase()));
 return shell(`<section class="page vocab-page"><div class="vocab-head"><p class="eyebrow">YOUR LITTLE MEMORY BOOK</p><h1>Words you've<br><i>met.</i></h1><p>Collected around ${data.trip.place}</p></div><div class="search"><span>${icon('search')}</span><input placeholder="Find a word" value="${state.query}" data-input="query"><button>${icon('x')}</button></div>
 <div class="notebook"><div class="notebook-rings"><i></i><i></i><i></i><i></i></div><div class="notebook-cover"><span>✦</span><p>KYOTO TRIP</p><b>2026</b><small>TRAVEL WORDS</small></div><div class="notebook-pages"><div class="page-tabs">${['All','Food','Transport','Directions','Shopping'].map(c=>`<button class="${state.category===c?'selected':''}" data-category="${c}">${c}</button>`).join('')}</div><div class="page-title"><span>${state.category==='All'?'EVERYTHING I’VE MET':state.category.toUpperCase()}</span><b>${list.length} little ${list.length===1?'word':'words'}</b></div><div class="word-list">${list.map(v => `<article class="vocab-word"><div class="word-main"><b>${v.word}</b><span>${v.reading}</span></div><div class="word-detail"><strong>${v.meaning}</strong><p>First met at ${v.place} <span>♡</span></p><div class="word-footer"><span class="status ${v.status.replace(' ','-').toLowerCase()}">${v.status}</span><span>seen ${v.seen}×</span></div></div><div class="level"><i style="height:${v.level}%"></i></div></article>`).join('')}</div></div></div>
 </section>`, 'vocab');
}

function trip() { return shell(`<section class="page trip-page"><div class="trip-hero"><span>${data.trip.flag}</span><p class="eyebrow">CURRENT CHAPTER</p><h1>${data.trip.name}</h1><p>${data.trip.dates} · ${data.trip.place}</p><button data-action="setup">Edit trip</button></div><div class="trip-stats"><div><strong>24</strong><span>words<br>collected</span></div><div><strong>8</strong><span>moments<br>scanned</span></div><div><strong>71%</strong><span>recall<br>rate</span></div></div><div class="return-card"><span>↻</span><div><p class="eyebrow">FOR YOUR NEXT JAPAN TRIP</p><h2>Your past discoveries are waiting.</h2><p>Take a 2-minute refresh before your next adventure.</p><button class="dark-btn" data-action="quiz">Refresh my memory ${icon('arrow')}</button></div></div></section>`, 'trip'); }

function quiz() { return shell(`<section class="page quiz-page"><button class="back" data-action="home">←</button><div class="quiz-steps"><i></i><i class="active"></i><i></i><span>1 of 3</span></div><div class="quiz-flower">✦</div><p class="eyebrow">A TINY HELLO AGAIN</p><h1>Do you remember<br>what this means?</h1><div class="quiz-word">入口<span>iriguchi</span></div>${state.quizAnswered ? `<div class="answer-reveal"><b>Entrance</b><p>Exactly — you first met this word at Nishiki Market.</p></div>` : `<div class="answer-options"><button data-action="answer">Entrance</button><button data-action="answer">Exit</button><button data-action="answer">Platform</button></div>`}<p class="quiz-note">No pressure. Getting it wrong is how it starts to stick.</p></section>`, 'home'); }

function render() {
  try {
    const views = { welcome, setup, modeChoice, home: dashboard, scan, result, loading, scanError, vocab, trip, quiz };
    views[state.screen]();
  } catch (err) {
    // DEBUG: show the error on the page so we can diagnose without the console
    app.innerHTML = `<section style="padding:40px;font-family:monospace;font-size:13px;color:#c00;"><h2>Render error (screen: ${state.screen})</h2><pre>${(err && err.stack) || err}</pre></section>`;
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
      state.screen = 'result';
    } catch (error) {
      state.scanError = error.message || 'The translation service is unavailable.';
      state.screen = 'scanError';
    }
    render();
  };
  reader.readAsDataURL(image);
}
app.addEventListener('change', e => { if (e.target.matches('input[type="file"][data-upload-mode]')) uploadTravelImage(e.target, e.target.dataset.uploadMode); });
app.addEventListener('click', e => { const target = e.target.closest('[data-action], [data-category]'); if (!target) return; if (target.dataset.category) { state.category = target.dataset.category; render(); return; } const a=target.dataset.action; if (a === 'welcome'||a==='setup'||a==='modeChoice'||a==='home'||a==='scan'||a==='result'||a==='vocab'||a==='trip'||a==='quiz') state.screen=a; if (a === 'learn'||a==='translate') { state.mode=a; state.screen='scan'; } if (a==='switchMode') state.mode=state.mode==='learn'?'translate':'learn'; if (a==='answer') state.quizAnswered=true; if (a==='saved') { target.innerHTML='✓'; target.classList.add('is-saved'); } render(); });
app.addEventListener('input', e => { if(e.target.dataset.input==='query') { state.query=e.target.value; render(); const input=document.querySelector('[data-input="query"]'); input?.focus(); input?.setSelectionRange(state.query.length,state.query.length); } });
render();
