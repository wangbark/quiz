/* QuizWeb English Letter Tetris for Grade 3. Self-contained, no external APIs/storage/GameLock. */
(() => {
  'use strict';
  const WORDS = [
    ['CAT', 'แมว'], ['DOG', 'สุนัข'], ['SUN', 'ดวงอาทิตย์'], ['CAR', 'รถยนต์'],
    ['BUS', 'รถโดยสาร'], ['COW', 'วัว'], ['PIG', 'หมู'], ['ANT', 'มด'],
    ['FISH', 'ปลา'], ['BIRD', 'นก'], ['BOOK', 'หนังสือ'], ['TREE', 'ต้นไม้'],
    ['MILK', 'นม'], ['HOME', 'บ้าน'], ['CAKE', 'เค้ก'], ['STAR', 'ดาว'],
    ['RAIN', 'ฝน'], ['BLUE', 'สีน้ำเงิน'], ['HAND', 'มือ'], ['LION', 'สิงโต'],
    ['APPLE', 'แอปเปิล'], ['WATER', 'น้ำ'], ['CHAIR', 'เก้าอี้'], ['GREEN', 'สีเขียว'],
    ['HOUSE', 'บ้าน'], ['SMILE', 'รอยยิ้ม'], ['TIGER', 'เสือ'], ['TABLE', 'โต๊ะ'],
    ['PLANT', 'พืช'], ['HORSE', 'ม้า'], ['BREAD', 'ขนมปัง'], ['TRAIN', 'รถไฟ'],
    ['LEMON', 'มะนาว'], ['MUSIC', 'ดนตรี'], ['SHEEP', 'แกะ'], ['CLOUD', 'เมฆ'],
    ['SCHOOL', 'โรงเรียน'], ['PENCIL', 'ดินสอ'], ['FAMILY', 'ครอบครัว'],
    ['FLOWER', 'ดอกไม้'], ['ORANGE', 'ส้ม'], ['SUMMER', 'ฤดูร้อน']
  ];
  const TOTAL = 6;
  const COLUMNS = 8;
  const TRASH_COLUMN = COLUMNS - 1;
  const MAX_WORD_LENGTH = 6;
  const $ = id => document.getElementById(id);
  const ui = {
    level: $('levelText'), score: $('scoreText'), lives: $('livesText'), trash: $('trashText'),
    meaning: $('wordMeaning'), preview: $('wordPreview'), next: $('nextInstruction'),
    fallZone: $('fallZone'), tile: $('fallingLetter'), laneGrid: $('laneGrid'),
    floor: $('floorZone'), board: $('board'), feedback: $('feedback'),
    overlay: $('boardOverlay'), emoji: $('overlayEmoji'), title: $('overlayTitle'),
    message: $('overlayMessage'), action: $('overlayAction'), toast: $('boardToast'),
    left: $('leftButton'), right: $('rightButton'), drop: $('dropButton'),
    pause: $('pauseButton'), restart: $('restartButton'), speed: $('speedSelect'),
    speak: $('speakWordButton')
  };
  if (Object.values(ui).some(item => !item)) return;
  if (WORDS.some(([word]) => word.length > MAX_WORD_LENGTH || !/^[A-Z]+$/.test(word))) {
    throw new Error('Invalid Letter Tetris word bank: word must fit before the bin.');
  }

  let words = [];
  let wordIndex = 0;
  let letterIndex = 0;
  let score = 0;
  let lives = 3;
  let trashed = 0;
  let phase = 'idle'; // idle | speaking | running | paused | between | finished
  let current = null; // {char, col, y}
  let rafId = 0;
  let lastFrame = 0;
  let delayed = 0;
  let pauseAfterDelay = false;
  let fallCount = 0;
  let overlayHandler = null;
  const word = () => words[wordIndex]?.[0] || '';
  const meaning = () => words[wordIndex]?.[1] || '';
  const nextChar = () => word()[letterIndex] || '';

  function shuffle(source) {
    const list = source.slice();
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }

  function setFeedback(message) { ui.feedback.textContent = message; }
  function setButtons(enabled) {
    ui.left.disabled = !enabled;
    ui.right.disabled = !enabled;
    ui.drop.disabled = !enabled;
    ui.pause.disabled = !(enabled || phase === 'paused');
    ui.pause.textContent = phase === 'paused' ? '▶ เล่นต่อ' : '⏸ พักเกม';
  }

  function updateHud() {
    ui.level.textContent = `${Math.min(wordIndex + 1, TOTAL)} / ${TOTAL}`;
    ui.score.textContent = score.toLocaleString('en-US');
    ui.lives.textContent = '❤️'.repeat(lives) + '🤍'.repeat(3 - lives);
    ui.lives.setAttribute('aria-label', `เหลือ ${lives} หัวใจ`);
    ui.trash.textContent = String(trashed);
    ui.meaning.textContent = meaning() || '—';
  }

  function drawWord() {
    ui.preview.replaceChildren();
    ui.laneGrid.replaceChildren();
    ui.floor.replaceChildren();
    const text = word();
    [...text].forEach((char, idx) => {
      const e = document.createElement('span');
      e.className = 'preview-letter' + (idx < letterIndex ? ' completed' : idx === letterIndex ? ' next' : '');
      e.textContent = char;
      ui.preview.appendChild(e);
    });
    for (let col = 0; col < COLUMNS; col++) {
      const lane = document.createElement('div');
      lane.className = 'lane' + (col === TRASH_COLUMN ? ' is-trash' : col === letterIndex ? ' is-target' : '');
      ui.laneGrid.appendChild(lane);
      if (col === TRASH_COLUMN) {
        const bin = document.createElement('div');
        bin.className = 'trash-slot';
        const icon = document.createElement('span');
        icon.className = 'trash-icon';
        icon.textContent = '🗑️';
        const label = document.createElement('span');
        label.textContent = 'ถังขยะ';
        bin.append(icon, label);
        ui.floor.appendChild(bin);
      } else {
        const slot = document.createElement('div');
        slot.className = 'word-slot';
        if (col >= text.length) slot.classList.add('slot-empty');
        else if (col < letterIndex) slot.classList.add('slot-filled');
        else if (col === letterIndex) slot.classList.add('slot-next');
        slot.textContent = col < letterIndex ? text[col] : col < text.length ? '·' : '';
        ui.floor.appendChild(slot);
      }
    }
    ui.next.textContent = letterIndex < text.length
      ? `ตัวถัดไปคือ “${nextChar()}” · ให้ลงช่องที่ ${letterIndex + 1} จากซ้าย`
      : 'คำนี้เรียงครบแล้ว!';
    updateHud();
  }

  function paintTile() {
    if (!current) { ui.tile.hidden = true; return; }
    ui.tile.hidden = false;
    ui.tile.textContent = current.char;
    ui.tile.style.left = `${(current.col + .5) * 100 / COLUMNS}%`;
    ui.tile.style.top = `${current.y}px`;
  }

  function maxY() { return Math.max(0, ui.fallZone.clientHeight - ui.tile.offsetHeight - 3); }
  function stopFrames() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    lastFrame = 0;
  }
  function cancelDelay() {
    if (delayed) clearTimeout(delayed);
    delayed = 0;
  }
  function queueNext(action, ms) {
    cancelDelay();
    delayed = setTimeout(() => {
      delayed = 0;
      if (phase === 'finished' || phase === 'idle') return;
      action();
      if (pauseAfterDelay && phase === 'running') {
        pauseAfterDelay = false;
        pauseGame();
      }
    }, ms);
  }

  function showOverlay(emoji, title, message, label, handler) {
    ui.emoji.textContent = emoji;
    ui.title.textContent = title;
    ui.message.textContent = message;
    ui.action.textContent = label;
    overlayHandler = handler;
    ui.overlay.hidden = false;
  }
  function hideOverlay() { ui.overlay.hidden = true; overlayHandler = null; }
  function flash(message) {
    ui.toast.textContent = message;
    ui.toast.hidden = false;
  }
  function hideFlash() { ui.toast.hidden = true; }

  function chooseLetter() {
    const want = nextChar();
    // Always give the first letter of a word to help children learn the rules.
    const correct = fallCount === 0 || Math.random() < .67;
    if (correct) return want;
    const others = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(ch => ch !== want);
    return others[Math.floor(Math.random() * others.length)];
  }

  function announceThenSpawn() {
    stopFrames();
    phase = 'speaking';
    setButtons(false);
    ui.speak.disabled = true;
    ui.next.textContent = `🔊 ฟังคำศัพท์ “${word()}”`;
    window.QuizWebGamesSpeech.say(word(), () => {
      if (phase !== 'speaking') return;
      ui.speak.disabled = false;
      drawWord();
      spawn();
    });
  }

  function spawn() {
    if (phase === 'finished') return;
    hideFlash();
    const char = chooseLetter();
    const col = Math.floor(Math.random() * 7);
    current = {char, col, y: -52};
    fallCount++;
    phase = 'running';
    paintTile();
    setButtons(true);
    stopFrames();
    rafId = requestAnimationFrame(tick);
  }

  function tick(now) {
    if (phase !== 'running' || !current) return;
    if (lastFrame === 0) lastFrame = now;
    const elapsed = Math.min(.05, (now - lastFrame) / 1000);
    lastFrame = now;
    const velocity = ui.speed.value === 'normal' ? 123 : 82;
    current.y += velocity * elapsed;
    if (current.y >= maxY()) {
      current.y = maxY();
      paintTile();
      land();
      return;
    }
    paintTile();
    rafId = requestAnimationFrame(tick);
  }

  function move(amount) {
    if (phase !== 'running' || !current) return;
    current.col = Math.max(0, Math.min(TRASH_COLUMN, current.col + amount));
    paintTile();
  }

  function drop() {
    if (phase !== 'running' || !current) return;
    current.y = maxY();
    paintTile();
    land();
  }

  function land() {
    if (phase !== 'running' || !current) return;
    stopFrames();
    const {col, char} = current;
    current = null;
    ui.tile.hidden = true;
    phase = 'between';
    setButtons(false);
    if (col === TRASH_COLUMN) {
      if (char !== nextChar()) {
        trashed++;
        score += 2;
        flash('🗑️ ทิ้งถูกช่องแล้ว!');
        setFeedback(`ตัว ${char} ไม่ใช่ตัวที่ต้องการ ทิ้งลงถังได้ถูกต้อง 🎉`);
      } else {
        lives--;
        flash('💔 ตัวนี้ต้องใช้สะกดคำ');
        setFeedback(`ตัว ${char} เป็นตัวที่ต้องใช้ อย่าทิ้งลงถังขยะนะ`);
      }
    } else if (col === letterIndex && char === nextChar()) {
      letterIndex++;
      score += 10;
      flash('✨ ถูกต้อง!');
      setFeedback(`เยี่ยมเลย! วางตัว ${char} ถูกช่องแล้ว`);
      drawWord();
      if (letterIndex === word().length) {
        score += 30;
        updateHud();
        flash(`🌟 เก่งมาก! ${word()}`);
        setFeedback(`คำว่า ${word()} แปลว่า ${meaning()} เยี่ยมมาก!`);
        queueNext(nextWord, 1100);
        return;
      }
    } else {
      lives--;
      if (char !== nextChar()) {
        flash('💔 ตัวนี้ควรไปถังขยะ');
        setFeedback(`ตัว ${char} ไม่ใช่ตัวถัดไป ลองเลื่อนไปถังขยะทางขวาสุด`);
      } else {
        flash('💔 ลงผิดช่อง');
        setFeedback(`ตัว ${char} ต้องลงช่องที่ ${letterIndex + 1} จากซ้าย`);
      }
    }
    updateHud();
    if (lives <= 0) { finishGame(false); return; }
    queueNext(spawn, 650);
  }

  function nextWord() {
    wordIndex++;
    if (wordIndex >= TOTAL) { finishGame(true); return; }
    letterIndex = 0;
    fallCount = 0;
    drawWord();
    setFeedback(`เริ่มคำที่ ${wordIndex + 1} · ${word()} แปลว่า ${meaning()}`);
    announceThenSpawn();
  }

  function finishGame(completed) {
    window.QuizWebGamesSpeech.cancel();
    stopFrames();
    cancelDelay();
    current = null;
    ui.tile.hidden = true;
    phase = 'finished';
    setButtons(false);
    hideFlash();
    updateHud();
    if (completed) {
      setFeedback(`ยอดเยี่ยม! สะกดครบ ${TOTAL} คำ ได้ ${score} คะแนน 🎉`);
      showOverlay('🏆', 'สะกดครบทุกคำ!', `${score} คะแนน · ทิ้ง ${trashed} ตัว`, 'เล่นอีกครั้ง ↻', startGame);
    } else {
      setFeedback(`หัวใจหมดแล้ว ได้ ${score} คะแนน ลองอีกครั้งได้เลยนะ 💪`);
      showOverlay('🌻', 'ฝึกอีกครั้งนะ!', `${score} คะแนน · ผ่าน ${wordIndex} คำ`, 'เริ่มรอบใหม่ ↻', startGame);
    }
  }

  function startGame() {
    // A completed or failed round leaves phase='finished'. Reset it first;
    // otherwise spawn() exits early and no letter falls on subsequent rounds.
    window.QuizWebGamesSpeech.cancel();
    stopFrames(); cancelDelay(); hideFlash();
    current = null;
    phase = 'idle';
    words = shuffle(WORDS).slice(0, TOTAL);
    wordIndex = 0; letterIndex = 0; score = 0; lives = 3; trashed = 0;
    fallCount = 0; pauseAfterDelay = false;
    hideOverlay();
    drawWord();
    setFeedback('ใช้ปุ่ม ← → เพื่อย้ายตัวอักษรไปช่องที่ถูกต้องหรือถังขยะ');
    announceThenSpawn();
    ui.board.focus({preventScroll: true});
  }

  function pauseGame() {
    if (phase !== 'running') {
      if (phase === 'between') pauseAfterDelay = true;
      return;
    }
    stopFrames();
    phase = 'paused';
    setButtons(false);
    showOverlay('⏸️', 'พักเกม', '', 'เล่นต่อ ▶', resumeGame);
  }
  function resumeGame() {
    if (phase !== 'paused') return;
    hideOverlay();
    phase = 'running';
    lastFrame = 0;
    setButtons(true);
    rafId = requestAnimationFrame(tick);
    ui.board.focus({preventScroll: true});
  }

  function bindHold(button, amount) {
    // A single press moves exactly one column; supporting pointer and keyboard click.
    button.addEventListener('click', () => move(amount));
  }
  bindHold(ui.left, -1); bindHold(ui.right, +1);
  ui.drop.addEventListener('click', drop);
  ui.overlay.addEventListener('click', event => { if (event.target === ui.action && overlayHandler) overlayHandler(); });
  ui.pause.addEventListener('click', () => phase === 'paused' ? resumeGame() : pauseGame());
  ui.restart.addEventListener('click', startGame);
  ui.speak.addEventListener('click', () => {
    if (!word() || phase === 'speaking') return;
    window.QuizWebGamesSpeech.say(word());
  });
  document.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target instanceof HTMLElement && ['SELECT','INPUT','TEXTAREA'].includes(event.target.tagName)) return;
    if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') { if (phase === 'running') { event.preventDefault(); move(-1); } }
    else if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') { if (phase === 'running') { event.preventDefault(); move(1); } }
    else if (event.key === 'ArrowDown' || event.key === ' ') { if (phase === 'running') { event.preventDefault(); drop(); } }
    else if (event.key === 'Escape') { if (phase === 'running') pauseGame(); else if (phase === 'paused') resumeGame(); }
  });

  // Swipe on the board as an additional touch shortcut. Buttons always remain available.
  let startTouch = null;
  ui.board.addEventListener('touchstart', event => {
    if (phase !== 'running' || event.touches.length !== 1) return;
    startTouch = {x: event.touches[0].clientX, y: event.touches[0].clientY};
  }, {passive:true});
  ui.board.addEventListener('touchend', event => {
    if (!startTouch || phase !== 'running' || event.changedTouches.length !== 1) { startTouch = null; return; }
    const dx = event.changedTouches[0].clientX - startTouch.x;
    const dy = event.changedTouches[0].clientY - startTouch.y;
    startTouch = null;
    if (Math.abs(dx) > 28 && Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? +1 : -1);
  }, {passive:true});
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) return;
    if (phase === 'speaking') {
      window.QuizWebGamesSpeech.cancel();
      phase = 'paused';
      ui.speak.disabled = false;
      showOverlay('⏸️', 'พักเกม', 'เล่นต่อเพื่อฟังคำศัพท์อีกครั้ง', 'เล่นต่อ ▶', () => {
        hideOverlay();
        announceThenSpawn();
      });
      return;
    }
    if (phase === 'running') pauseGame();
    else if (phase === 'between') pauseAfterDelay = true;
  });
  window.addEventListener('blur', () => { if (phase === 'running') pauseGame(); });
  window.addEventListener('resize', () => {
    if (current) { current.y = Math.min(current.y, maxY()); paintTile(); }
  });

  words = [WORDS[0]];
  drawWord();
  setButtons(false);
  showOverlay('🎮', 'พร้อมเล่นไหม?', '← → เลื่อน · ↓ ปล่อย · 🗑️ ทิ้งตัวที่ไม่ใช่', 'เริ่มเล่น ▶', startGame);
})();
