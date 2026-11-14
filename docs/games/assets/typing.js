/* QuizWeb · Thai/English typing practice for Grade 3. Standalone; no GameLock API or storage. */
(() => {
  'use strict';
  const language = document.body.dataset.language === 'en' ? 'en' : 'th';
  const bank = window.QUIZWEB_GAMES_P3_QUESTIONS?.[language];
  const englishMeanings = window.QUIZWEB_GAMES_P3_QUESTIONS?.enMeanings || {};
  const getMeaning = prompt => language === 'en' ? (englishMeanings[prompt] || '') : '';
  if (!bank || !bank.words || !bank.sentences) return;
  const $ = id => document.getElementById(id);
  const ui = {
    practice: $('practiceCard'), result: $('resultCard'), target: $('targetText'),
    entry: $('typingInput'), feedback: $('feedback'), count: $('questionCount'),
    score: $('scoreText'), progress: $('progressBar'), fill: $('progressFill'),
    listen: $('listenButton'),
    check: $('checkButton'), skip: $('skipButton'), restart: $('restartButton'),
    again: $('playAgainButton'), correct: $('resultCorrect'), skipped: $('resultSkipped'),
    time: $('resultTime'), resultTitle: $('resultTitle'), resultMessage: $('resultMessage')
  };
  const modeButtons = [...document.querySelectorAll('[data-mode]')];
  const total = 10;
  let mode = new URLSearchParams(location.search).get('mode') === 'sentences' ? 'sentences' : 'words';
  let questions = [], position = 0, successes = 0, skipped = 0, startTime = 0, locked = false;
  let composing = false, advanceHandle = null;

  function normalize(value) {
    let text = String(value ?? '').normalize('NFC').replace(/\s+/gu, ' ').trim();
    if (language === 'en') text = text.toLowerCase().replace(/[.!?]+$/u, '').trim();
    return text;
  }

  function shuffle(list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function graphemes(text) {
    if (typeof Intl.Segmenter === 'function') {
      return [...new Intl.Segmenter(language === 'th' ? 'th' : 'en', {granularity: 'grapheme'}).segment(text)].map(s => s.segment);
    }
    return Array.from(text);
  }

  function drawTarget() {
    const expected = questions[position];
    const entered = ui.entry.value.normalize('NFC');
    const expectedChars = graphemes(expected);
    const inputChars = graphemes(entered);
    const matching = (a, b) => language === 'en' ? a.toLowerCase() === b.toLowerCase() : a === b;
    let matchedCount = 0;
    while (matchedCount < expectedChars.length && matchedCount < inputChars.length && matching(expectedChars[matchedCount], inputChars[matchedCount])) matchedCount++;
    const line = document.createElement('span');
    line.className = 'target-line';
    expectedChars.forEach((char, idx) => {
      const span = document.createElement('span');
      span.textContent = char;
      if (idx < matchedCount) span.className = 'matched-character';
      line.appendChild(span);
    });
    ui.target.replaceChildren(line);
    ui.target.setAttribute('aria-label', expected);
    ui.entry.classList.remove('answer-error');
  }


  function speakQuestion(){
    if(position>=total || !questions[position])return;
    window.QuizWebGamesSpeech?.say(questions[position], undefined, getMeaning(questions[position]));
  }
  function renderQuestion() {
    if (position >= total) return finishRound();
    locked = false;
    ui.entry.disabled = false;
    ui.check.disabled = false;
    ui.skip.disabled = false;
    ui.entry.value = '';
    ui.feedback.textContent = '';
    ui.feedback.className = 'feedback';
    ui.count.textContent = `ข้อ ${position + 1} จาก ${total}`;
    ui.score.textContent = `⭐ ถูก ${successes}`;
    ui.progress.setAttribute('aria-valuenow', String(position));
    ui.fill.style.width = `${Math.round(position / total * 100)}%`;
    drawTarget();
    if (language === 'en') {
      const meaningEl = $('targetMeaning');
      if (meaningEl) { meaningEl.textContent = 'แปลว่า ' + getMeaning(questions[position]); meaningEl.hidden = !getMeaning(questions[position]); }
    }
    speakQuestion();
    if (window.matchMedia('(min-width: 800px)').matches) ui.entry.focus({preventScroll: true});
  }

  function nextQuestion() {
    if (advanceHandle !== null) { clearTimeout(advanceHandle); advanceHandle = null; }
    position++;
    renderQuestion();
  }

  function checkAnswer() {
    if (locked || composing) return;
    const answer = normalize(ui.entry.value);
    if (!answer) {
      ui.feedback.textContent = 'ลองพิมพ์คำตอบก่อนนะ 😊';
      ui.feedback.className = 'feedback feedback-hint';
      ui.entry.focus();
      return;
    }
    if (answer === normalize(questions[position])) {
      successes++;
      locked = true;
      ui.entry.disabled = true;
      ui.check.disabled = true;
      ui.skip.disabled = true;
      ui.score.textContent = `⭐ ถูก ${successes}`;
      ui.feedback.textContent = 'เยี่ยมเลย! พิมพ์ถูกแล้ว 🎉';
      ui.feedback.className = 'feedback feedback-success';
      advanceHandle = window.setTimeout(nextQuestion, 700);
    } else {
      ui.feedback.textContent = 'เกือบแล้ว ลองดูโจทย์แล้วพิมพ์ใหม่อีกครั้งนะ 💪';
      ui.feedback.className = 'feedback feedback-error';
      ui.entry.classList.add('answer-error');
      ui.entry.focus();
    }
  }

  function skipQuestion() {
    if (locked) return;
    skipped++;
    nextQuestion();
  }

  function finishRound() {
    window.QuizWebGamesSpeech?.cancel();
    locked = true;
    const seconds = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
    const minutes = Math.floor(seconds / 60);
    ui.correct.textContent = `${successes}/${total}`;
    ui.skipped.textContent = String(skipped);
    ui.time.textContent = `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
    ui.resultTitle.textContent = successes === total ? 'สุดยอด! ทำได้ครบทุกข้อ 🎉' : successes >= 7 ? 'เก่งมาก! ฝึกต่ออีกนิด 🌟' : 'ดีมากที่ตั้งใจฝึก 🌻';
    ui.resultMessage.textContent = `รอบนี้พิมพ์ได้ ${successes} ข้อจาก ${total} ข้อ ลองเล่นอีกครั้งเพื่อฝึกให้คล่องขึ้นนะ`;
    ui.practice.hidden = true;
    ui.result.hidden = false;
    ui.result.scrollIntoView({behavior:'smooth', block:'start'});
    ui.again.focus({preventScroll:true});
  }

  function startRound() {
    window.QuizWebGamesSpeech?.cancel();
    if (advanceHandle !== null) { clearTimeout(advanceHandle); advanceHandle = null; }
    const available = bank[mode];
    if (available.length < total) throw new Error('Not enough practice items');
    questions = shuffle(available).slice(0, total);
    position = 0; successes = 0; skipped = 0; locked = false; composing = false;
    startTime = Date.now();
    modeButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === mode)));
    ui.practice.hidden = false;
    ui.result.hidden = true;
    renderQuestion();
  }

  modeButtons.forEach(button => button.addEventListener('click', () => {
    if (mode === button.dataset.mode) return;
    mode = button.dataset.mode;
    const url = new URL(location.href);
    url.searchParams.set('mode', mode);
    history.replaceState(null, '', url);
    startRound();
  }));
  ui.entry.addEventListener('input', () => {
    if (locked) return;
    drawTarget();
    ui.feedback.textContent = '';
    ui.feedback.className = 'feedback';
  });
  ui.entry.addEventListener('compositionstart', () => { composing = true; });
  ui.entry.addEventListener('compositionend', () => { composing = false; drawTarget(); });
  ui.entry.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing && !composing && event.keyCode !== 229) {
      event.preventDefault();
      checkAnswer();
    }
  });
  ui.listen?.addEventListener('click', speakQuestion);
  ui.check.addEventListener('click', checkAnswer);
  ui.skip.addEventListener('click', skipQuestion);
  ui.restart.addEventListener('click', startRound);
  ui.again.addEventListener('click', startRound);
  startRound();
})();
