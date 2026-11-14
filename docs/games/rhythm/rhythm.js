/* QuizWeb Games / Rhythm Typing R5. Standalone, no GameLock or admin connection. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const board = $('rhythmBoard');
  if (!board) return;

  const noteLayer = $('notesLayer');
  const laneElements = [...document.querySelectorAll('.lane')];
  const padButtons = [...document.querySelectorAll('[data-pad]')];
  const songs = [
    {word:'CAT',meaning:'แมว'}, {word:'DOG',meaning:'สุนัข'},
    {word:'SUN',meaning:'ดวงอาทิตย์'}, {word:'FISH',meaning:'ปลา'},
    {word:'BOOK',meaning:'หนังสือ'}, {word:'STAR',meaning:'ดาว'},
    {word:'MILK',meaning:'นม'}, {word:'TREE',meaning:'ต้นไม้'},
    {word:'BLUE',meaning:'สีฟ้า'}, {word:'APPLE',meaning:'แอปเปิล'},
    {word:'BREAD',meaning:'ขนมปัง'}, {word:'HOUSE',meaning:'บ้าน'},
    {word:'GREEN',meaning:'สีเขียว'}, {word:'HAPPY',meaning:'มีความสุข'},
    {word:'WATER',meaning:'น้ำ'}, {word:'SMILE',meaning:'รอยยิ้ม'},
    {word:'BIRD',meaning:'นก'}, {word:'TRAIN',meaning:'รถไฟ'}
  ];

  const limit = 6;
  const bestKey = 'quizweb_games_rhythm_best_v1';
  const timings = { PERFECT:95, GREAT:175, GOOD:285 };
  const points = { PERFECT:300, GREAT:180, GOOD:90 };
  let mode = 'ready'; // ready | announcing | playing | paused | finished
  let notes = [];
  let chosen = [];
  let raf = 0;
  let clockStart = 0;
  let elapsed = 0;
  let combo = 0;
  let score = 0;
  let lives = 5;
  let currentWord = 0;
  let audio = null;
  let soundEnabled = true;
  let lastPadSignature = '';

  function safeBest() {
    try { return Math.max(0, Number(localStorage.getItem(bestKey)) || 0); }
    catch (_) { return 0; }
  }
  function saveBest(n) {
    try { localStorage.setItem(bestKey, String(n)); } catch (_) { /* optional */ }
  }
  function shuffle(input) {
    const a = input.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function tempo() { return $('tempoSelect').value === 'slow' ? 1050 : 790; }
  function travel() { return $('tempoSelect').value === 'slow' ? 2650 : 2140; }
  function getAudio() {
    if (!soundEnabled) return null;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      if (!audio) audio = new Ctx();
      if (audio.state === 'suspended') { audio.resume().catch(() => {}); }
      return audio;
    } catch (_) { return null; }
  }
  function beep(freq = 700, duration = .07, volume = .035) {
    const ctx = getAudio();
    if (!ctx || ctx.state !== 'running') return;
    try {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = freq;
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + duration);
      oscillator.connect(gain); gain.connect(ctx.destination);
      oscillator.start(); oscillator.stop(ctx.currentTime + duration);
    } catch (_) { /* keep visual play usable */ }
  }
  function overlay(symbol, title, message, action) {
    $('overlaySymbol').textContent = symbol;
    $('overlayTitle').textContent = title;
    $('overlayMessage').textContent = message;
    $('overlayPlay').textContent = action;
    $('gameOverlay').hidden = false;
  }
  function concealOverlay() { $('gameOverlay').hidden = true; }
  function refreshStats() {
    $('scoreText').textContent = score.toLocaleString();
    $('comboText').textContent = String(combo);
    $('heartText').textContent = '♥'.repeat(lives) + '♡'.repeat(5 - lives);
    $('heartText').setAttribute('aria-label', `หัวใจเหลือ ${lives} ดวง`);
    const best = Math.max(safeBest(), score);
    $('bestText').textContent = best.toLocaleString();
    $('roundText').textContent = `${Math.min(currentWord + 1, limit)} / ${limit}`;
  }
  function showWord(index) {
    if (!chosen[index]) return;
    currentWord = index;
    const item = chosen[index];
    $('wordText').textContent = item.word;
    $('meaningText').textContent = item.meaning;
    const container = $('wordLetters');
    container.replaceChildren();
    for (const letter of item.word) {
      const span = document.createElement('span');
      span.textContent = letter;
      container.appendChild(span);
    }
    updateSpelling();
    refreshStats();
  }
  function updateSpelling() {
    const wordNotes = notes.filter(note => note.wordIndex === currentWord);
    const cells = [...$('wordLetters').children];
    wordNotes.forEach((note, i) => { if (cells[i]) cells[i].classList.toggle('typed', note.status === 'hit'); });
  }
  function judge(label) {
    const el = $('judgeText');
    el.textContent = label;
    el.className = `judge-text ${label.toLowerCase()}`;
    void el.offsetWidth;
    el.classList.add('show');
  }
  function createSchedule() {
    noteLayer.replaceChildren();
    chosen = shuffle(songs).slice(0, limit);
    notes = [];
    const beat = tempo();
    let t = travel() + 450;
    chosen.forEach((entry, wordIndex) => {
      [...entry.word].forEach((letter, charIndex) => {
        notes.push({
          letter, wordIndex, charIndex,
          lane: (wordIndex * 2 + charIndex * 3) % 4,
          target: t,
          status:'pending', element:null, sounded:false
        });
        t += beat;
      });
      // Allow previous word to finish before next word begins falling.
      t += Math.max(0, travel() + 650 - beat);
    });
    score = 0; combo = 0; lives = 5;
    currentWord = 0; elapsed = 0; lastPadSignature = '';
    showWord(0);
    refreshStats();
    padButtons.forEach(el => { el.disabled = false; el.textContent = '·'; });
    $('pauseButton').disabled = false;
    $('pauseButton').textContent = '⏸ พักเกม';
    $('tempoSelect').disabled = true;
  }
  function clearExisting() {
    window.QuizWebGamesSpeech.cancel();
    $('rhythmSpeechCue').hidden = true;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    noteLayer.replaceChildren();
    notes = [];
    padButtons.forEach(el => { el.disabled = true; el.textContent = '·'; });
    laneElements.forEach(el => el.classList.remove('lane-hit'));
    $('judgeText').className = 'judge-text';
  }
  function announceCurrentWord() {
    if (!chosen[currentWord]) return;
    mode = 'announcing';
    $('pauseButton').disabled = true;
    $('repeatWordButton').disabled = true;
    $('rhythmSpeechCue').textContent = `🔊 ${chosen[currentWord].word}`;
    $('rhythmSpeechCue').hidden = false;
    window.QuizWebGamesSpeech.say(chosen[currentWord].word, () => {
      if (mode !== 'announcing') return;
      $('rhythmSpeechCue').hidden = true;
      $('repeatWordButton').disabled = false;
      $('pauseButton').disabled = false;
      mode = 'playing';
      clockStart = performance.now() - elapsed;
      board.focus({preventScroll:true});
      raf = requestAnimationFrame(frame);
    });
  }
  function begin() {
    clearExisting();
    mode = 'announcing';
    createSchedule();
    concealOverlay();
    getAudio();
    announceCurrentWord();
  }
  function finish() {
    if (mode === 'finished') return;
    mode = 'finished';
    window.QuizWebGamesSpeech.cancel();
    $('rhythmSpeechCue').hidden = true;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    if (score > safeBest()) saveBest(score);
    document.addEventListener('visibilitychange', () => {
    if (!document.hidden) return;
    if (mode === 'announcing') {
      window.QuizWebGamesSpeech.cancel();
      $('rhythmSpeechCue').hidden = true;
      mode = 'paused';
      $('pauseButton').disabled = false;
      overlay('Ⅱ', 'พักเกม', 'เล่นต่อเพื่อฟังคำศัพท์', 'เล่นต่อ ▶');
    } else if (mode === 'playing') pause();
  });
  $('bestText').textContent = safeBest().toLocaleString();
    $('pauseButton').disabled = true;
    $('tempoSelect').disabled = false;
    padButtons.forEach(el => { el.disabled = true; el.textContent = '·'; });
    const win = lives > 0;
    overlay(win ? '★' : '♡', win ? 'จบรอบแล้ว!' : 'หมดหัวใจแล้ว', `คะแนน ${score.toLocaleString()} · คอมโบล่าสุด ${combo}`, 'เล่นอีกครั้ง ▶');
  }
  function pause() {
    if (mode !== 'playing') return;
    elapsed = performance.now() - clockStart;
    mode = 'paused';
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    $('pauseButton').textContent = '▶ เล่นต่อ';
    overlay('Ⅱ', 'พักเกม', 'กดเล่นต่อเมื่อต้องการ', 'เล่นต่อ ▶');
  }
  function resume() {
    if (mode !== 'paused') return;
    if ($('rhythmSpeechCue').textContent && $('rhythmSpeechCue').textContent.startsWith('🔊') && $('repeatWordButton').disabled) {
      concealOverlay();
      announceCurrentWord();
      return;
    }
    mode = 'playing';
    clockStart = performance.now() - elapsed;
    $('pauseButton').textContent = '⏸ พักเกม';
    concealOverlay();
    board.focus({preventScroll:true});
    raf = requestAnimationFrame(frame);
  }
  function removeNote(note) {
    if (note.element) {
      note.element.remove();
      note.element = null;
    }
  }
  function onMiss(note) {
    if (note.status !== 'pending') return;
    note.status = 'miss';
    removeNote(note);
    combo = 0;
    lives = Math.max(0, lives - 1);
    judge('MISS');
    refreshStats();
    if (note.wordIndex === currentWord) updateSpelling();
    if (lives === 0) finish();
  }
  function hitNote(note, delta) {
    if (!note || mode !== 'playing') return;
    const error = Math.abs(delta);
    if (error > timings.GOOD) return;
    const rating = error <= timings.PERFECT ? 'PERFECT' : error <= timings.GREAT ? 'GREAT' : 'GOOD';
    note.status = 'hit';
    removeNote(note);
    combo += 1;
    score += points[rating] + Math.min(50, Math.floor(combo / 5) * 10);
    judge(rating);
    beep(rating === 'PERFECT' ? 880 : 680, .11, .06);
    refreshStats();
    if (note.wordIndex === currentWord) updateSpelling();
    laneElements[note.lane].classList.add('lane-hit');
    setTimeout(() => laneElements[note.lane].classList.remove('lane-hit'), 110);
    refreshPads();
  }
  function positionNote(note, now, hitY, startY, laneWidth) {
    const distance = hitY - startY;
    const y = hitY + ((now - note.target) / travel()) * distance;
    const diameter = window.innerWidth <= 500 ? 44 : 54;
    const x = note.lane * laneWidth + (laneWidth - diameter) / 2;
    note.element.style.transform = `translate3d(${x}px,${y}px,0)`;
  }
  function refreshPads() {
    if (mode !== 'playing') return;
    const nearest = [null, null, null, null];
    for (const note of notes) {
      if (note.status !== 'pending') continue;
      const lane = note.lane;
      if (!nearest[lane] || note.target < nearest[lane].target) nearest[lane] = note;
    }
    const signature = nearest.map(n => n ? `${n.letter}:${n.target}` : '-').join('|');
    if (signature === lastPadSignature) return;
    lastPadSignature = signature;
    padButtons.forEach((pad, index) => { pad.textContent = nearest[index] ? nearest[index].letter : '·'; });
  }
  function updateActiveWord(now) {
    let index = currentWord;
    while (index < chosen.length - 1) {
      const group = notes.filter(note => note.wordIndex === index);
      const finishedGroup = group.every(note => note.status !== 'pending');
      const next = notes.find(note => note.wordIndex === index + 1);
      if (!(finishedGroup && next && now >= next.target - travel())) break;
      index++;
    }
    if (index !== currentWord) {
      showWord(index);
      announceCurrentWord();
    }
  }
  function frame(ts) {
    if (mode !== 'playing') return;
    elapsed = ts - clockStart;
    const hitY = board.clientHeight - 76 - 27;
    const startY = -56;
    const laneWidth = board.clientWidth / 4;
    for (const note of notes) {
      if (note.status !== 'pending') continue;
      if (elapsed > note.target + timings.GOOD + 30) {
        onMiss(note);
        if (mode !== 'playing') return;
        continue;
      }
      if (elapsed < note.target - travel()) continue;
      if (!note.element) {
        const el = document.createElement('div');
        el.className = 'rhythm-note' + (note.charIndex % 3 === 1 ? ' blue' : '');
        el.textContent = note.letter;
        el.setAttribute('aria-hidden', 'true');
        note.element = el;
        noteLayer.appendChild(el);
      }
      positionNote(note, elapsed, hitY, startY, laneWidth);
      if (!note.sounded && elapsed >= note.target && elapsed < note.target + 130) {
        note.sounded = true;
        beep(note.charIndex === 0 ? 470 : 340, .06, .018);
      }
    }
    updateActiveWord(elapsed);
    if (mode !== 'playing') return; // Pause time while the new word is spoken.
    refreshPads();
    const last = notes[notes.length - 1];
    if (last && notes.every(note => note.status !== 'pending') && elapsed > last.target + 450) { finish(); return; }
    raf = requestAnimationFrame(frame);
  }
  function tryKey(letter) {
    if (mode !== 'playing') return;
    const now = performance.now() - clockStart;
    let candidate = null;
    for (const note of notes) {
      if (note.status !== 'pending' || note.letter !== letter) continue;
      const delta = now - note.target;
      if (Math.abs(delta) > timings.GOOD) continue;
      if (!candidate || Math.abs(delta) < Math.abs(now - candidate.target)) candidate = note;
    }
    if (candidate) hitNote(candidate, now - candidate.target);
  }
  function tryLane(lane) {
    if (mode !== 'playing') return;
    const now = performance.now() - clockStart;
    let candidate = null;
    for (const note of notes) {
      if (note.status !== 'pending' || note.lane !== lane) continue;
      if (Math.abs(now - note.target) > timings.GOOD) continue;
      if (!candidate || Math.abs(now - note.target) < Math.abs(now - candidate.target)) candidate = note;
    }
    if (candidate) hitNote(candidate, now - candidate.target);
  }
  document.addEventListener('keydown', event => {
    if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
    // Handle letters even if the user last clicked a button (pause, sound, replay).
    if (event.target && (['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName) || event.target.isContentEditable)) return;
    if (mode === 'playing' && /^[a-z]$/i.test(event.key)) {
      event.preventDefault();
      tryKey(event.key.toUpperCase());
    } else if (event.code === 'Space' && mode === 'paused') {
      event.preventDefault(); resume();
    }
  });
  padButtons.forEach(btn => btn.addEventListener('pointerdown', event => {
    if (mode !== 'playing') return;
    event.preventDefault(); tryLane(Number(btn.dataset.pad));
  }));
  board.addEventListener('pointerdown', event => {
    if (mode !== 'playing' || event.target.closest('.game-overlay')) return;
    const rect = board.getBoundingClientRect();
    const lane = Math.min(3, Math.max(0, Math.floor(((event.clientX - rect.left) / rect.width) * 4)));
    tryLane(lane);
  });
  $('overlayPlay').addEventListener('click', () => { if (mode === 'paused') resume(); else begin(); });
  $('pauseButton').addEventListener('click', () => { if (mode === 'paused') resume(); else pause(); });
  $('restartButton').addEventListener('click', begin);
  $('repeatWordButton').addEventListener('click', () => {
    if (mode === 'announcing' || !chosen[currentWord]) return;
    window.QuizWebGamesSpeech.say(chosen[currentWord].word);
  });
  $('soundButton').addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    $('soundButton').textContent = soundEnabled ? '♫ เปิดเสียง' : '♫ ปิดเสียง';
    $('soundButton').setAttribute('aria-pressed', String(soundEnabled));
    if (soundEnabled) getAudio();
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) return;
    if (mode === 'announcing') {
      window.QuizWebGamesSpeech.cancel();
      $('rhythmSpeechCue').hidden = true;
      mode = 'paused';
      $('pauseButton').disabled = false;
      overlay('Ⅱ', 'พักเกม', 'เล่นต่อเพื่อฟังคำศัพท์', 'เล่นต่อ ▶');
    } else if (mode === 'playing') pause();
  });
  $('bestText').textContent = safeBest().toLocaleString();
  refreshStats();
})();
