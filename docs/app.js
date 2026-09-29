(() => {
  const data = window.QUIZ_DATA;
  const letters = ["ก", "ข", "ค", "ง"];
  const letterSpeech = ["กอไก่", "ขอไข่", "คอควาย", "งองู"];
  const QUIZ_ROUND_LIMIT = 30;
  const QUIZ_NUMBER_WORDS = [
    '',
    'หนึ่ง','สอง','สาม','สี่','ห้า','หก','เจ็ด','แปด','เก้า','สิบ',
    'สิบเอ็ด','สิบสอง','สิบสาม','สิบสี่','สิบห้า','สิบหก','สิบเจ็ด','สิบแปด','สิบเก้า',
    'ยี่สิบ','ยี่สิบเอ็ด','ยี่สิบสอง','ยี่สิบสาม','ยี่สิบสี่','ยี่สิบห้า','ยี่สิบหก','ยี่สิบเจ็ด','ยี่สิบแปด','ยี่สิบเก้า',
    'สามสิบ'
  ];


  let currentSubjectId = null;
  let currentLessonId = null;
  let quizQuestions = [];
  let quizIndex = 0;
  let selectedIndex = null;
  let answered = false;
  let score = 0;
  let mistakes = [];
  let activeQuizName = "";
  let speechRate = 0.85;
  let speechSession = 0;

  const $ = (id) => document.getElementById(id);
  const views = [...document.querySelectorAll('.view')];
  const tabs = [...document.querySelectorAll('.tab')];

  function esc(text) {
    return String(text).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  }

  function toArray(value) {
    if (Array.isArray(value)) return value;
    if (value === null || value === undefined || value === '') return [];
    return [value];
  }

  function normalizeMedia(value) {
    return toArray(value).map((item, index) => {
      if (!item) return null;
      if (typeof item === 'string') {
        return { src: item, alt: 'ภาพประกอบ', caption: '' };
      }
      if (!item.src) return null;
      return {
        src: String(item.src),
        alt: item.alt ? String(item.alt) : `ภาพประกอบ ${index + 1}`,
        caption: item.caption ? String(item.caption) : ''
      };
    }).filter(Boolean);
  }

  function renderMedia(items, extraClass = '') {
    const list = normalizeMedia(items);
    if (!list.length) return '';
    return `<div class="${extraClass ? `${extraClass} ` : ''}media-grid">${list.map(item => `
      <figure class="media-item">
        <img loading="lazy" src="${esc(item.src)}" alt="${esc(item.alt)}">
        ${item.caption ? `<figcaption>${esc(item.caption)}</figcaption>` : ''}
      </figure>`).join('')}</div>`;
  }

  function getSubject(id) { return data.subjects.find(x => x.id === id); }
  function getLesson(id) { return data.lessons.find(x => x.id === id); }
  function currentSubject() { return getSubject(currentSubjectId); }
  function subjectLessons(subject = currentSubject()) {
    if (!subject) return [];
    return subject.lessonIds.map(getLesson).filter(Boolean);
  }
  function subjectQuestions(subject = currentSubject()) {
    if (!subject) return [];
    const ids = new Set(subject.lessonIds);
    return data.questions.filter(q => ids.has(q.lessonId));
  }

  function setView(name) {
    if (!['home','settings'].includes(name) && !currentSubjectId) name = 'home';
    views.forEach(v => v.classList.toggle('active', v.id === `view-${name}`));
    tabs.forEach(t => t.classList.toggle('active', t.dataset.view === name));
    document.querySelectorAll('.subject-only').forEach(t => t.classList.toggle('disabled-tab', !currentSubjectId));
    window.scrollTo({top:0, behavior:'smooth'});
    if (name === 'subject') renderSubjectPage();
    if (name === 'lessons') { renderLessonSelect(); renderLesson(); }
    if (name === 'quizSelect') renderQuizSets();
    if (name === 'results') renderResults();
  }

  function selectSubject(id) {
    const subject = getSubject(id);
    if (!subject) return;
    currentSubjectId = id;
    currentLessonId = subject.lessonIds[0] || null;
    renderSubjectLabels();
    renderSubjectPage();
    setView('subject');
  }

  function renderSubjectLabels() {
    const title = currentSubject()?.title || '';
    ['lessonSubjectLabel','quizSubjectLabel','resultSubjectLabel'].forEach(id => {
      const el = $(id);
      if (el) el.textContent = title;
    });
  }

  function renderSubjects() {
    $('subjectGrid').innerHTML = data.subjects.map(subject => {
      const lessons = subjectLessons(subject);
      const questions = subjectQuestions(subject);
      return `
        <article class="subject-card card" data-subject="${esc(subject.id)}">
          <div class="subject-icon" aria-hidden="true">${esc(subject.icon || '📘')}</div>
          <div class="subject-copy">
            <span class="eyebrow">วิชา</span>
            <h2>${esc(subject.title)}</h2>
            <p>${esc(subject.subtitle || subject.description || '')}</p>
            <div class="subject-meta">
              <span>${lessons.length} บทเรียน</span>
              <span>${questions.length} ข้อสอบ</span>
            </div>
          </div>
          <button class="primary open-subject" data-subject="${esc(subject.id)}" type="button">เข้าเรียนวิชานี้</button>
        </article>`;
    }).join('');

    document.querySelectorAll('.open-subject').forEach(btn => {
      btn.addEventListener('click', () => selectSubject(btn.dataset.subject));
    });
  }

  function renderSubjectPage() {
    const subject = currentSubject();
    if (!subject) return;
    const lessons = subjectLessons(subject);
    const questions = subjectQuestions(subject);
    $('subjectHero').innerHTML = `
      <div class="hero-copy">
        <span class="pill">${esc(subject.title)}</span>
        <h2>${esc(subject.title)}</h2>
        <div class="hero-actions">
          <button class="primary subject-go-lessons" type="button">เริ่มอ่านเนื้อหา</button>
          <button class="secondary subject-go-quiz" type="button">ทำแบบทดสอบ</button>
        </div>
      </div>
      <div class="hero-stats" aria-label="สรุปวิชา">
        <div><strong>${lessons.length}</strong><span>บทเรียน</span></div>
        <div><strong>${questions.length}</strong><span>ข้อสอบ</span></div>
      </div>`;

    document.querySelector('.subject-go-lessons').addEventListener('click', () => setView('lessons'));
    document.querySelector('.subject-go-quiz').addEventListener('click', () => startQuiz());

    $('homeLessonGrid').innerHTML = lessons.map(l => `
      <article class="lesson-card card compact-lesson-card">
        <div class="number">${l.number}</div>
        <h3>${esc(l.shortTitle)}</h3>
        <button class="primary open-lesson" data-lesson="${l.id}" type="button">อ่านบทนี้</button>
      </article>`).join('');

    document.querySelectorAll('.open-lesson').forEach(btn => btn.addEventListener('click', () => {
      currentLessonId = btn.dataset.lesson;
      renderLessonSelect();
      renderLesson();
      setView('lessons');
    }));
  }

  function lessonSpeechText(lesson) {
    return [
      `บทที่ ${lesson.number}. ${lesson.title}`,
      lesson.intro,
      ...lesson.sections.flatMap(s => [s.title, ...s.points])
    ].join('\n');
  }

  const SERVER_TTS_VOICES = [
    { id: 'th-TH-PremwadeeNeural', label: 'Premwadee Neural — ผู้หญิง (แนะนำ)' },
    { id: 'th-TH-AcharaNeural', label: 'Achara Neural — ผู้หญิง' },
    { id: 'th-TH-NiwatNeural', label: 'Niwat Neural — ผู้ชาย' }
  ];

  // Lists from the supplied lesson content that should NEVER be read as one run-on phrase.
  // Each item becomes its own audio segment with a real pause after it.
  const KNOWN_SPEECH_LISTS = [
    {
      phrase: 'ที่ราบลุ่ม ที่ราบสูง ภูเขา และพื้นที่ชายฝั่ง',
      items: ['ที่ราบลุ่ม','ที่ราบสูง','ภูเขา','พื้นที่ชายฝั่ง']
    },
    {
      phrase: 'แหล่งน้ำ ดิน ป่าไม้ และสัตว์น้ำ',
      items: ['แหล่งน้ำ','ดิน','ป่าไม้','สัตว์น้ำ']
    },
    {
      phrase: 'ยางพารา สวนผลไม้ และการประมง',
      items: ['ยางพารา','สวนผลไม้','การประมง']
    },
    {
      phrase: 'แกงฮังเล ไส้อั่ว แกงแค แกงโฮะ น้ำพริกอ่อง และแคบหมู',
      items: ['แกงฮังเล','ไส้อั่ว','แกงแค','แกงโฮะ','น้ำพริกอ่อง','แคบหมู']
    },
    {
      phrase: 'แกงเขียวหวาน ต้มยำกุ้ง ผัดไทย',
      items: ['แกงเขียวหวาน','ต้มยำกุ้ง','ผัดไทย']
    },
    {
      phrase: 'ตักบาตรเทโว และแห่เจ้าพ่อเจ้าแม่ปากน้ำโพ',
      items: ['ตักบาตรเทโว','แห่เจ้าพ่อเจ้าแม่ปากน้ำโพ']
    },
    {
      phrase: 'ข้าวเหนียว ส้มตำ ลาบ อ่อม และปลาร้า',
      items: ['ข้าวเหนียว','ส้มตำ','ลาบ','อ่อม','ปลาร้า']
    },
    {
      phrase: 'แกงไตปลา แกงเหลือง และแกงคั่วพริกหมู',
      items: ['แกงไตปลา','แกงเหลือง','แกงคั่วพริกหมู']
    },
    {
      phrase: 'แห่ผ้าขึ้นธาตุ และกินเจหรือกินผักในชุมชนเชื้อสายจีน',
      items: ['แห่ผ้าขึ้นธาตุ','กินเจหรือกินผักในชุมชนเชื้อสายจีน']
    }
  ];

  let serverAudio = new Audio();
  let activeAudioReject = null;
  let activeObjectUrl = null;

  const neuralAudioCache = new Map();
  const NEURAL_CACHE_LIMIT = 80;

  function isWindowsServicePage() {
    const host = String(location.hostname || '').toLowerCase();
    const gameLockWebView = !!(window.chrome && window.chrome.webview);
    const ua = String(navigator.userAgent || '');
    const mobileOrTablet =
      !gameLockWebView &&
      (
        /Android|iPhone|iPad|iPod|Mobile/i.test(ua) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
      );

    if (mobileOrTablet) return false;

    return location.port === '770' ||
      gameLockWebView ||
      host.endsWith('.trycloudflare.com');
  }

  function loadSpeechPrefs() {
    const prefs = window.QUIZ_VOICE_SETTINGS || {};
    const configuredRate = Number(prefs.rate);

    if (configuredRate >= 0.75 && configuredRate <= 1.05) {
      speechRate = configuredRate;
    }

    const configuredVoice = String(prefs.voice || 'th-TH-PremwadeeNeural');

    if ($('speechVoice') && SERVER_TTS_VOICES.some(v => v.id === configuredVoice)) {
      $('speechVoice').value = configuredVoice;
    }

    if ($('speechRate')) $('speechRate').value = String(speechRate);
    if ($('speechRateValue')) $('speechRateValue').textContent = `${speechRate.toFixed(2)}x`;
  }

  function saveSpeechPrefs() {
    // Voice settings are managed centrally from QuizWeb Content Manager.
  }

  async function refreshVoices() {
    const select = $('speechVoice');

    if (select) {
      const keep = select.value;
      select.innerHTML = SERVER_TTS_VOICES
        .map(v => `<option value="${esc(v.id)}">${esc(v.label)}</option>`)
        .join('');

      if (SERVER_TTS_VOICES.some(v => v.id === keep)) {
        select.value = keep;
      }
    }

    loadSpeechPrefs();

    if (!isWindowsServicePage()) {
      $('speechStatus').textContent = 'ไม่ได้เปิดผ่าน Windows Service • หน้านี้จะใช้เสียงของอุปกรณ์';
      return;
    }

    try {
      const res = await fetch('/api/tts/status', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const voiceLabel = SERVER_TTS_VOICES.find(v => v.id === selectedVoice())?.label || selectedVoice();
      $('speechStatus').textContent = `พร้อมอ่าน • ${voiceLabel} • เว้นจังหวะโจทย์และรายการ`;
    } catch (_) {
      $('speechStatus').textContent = 'ระบบ Edge Neural ยังไม่พร้อม • จะไม่สลับไปเสียงอื่นเอง';
    }
  }

  function selectedVoice() {
    const value = $('speechVoice')?.value;

    return SERVER_TTS_VOICES.some(v => v.id === value)
      ? value
      : 'th-TH-PremwadeeNeural';
  }

  function normalizeSpeech(text) {
    return String(text ?? '')
      .replace(/\u00a0/g, ' ')
      .replace(/พ\.?\s*ศ\.?/g, 'พุทธศักราช ')
      .replace(/ค\.?\s*ศ\.?/g, 'คริสต์ศักราช ')
      .replace(/ป\.\s*3\b/g, 'ประถมศึกษาปีที่ 3')
      .replace(/\s*•\s*/g, '. ')
      .replace(/[–—]/g, ', ')
      .replace(/\s*\/\s*/g, ' หรือ ')
      .replace(/:/g, ', ')
      .replace(/;/g, '. ')
      .replace(/[()]/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\s*([,.!?])\s*/g, '$1 ')
      .trim();
  }

  function sentenceText(text) {
    const t = normalizeSpeech(text);
    if (!t) return '';
    return /[.!?…]$/.test(t) ? t : `${t}.`;
  }

  function questionTextForSpeech(text) {
    const t = normalizeSpeech(text);
    if (!t) return '';
    return /[?!]$/.test(t) ? t : `${t}?`;
  }

  function splitLongPhrase(text, maxLen = 210) {
    const normalized = normalizeSpeech(text);
    if (!normalized) return [];

    const parts = normalized
      .replace(/([.!?])\s+/g, '$1\n')
      .split(/\n+/)
      .map(x => x.trim())
      .filter(Boolean);

    const out = [];

    for (const part of parts) {
      if (part.length <= maxLen) {
        out.push(part);
        continue;
      }

      const soft = part
        .replace(/\s+(และ|หรือ|แต่|เพราะ|ดังนั้น|ส่วน|เมื่อ|โดย|ซึ่ง|จากนั้น|ต่อมา)\s+/g, ' $1\n')
        .split('\n')
        .map(x => x.trim())
        .filter(Boolean);

      for (const piece of soft) {
        if (piece.length <= maxLen) {
          out.push(piece);
          continue;
        }

        let start = 0;

        while (start < piece.length) {
          let end = Math.min(start + maxLen, piece.length);

          if (end < piece.length) {
            const space = piece.lastIndexOf(' ', end);
            if (space > start + Math.floor(maxLen * 0.55)) end = space;
          }

          const chunk = piece.slice(start, end).trim();
          if (chunk) out.push(chunk);
          start = end;
        }
      }
    }

    return out;
  }

  function findKnownSpeechList(text) {
    const normalized = normalizeSpeech(text);

    for (const list of KNOWN_SPEECH_LISTS) {
      const pos = normalized.indexOf(list.phrase);

      if (pos >= 0) {
        return {
          normalized,
          list,
          before: normalized.slice(0, pos).trim(),
          after: normalized.slice(pos + list.phrase.length).trim()
        };
      }
    }

    return null;
  }

  function addNormalSegments(segments, raw, pause, maxLen, mode = 'sentence') {
    const pieces = splitLongPhrase(raw, maxLen);

    pieces.forEach((piece, index) => {
      let spoken = normalizeSpeech(piece);
      if (!spoken) return;

      if (mode === 'question') spoken = questionTextForSpeech(spoken);
      else if (mode !== 'raw') spoken = sentenceText(spoken);

      segments.push({
        text: spoken,
        pause: index === pieces.length - 1 ? pause : 190
      });
    });
  }

  function buildSpeechSegments(parts, defaultPause = 360) {
    const segments = [];

    for (const part of parts) {
      if (!part) continue;

      const raw = typeof part === 'string' ? part : part.text;
      const pause = typeof part === 'string'
        ? defaultPause
        : Number(part.pause ?? defaultPause);
      const maxLen = typeof part === 'string'
        ? 210
        : Number(part.maxLen ?? 210);
      const mode = typeof part === 'string'
        ? 'sentence'
        : (part.mode || 'sentence');

      const known = findKnownSpeechList(raw);

      if (!known) {
        addNormalSegments(segments, raw, pause, maxLen, mode);
        continue;
      }

      // Read the sentence introduction first.
      if (known.before) {
        addNormalSegments(segments, known.before, 380, maxLen, 'sentence');
      }

      // Each list item gets a real pause. This does not depend on TTS interpreting spaces.
      known.list.items.forEach((item, index) => {
        segments.push({
          text: sentenceText(item),
          pause: index === known.list.items.length - 1 ? 520 : 480
        });
      });

      // Read any trailing clause after the list.
      if (known.after) {
        addNormalSegments(segments, known.after, pause, maxLen, mode);
      } else if (segments.length) {
        // Preserve the caller's final pause after the list.
        segments[segments.length - 1].pause = Math.max(
          segments[segments.length - 1].pause,
          pause
        );
      }
    }

    return segments;
  }

  function cleanupAudioUrl() {
    if (activeObjectUrl) {
      try { URL.revokeObjectURL(activeObjectUrl); } catch (_) {}
      activeObjectUrl = null;
    }
  }

  function cancelSpeechResources() {
    if (activeAudioReject) {
      const reject = activeAudioReject;
      activeAudioReject = null;

      try {
        reject(new DOMException('Stopped', 'AbortError'));
      } catch (_) {}
    }

    try {
      serverAudio.pause();
      serverAudio.removeAttribute('src');
      serverAudio.load();
    } catch (_) {}

    cleanupAudioUrl();

    if ('speechSynthesis' in window) {
      try { speechSynthesis.cancel(); } catch (_) {}
    }
  }

  /* QUIZWEB_SPEECH_LOCK_BL_START */
  let speechUiBusy = false;
  let lastSpeechTrigger = null;
  let inlineSpeechStopBtn = null;

  function speechControlSelector() {
    return '#readLessonBtn,.read-section,#readQuestionAllBtn,.option-speak,#testSpeechBtn';
  }

  function ensureInlineSpeechStopButton() {
    if (inlineSpeechStopBtn && inlineSpeechStopBtn.isConnected) return inlineSpeechStopBtn;

    inlineSpeechStopBtn = document.createElement('button');
    inlineSpeechStopBtn.id = 'inlineSpeechStopBtn';
    inlineSpeechStopBtn.type = 'button';
    inlineSpeechStopBtn.textContent = '■ หยุด';
    inlineSpeechStopBtn.hidden = true;
    inlineSpeechStopBtn.addEventListener('click', ev => {
      ev.preventDefault();
      ev.stopPropagation();
      stopSpeech('หยุดอ่านแล้ว');
    });

    document.body.appendChild(inlineSpeechStopBtn);
    return inlineSpeechStopBtn;
  }

  function rememberSpeechTrigger(ev) {
    const target = ev.target?.closest?.(speechControlSelector());
    if (target && target.id !== 'inlineSpeechStopBtn') lastSpeechTrigger = target;
  }

  document.addEventListener('pointerdown', rememberSpeechTrigger, true);
  document.addEventListener('keydown', ev => {
    if (ev.key !== 'Enter' && ev.key !== ' ') return;
    rememberSpeechTrigger(ev);
  }, true);

  function setSpeechUiBusy(busy) {
    speechUiBusy = !!busy;

    document.querySelectorAll(speechControlSelector()).forEach(el => {
      if (el.id === 'inlineSpeechStopBtn') return;
      el.classList.toggle('speech-control-locked', speechUiBusy);
      el.setAttribute('aria-disabled', speechUiBusy ? 'true' : 'false');
      if ('disabled' in el) el.disabled = speechUiBusy;
    });

    const stop = ensureInlineSpeechStopButton();

    if (!speechUiBusy) {
      stop.hidden = true;
      stop.removeAttribute('style');
      if (stop.parentElement !== document.body) document.body.appendChild(stop);
      lastSpeechTrigger = null;
      return;
    }

    let anchor = lastSpeechTrigger;
    if (!anchor || !anchor.isConnected) {
      anchor = document.activeElement?.closest?.(speechControlSelector()) || null;
    }

    if (anchor && anchor.parentElement) {
      stop.removeAttribute('style');
      anchor.insertAdjacentElement('afterend', stop);
      stop.hidden = false;
    } else {
      document.body.appendChild(stop);
      stop.hidden = false;
      stop.style.position = 'fixed';
      stop.style.right = '22px';
      stop.style.bottom = '22px';
      stop.style.zIndex = '9999';
    }
  }

  function speechRequestWithTimeout(promise, timeoutMs = 120000) {
    return Promise.race([
      promise,
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('TTS timeout')), timeoutMs);
      })
    ]);
  }
  /* QUIZWEB_SPEECH_LOCK_BL_END */

  function stopSpeech(status = 'หยุดอ่านแล้ว') {
    speechSession++;
    cancelSpeechResources();
    setSpeechUiBusy(false);

    if ($('speechStatus')) {
      $('speechStatus').textContent = status;
    }
  }

  function wait(ms, session) {
    return new Promise(resolve => {
      setTimeout(() => resolve(session === speechSession), ms);
    });
  }

  function neuralCacheKey(text, voiceId, rateValue) {
    return `${voiceId}|${Number(rateValue).toFixed(2)}|${text}`;
  }

  function trimNeuralCache() {
    while (neuralAudioCache.size > NEURAL_CACHE_LIMIT) {
      const firstKey = neuralAudioCache.keys().next().value;

      if (!firstKey) break;
      neuralAudioCache.delete(firstKey);
    }
  }

  function requestNeuralAudio(text, voiceId, rateValue) {
    const key = neuralCacheKey(text, voiceId, rateValue);

    if (neuralAudioCache.has(key)) {
      return neuralAudioCache.get(key);
    }

    const promise = fetch('/api/tts/synthesize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({
        voice: voiceId,
        text,
        rate: rateValue
      })
    }).then(async response => {
      if (!response.ok) {
        let message = `HTTP ${response.status}`;

        try {
          const body = await response.json();
          if (body?.message) message = body.message;
        } catch (_) {}

        throw new Error(message);
      }

      const actualVoice = response.headers.get('X-QuizWeb-Voice');

      if (actualVoice && actualVoice !== voiceId) {
        throw new Error(`voice mismatch: ${actualVoice}`);
      }

      const blob = await response.blob();

      if (blob.size < 500) {
        throw new Error('audio is too small');
      }

      return blob;
    }).catch(error => {
      neuralAudioCache.delete(key);
      throw error;
    });

    neuralAudioCache.set(key, promise);
    trimNeuralCache();

    return promise;
  }

  async function playBlob(blob, session) {
    if (session !== speechSession) {
      throw new DOMException('Stopped', 'AbortError');
    }

    cleanupAudioUrl();
    activeObjectUrl = URL.createObjectURL(blob);
    serverAudio.src = activeObjectUrl;
    serverAudio.preload = 'auto';

    await new Promise((resolve, reject) => {
      let finished = false;

      const done = (error = null) => {
        if (finished) return;
        finished = true;

        activeAudioReject = null;
        serverAudio.onended = null;
        serverAudio.onerror = null;
        cleanupAudioUrl();

        if (error) reject(error);
        else resolve();
      };

      activeAudioReject = reject;
      serverAudio.onended = () => done();
      serverAudio.onerror = () => done(new Error('audio playback error'));

      const playPromise = serverAudio.play();

      if (playPromise?.catch) {
        playPromise.catch(done);
      }
    });

    if (session !== speechSession) {
      throw new DOMException('Stopped', 'AbortError');
    }
  }

  function bestBrowserVoice() {
    if (!('speechSynthesis' in window)) return null;

    const voices = speechSynthesis.getVoices()
      .filter(v => /^th(-|_)/i.test(v.lang) || /thai|ภาษาไทย/i.test(`${v.name} ${v.voiceURI}`));

    const score = v => {
      const n = `${v.name} ${v.voiceURI}`.toLowerCase();
      let s = 0;

      if (/^th/i.test(v.lang)) s += 1000;
      if (/premwadee|achara|natural|neural|online/i.test(n)) s += 500;
      if (/microsoft/i.test(n)) s += 300;
      if (/google/i.test(n)) s += 250;

      return s;
    };

    return voices.sort((a, b) => score(b) - score(a))[0] || null;
  }

  function speakBrowserWhole(text, session) {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        return reject(new Error('อุปกรณ์ไม่รองรับเสียงอ่าน'));
      }

      if (session !== speechSession) {
        return reject(new DOMException('Stopped', 'AbortError'));
      }

      const voice = bestBrowserVoice();
      const utterance = new SpeechSynthesisUtterance(text);

      utterance.lang = voice?.lang || 'th-TH';

      if (voice) {
        utterance.voice = voice;
      }

      utterance.rate = Math.max(0.72, Math.min(1.0, speechRate * 0.96));
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onend = resolve;
      utterance.onerror = e => {
        if (e.error === 'canceled' || e.error === 'interrupted') resolve();
        else reject(new Error(e.error || 'speech error'));
      };

      speechSynthesis.speak(utterance);
    });
  }

  async function speakSequence(parts, pauseMs = 360) {
    if (typeof speechUiBusy !== 'undefined' && speechUiBusy) return;

    speechSession++;
    const session = speechSession;

    cancelSpeechResources();

    const setBusy =
      typeof setSpeechUiBusy === 'function'
        ? setSpeechUiBusy
        : function(){};
    setBusy(true);

    const segments = buildSpeechSegments(parts, pauseMs);

    if (!segments.length) {
      setBusy(false);
      return;
    }

    const voiceId = selectedVoice();
    const rateValue = speechRate;
    const voiceLabel =
      SERVER_TTS_VOICES.find(v => v.id === voiceId)?.label || voiceId;

    /*
      CD speech pacing:
      - Preserve real pauses between headings / bullet points / sentences.
      - Only merge tiny continuation fragments (normally ~190 ms splits).
      - Keep each synthesized chunk small so "Read all" starts quickly.
      - Prefetch only one chunk ahead to avoid flooding Edge TTS.
    */
    const batches = [];
    let buffer = '';
    let lastPause = pauseMs;

    const flush = () => {
      const text = String(buffer || '').trim();
      if (!text) return;
      batches.push({
        text,
        pause: Math.max(0, Number(lastPause) || 0)
      });
      buffer = '';
      lastPause = pauseMs;
    };

    for (const seg of segments) {
      const text = String(seg?.text || '').trim();
      if (!text) continue;

      const segPause = Math.max(0, Number(seg?.pause ?? pauseMs) || 0);
      const canMergeContinuation =
        !!buffer &&
        lastPause <= 240 &&
        (buffer.length + 1 + text.length) <= 420;

      if (!buffer) {
        buffer = text;
        lastPause = segPause;
      } else if (canMergeContinuation) {
        buffer += ' ' + text;
        lastPause = segPause;
      } else {
        flush();
        buffer = text;
        lastPause = segPause;
      }

      // Never let one Edge-TTS request become a huge paragraph again.
      if (buffer.length >= 420) flush();
    }

    flush();

    const withTimeout = (promise, ms) => {
      if (typeof speechRequestWithTimeout === 'function') {
        return speechRequestWithTimeout(promise, ms);
      }

      let timer = null;
      return Promise.race([
        promise,
        new Promise((_, reject) => {
          timer = setTimeout(
            () => reject(new Error('เตรียมเสียงนานเกินไป')),
            ms
          );
        })
      ]).finally(() => {
        if (timer) clearTimeout(timer);
      });
    };

    try {
      if (isWindowsServicePage()) {
        const jobs = new Map();

        const prime = index => {
          if (
            index < 0 ||
            index >= batches.length ||
            jobs.has(index)
          ) return;

          jobs.set(
            index,
            withTimeout(
              requestNeuralAudio(
                batches[index].text,
                voiceId,
                rateValue
              ),
              45000
            )
          );
        };

        prime(0);

        for (let i = 0; i < batches.length; i++) {
          if (session !== speechSession) return;

          $('speechStatus').textContent =
            batches.length > 1
              ? `กำลังเตรียมเสียง ${voiceLabel} • ${i + 1}/${batches.length}…`
              : `กำลังเตรียมเสียง ${voiceLabel}…`;

          prime(i + 1);

          let blob = null;
          try {
            blob = await jobs.get(i);
          } catch (edgeError) {
            if (
              session !== speechSession ||
              edgeError?.name === 'AbortError'
            ) return;

            console.warn('Edge Neural chunk failed; using device voice for this chunk:', edgeError);
            $('speechStatus').textContent =
              `เสียงออนไลน์ช้า • ใช้เสียงของอุปกรณ์ช่วงนี้`;

            await speakBrowserWhole(batches[i].text, session);

            if (batches[i].pause > 0 && i < batches.length - 1) {
              const keepGoing = await wait(batches[i].pause, session);
              if (!keepGoing) return;
            }

            continue;
          }

          if (session !== speechSession) return;


          $('speechStatus').textContent =
            `กำลังอ่านด้วย ${voiceLabel}…`;

          await playBlob(blob, session);

          if (session !== speechSession) return;

          if (batches[i].pause > 0 && i < batches.length - 1) {
            const keepGoing = await wait(batches[i].pause, session);
            if (!keepGoing) return;
          }
        }

        if (session === speechSession) {
          $('speechStatus').textContent =
            `อ่านจบแล้ว • ${voiceLabel}`;
        }

        return;
      }

      // Browser / phone / tablet: preserve the same pauses instead of
      // speaking the whole lesson as one continuous paragraph.
      $('speechStatus').textContent = 'กำลังใช้เสียงของอุปกรณ์';

      for (let i = 0; i < batches.length; i++) {
        if (session !== speechSession) return;

        await speakBrowserWhole(batches[i].text, session);

        if (batches[i].pause > 0 && i < batches.length - 1) {
          const keepGoing = await wait(batches[i].pause, session);
          if (!keepGoing) return;
        }
      }

      if (session === speechSession) {
        $('speechStatus').textContent =
          'อ่านจบแล้ว • เสียงของอุปกรณ์';
      }
    } catch (error) {
      if (
        session !== speechSession ||
        error?.name === 'AbortError'
      ) return;

      console.warn('QuizWeb speech failed:', error);
      $('speechStatus').textContent =
        `อ่านไม่สำเร็จ • ${error?.message || 'กรุณาลองใหม่'}`;
    } finally {
      if (session === speechSession) {
        setBusy(false);
      }
    }
  }

  function lessonSpeechParts(lesson) {
    if (!lesson) return [];

    const parts = [
      {
        text: `บทที่ ${lesson.number}. ${lesson.title}`,
        pause: 700,
        maxLen: 180
      },
      {
        text: lesson.intro,
        pause: 900,
        maxLen: 200
      }
    ];

    lesson.sections.forEach(section => {
      parts.push({
        text: section.title,
        pause: 550,
        maxLen: 160
      });

      section.points.forEach(point => {
        parts.push({
          text: point,
          pause: 620,
          maxLen: 210
        });
      });

      if (parts.length) {
        parts[parts.length - 1].pause = 900;
      }
    });

    return parts;
  }

  function sectionSpeechParts(section) {
    if (!section) return [];

    return [
      {
        text: section.title,
        pause: 550,
        maxLen: 160
      },
      ...section.points.map((point, index) => ({
        text: point,
        pause: index === section.points.length - 1 ? 350 : 620,
        maxLen: 210
      }))
    ];
  }

  function speak(text) {
    speakSequence([
      {
        text,
        pause: 350,
        maxLen: 200
      }
    ], 350);
  }

  function quizNumberSpeech(number) {
    return QUIZ_NUMBER_WORDS[number] || String(number);
  }

  function quizSpeechParts(q, index = quizIndex) {
    if (!q) return [];

    const number = index + 1;

    const parts = [
      // User requested only "ข้อหนึ่ง", not "ข้อหนึ่งจากสามสิบ".
      {
        text: `ข้อ${quizNumberSpeech(number)}`,
        pause: 320,
        maxLen: 60,
        mode: 'raw'
      },

      // Give the learner real thinking time after the question.
      {
        text: q.q,
        pause: 1900,
        maxLen: 210,
        mode: 'question'
      },

    ];

    q.o.forEach((option, i) => {
      parts.push({
        text: `${letterSpeech[i]}, ${normalizeSpeech(option)}`,
        pause: i === q.o.length - 1 ? 300 : 620,
        maxLen: 190,
        mode: 'sentence'
      });
    });

    return parts;
  }
function prefetchQuestionSpeech(index) {
    return;
  }

  function renderLessonSelect() {
    const lessons = subjectLessons();
    if (!lessons.length) return;
    if (!lessons.some(l => l.id === currentLessonId)) currentLessonId = lessons[0].id;
    $('lessonSelect').innerHTML = lessons.map(l => `<option value="${l.id}">บทที่ ${l.number} — ${esc(l.shortTitle)}</option>`).join('');
    $('lessonSelect').value = currentLessonId;
  }

  function renderLesson() {
    const l = getLesson(currentLessonId);
    if (!l) return;
    $('lessonTitle').textContent = `บทที่ ${l.number} — ${l.title}`;
    $('lessonContent').innerHTML = `
      <article class="lesson-summary card">
        <p class="lesson-intro">${esc(l.intro)}</p>
        ${renderMedia(l.images || l.image, 'lesson-media')}
      </article>
      ${l.sections.map((s, i) => `
        <article class="lesson-section card">
          <div class="lesson-section-head">
            <div><span class="eyebrow">หัวข้อ ${i+1}</span><h3>${esc(s.title)}</h3></div>
            <button class="listen-btn read-section" data-section="${i}" type="button"><span class="btn-icon speaker-icon" aria-hidden="true">🔊</span><span>อ่านหัวข้อนี้</span></button>
          </div>
          ${renderMedia(s.images || s.image, 'section-media')}
          <ul>${s.points.map(p => `<li>${esc(p)}</li>`).join('')}</ul>
        </article>`).join('')}`;

    document.querySelectorAll('.read-section').forEach(btn => btn.addEventListener('click', () => {
      const s = l.sections[Number(btn.dataset.section)];
      speakSequence(sectionSpeechParts(s), 420);
    }));
  }

  function shuffled(items) {
    const a = [...items];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function quizRotationKey() {
    return `quizWebRotation:${currentSubjectId || 'general'}`;
  }

  function pickRoundQuestions(pool) {
    const unique = [...new Map(pool.map(q => [q.id, q])).values()];
    const limit = Math.min(QUIZ_ROUND_LIMIT, unique.length);
    if (unique.length <= limit) return shuffled(unique);

    let counts = {};
    try { counts = JSON.parse(localStorage.getItem(quizRotationKey()) || '{}') || {}; } catch (_) {}

    // เลือกข้อที่ถูกใช้รอบก่อน ๆ น้อยที่สุดก่อน แล้วสุ่มในกลุ่มที่มีจำนวนครั้งเท่ากัน
    const ranked = unique
      .map(q => ({q, used:Number(counts[q.id] || 0), tie:Math.random()}))
      .sort((a,b) => a.used - b.used || a.tie - b.tie);
    const selected = ranked.slice(0, limit).map(x => x.q);
    selected.forEach(q => { counts[q.id] = Number(counts[q.id] || 0) + 1; });

    try { localStorage.setItem(quizRotationKey(), JSON.stringify(counts)); } catch (_) {}
    return shuffled(selected);
  }

  function renderQuizSets() {
    const subject = currentSubject();
    if (!subject) return;
    const questions = subjectQuestions();
    const roundCount = Math.min(QUIZ_ROUND_LIMIT, questions.length);

    $('quizSetGrid').innerHTML = `<article class="quiz-set-card card single-quiz-card simple-quiz-card">
      <h3>แบบทดสอบวิชา${esc(subject.title)}</h3>
      <button class="primary start-quiz" type="button">เริ่มทำแบบทดสอบ</button>
    </article>`;

    document.querySelector('.start-quiz').addEventListener('click', () => startQuiz());
  }

  function startQuiz() {
    const pool = subjectQuestions();
    quizQuestions = pickRoundQuestions(pool);
    activeQuizName = `วิชา${currentSubject().title} • ${quizQuestions.length} ข้อ`;
    quizIndex = 0;
    score = 0;
    mistakes = [];
    selectedIndex = null;
    answered = false;
    renderQuestion();
    setView('quiz');
  }

  function renderQuestion() {
    /* QUIZWEB_CH_BUTTON_RESET_START */
    try {
      const chCheckBtn = $('checkAnswerBtn');
      const chNextBtn = $('nextQuestionBtn');
      if (chCheckBtn) {
        chCheckBtn.disabled = false;
        chCheckBtn.hidden = false;
        chCheckBtn.classList.remove('hidden');
        chCheckBtn.textContent = 'ตรวจคำตอบ';
      }
      if (chNextBtn) {
        chNextBtn.disabled = false;
        chNextBtn.hidden = true;
        chNextBtn.classList.add('hidden');
      }
    } catch (_) {}
    /* QUIZWEB_CH_BUTTON_RESET_END */
const q = quizQuestions[quizIndex];
    if (!q) return;
    selectedIndex = null;
    answered = false;
    $('quizSetName').textContent = activeQuizName;
    $('quizProgressText').textContent = `ข้อ ${quizIndex + 1} / ${quizQuestions.length}`;
    $('quizProgressBar').style.width = `${((quizIndex + 1) / quizQuestions.length) * 100}%`;
    $('questionSource').textContent = q.source;
    $('questionText').textContent = q.q;
    $('questionMedia').innerHTML = renderMedia(q.images || q.image, 'question-media');
    $('optionList').innerHTML = q.o.map((opt, i) => `
      <button class="option" data-index="${i}" type="button">
        <span class="option-letter">${letters[i]}</span>
        <span class="option-text">${esc(opt)}</span>
        <span class="option-speak" data-speak-index="${i}" role="button" aria-label="อ่านตัวเลือก ${letters[i]}" tabindex="0"><span class="speaker-icon" aria-hidden="true">🔊</span></span>
      </button>`).join('');
    $('feedbackBox').className = 'feedback hidden';
    $('feedbackBox').innerHTML = '';
    $('checkAnswerBtn').disabled = true;
    $('checkAnswerBtn').classList.remove('hidden');
    $('nextQuestionBtn').classList.add('hidden');

    document.querySelectorAll('.option').forEach(btn => btn.addEventListener('click', (ev) => {
      if (answered) return;
      if (ev.target.closest('.option-speak')) return;
      selectedIndex = Number(btn.dataset.index);
      document.querySelectorAll('.option').forEach(x => x.classList.remove('selected'));
      btn.classList.add('selected');
      $('checkAnswerBtn').disabled = false;
    }));

    document.querySelectorAll('.option-speak').forEach(btn => {
      const say = () => {
        const i = Number(btn.dataset.speakIndex);
        speakSequence([{text:`${letterSpeech[i]}, ${q.o[i]}`,pause:320,maxLen:190}], 320);
      };
      btn.addEventListener('click', ev => { ev.stopPropagation(); say(); });
      btn.addEventListener('keydown', ev => {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); say(); }
      });
    });
  }
  function checkAnswer() {
    if (selectedIndex === null || answered) return;

    const q = quizQuestions[quizIndex];
    if (!q || !Array.isArray(q.o) || selectedIndex < 0 || selectedIndex >= q.o.length) return;

    answered = true;
    const options = [...document.querySelectorAll('.option')];
    const correct = selectedIndex === q.a;

    if (correct) {
      score++;
    } else {
      mistakes.push({
        q: q.q,
        selected: q.o[selectedIndex],
        correct: q.o[q.a],
        explanation: q.e
      });
    }

    const checkBtn = $('checkAnswerBtn');
    const nextBtn = $('nextQuestionBtn');
    const feedback = $('feedbackBox');

    let reviewEach = true;
    try {
      const value = new URLSearchParams(location.search || '').get('reviewEach');
      reviewEach = value !== '0';
    } catch (_) {
      reviewEach = true;
    }

    if (checkBtn) {
      checkBtn.disabled = true;
      checkBtn.hidden = true;
      checkBtn.classList.add('hidden');
    }

    if (reviewEach) {
      // FAIL-SAFE FIRST: make Next usable BEFORE rendering feedback.
      if (nextBtn) {
        nextBtn.disabled = false;
        nextBtn.hidden = false;
        nextBtn.classList.remove('hidden');
        nextBtn.textContent =
          quizIndex >= quizQuestions.length - 1 ? 'ดูคะแนน' : 'ไปข้อถัดไป';
      }

      try {
        options.forEach((el, i) => {
          el.classList.remove('selected');
          if (i === q.a) el.classList.add('correct');
          if (i === selectedIndex && i !== q.a) el.classList.add('wrong');
        });

        if (feedback) {
          feedback.className = `feedback${correct ? '' : ' bad'}`;
          feedback.innerHTML =
            `<strong>${
              correct
                ? 'ถูกต้อง ✓'
                : `ยังไม่ถูก — คำตอบคือ ${letters[q.a]}. ${esc(q.o[q.a])}`
            }</strong><span>${esc(q.e || '')}</span>`;
        }
      } catch (_) {
        // Next was exposed first, so a feedback error can never trap the quiz.
      }
      return;
    }

    // Check-at-end mode: never reveal correctness during the quiz and move on.
    if (nextBtn) {
      nextBtn.disabled = false;
      nextBtn.hidden = true;
      nextBtn.classList.add('hidden');
    }

    try {
      options.forEach(el => {
        el.classList.remove('selected', 'correct', 'wrong');
      });
      if (feedback) {
        feedback.className = 'feedback hidden';
        feedback.innerHTML = '';
      }
    } catch (_) {}

    window.setTimeout(() => {
      try {
        nextQuestion();
      } catch (_) {
        // Last-resort escape hatch: if automatic navigation fails, expose Next.
        if (nextBtn) {
          nextBtn.disabled = false;
          nextBtn.hidden = false;
          nextBtn.classList.remove('hidden');
          nextBtn.textContent =
            quizIndex >= quizQuestions.length - 1 ? 'ดูคะแนน' : 'ไปข้อถัดไป';
        }
      }
    }, 90);
  }



















  function nextQuestion() {
    stopSpeech('พร้อมอ่าน');
    if (quizIndex < quizQuestions.length - 1) {
      quizIndex++;
      renderQuestion();
      document.querySelector('.quiz-card').scrollIntoView({behavior:'smooth', block:'start'});
    } else finishQuiz();
  }

  function resultStorageKey() {
    return `quizWebLastResult:${currentSubjectId || 'general'}`;
  }

  async function issueStandaloneCoupon(result) {
    try {
      const response = await fetch('/api/quizweb/coupon/issue', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          score: result.score,
          total: result.total,
          subjectId: result.subjectId || '',
          quizName: result.quizName || ''
        })
      });

      if (!response.ok) throw new Error('coupon issue failed');

      const data = await response.json();
      result.couponPending = false;
      result.couponError = '';
      result.grantedMinutes = Number(data.grantedMinutes) || 0;
      result.couponCode = String(data.couponCode || '');
      result.couponTotalSeconds = Number(data.couponTotalSeconds) || 0;
      result.couponRemainingSeconds = Number(data.couponRemainingSeconds) || 0;

      localStorage.setItem(resultStorageKey(), JSON.stringify(result));

      if (result.couponCode) {
        try {
          localStorage.setItem('quizWebLatestCoupon', JSON.stringify({
            code: result.couponCode,
            total: result.couponTotalSeconds,
            remaining: result.couponRemainingSeconds,
            subjectId: result.subjectId || '',
            at: Date.now()
          }));
        } catch (_) {}
      }

      renderResults();
    } catch (_) {
      result.couponPending = false;
      result.couponError = 'สร้างคูปองไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อกับ QuizWeb แล้วทำแบบทดสอบอีกครั้ง';
      localStorage.setItem(resultStorageKey(), JSON.stringify(result));
      renderResults();
    }
  }

  function finishQuiz() {
    let gameLockMode = false;
    let gameLockToken = '';
    let androidKioskMode = false;

    try {
      const gameLockParams = new URLSearchParams(window.location.search);
      gameLockMode = gameLockParams.get('gamelock') === '1';
      gameLockToken = gameLockParams.get('gamelockToken') || '';
      androidKioskMode =
        gameLockParams.get('androidKiosk') === '1' ||
        !!window.QuizWebAndroid;
    } catch (_) {
      try { androidKioskMode = !!window.QuizWebAndroid; } catch (_) {}
    }

    const result = {
      subjectId: currentSubjectId,
      quizName: activeQuizName,
      score,
      total: quizQuestions.length,
      percent: Math.round((score / quizQuestions.length) * 100),
      mistakes,
      finishedAt: new Date().toISOString()
    };

    const normalizedScore = result.total > 0
      ? (Number(result.score) * 30 / Number(result.total))
      : 0;

    // Standalone QuizWeb: one passed subject = one 8-digit coupon.
    // Windows GameLock and Android Kiosk never create coupons; score unlocks that device directly.
    if (!gameLockMode && !androidKioskMode && normalizedScore >= 26) {
      result.couponPending = true;
    }

    if (androidKioskMode) {
      result.androidKiosk = true;
      result.grantedMinutes = normalizedScore >= 29
        ? 120
        : normalizedScore >= 26
          ? 60
          : 0;
    }

    localStorage.setItem(resultStorageKey(), JSON.stringify(result));
    setView('results');

    /* QUIZWEB_ANDROID_KIOSK_RESULT_START */
    if (androidKioskMode) {
      try {
        if (
          window.QuizWebAndroid &&
          typeof window.QuizWebAndroid.onQuizResult === 'function'
        ) {
          const granted = Number(
            window.QuizWebAndroid.onQuizResult(
              Number(result.score) || 0,
              Number(result.total) || 0
            )
          ) || 0;

          result.grantedMinutes = granted;
          result.androidUnlockError = '';
        } else {
          result.androidUnlockError =
            'ไม่พบตัวเชื่อม Android Kiosk กรุณาเปิดหน้านี้ผ่านแอป QuizWeb Tablet Kiosk';
        }
      } catch (_) {
        result.androidUnlockError =
          'Android Kiosk รับผลคะแนนไม่สำเร็จ กรุณาเปิดแอปใหม่แล้วลองอีกครั้ง';
      }

      localStorage.setItem(resultStorageKey(), JSON.stringify(result));
      renderResults();
      return;
    }
    /* QUIZWEB_ANDROID_KIOSK_RESULT_END */

    /* QUIZWEB_GAMELOCK_RESULT_START */
    if (gameLockMode && gameLockToken) {
      fetch('http://127.0.0.1:773/api/quiz-result', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          score: result.score,
          total: result.total,
          token: gameLockToken
        }),
        keepalive: true
      }).catch(() => {});
      return;
    }
    /* QUIZWEB_GAMELOCK_RESULT_END */

    if (!gameLockMode && result.couponPending) {
      issueStandaloneCoupon(result);
    }
  }

  function renderResults() {
    let r = null;
    try { r = JSON.parse(localStorage.getItem(resultStorageKey()) || 'null'); } catch (_) {}

    if (!r) {
      $('resultContent').innerHTML = `<article class="result-card card"><h3>ยังไม่มีผลการทำแบบทดสอบของวิชา${esc(currentSubject()?.title || '')}</h3><p class="muted">ลองทำแบบทดสอบให้ครบก่อน คะแนนจะถูกบันทึกไว้ในเบราว์เซอร์เครื่องนี้</p><button class="primary" id="goQuizFromResult" type="button">ไปทำแบบทดสอบ</button></article>`;
      $('goQuizFromResult').addEventListener('click', () => setView('quizSelect'));
      return;
    }

    const level = r.percent >= 80 ? 'ดีมาก' : r.percent >= 60 ? 'ทำได้ดี' : 'ลองทบทวนแล้วทำอีกครั้ง';
    const couponSeconds = Math.max(0, Number(r.couponRemainingSeconds || r.couponTotalSeconds) || 0);
    const couponMinutes = couponSeconds > 0 ? Math.ceil(couponSeconds / 60) : 0;
    const couponTimeText = couponMinutes >= 120
      ? '2 ชั่วโมง'
      : couponMinutes >= 60
        ? '1 ชั่วโมง'
        : `${couponMinutes} นาที`;
    const couponBlock = r.couponPending
      ? `<article class="card lesson-section"><h3>กำลังสร้างคูปอง 8 หลัก…</h3><p class="muted">ผ่านเกณฑ์แล้ว ระบบกำลังออกคูปองสำหรับนำไปกรอกใน GameLock</p></article>`
      : r.couponCode
        ? `<article class="card lesson-section" style="text-align:center"><h3>คูปองเวลาเล่น</h3><p class="muted">1 วิชาที่ผ่านเกณฑ์ = 1 คูปอง</p><div style="font-size:clamp(30px,8vw,48px);font-weight:800;letter-spacing:.16em;margin:14px 0 8px">${esc(r.couponCode)}</div><p>ใช้เวลาได้ <strong>${esc(couponTimeText)}</strong></p><p class="muted">นำ PIN 8 หลักนี้ไปกรอกที่ปุ่มคูปองใน GameLock เวลาที่ใช้ไม่หมดจะเก็บไว้ใช้ต่อได้</p><button class="primary" id="copyCouponBtn" type="button">คัดลอกรหัสคูปอง</button></article>`
        : r.couponError
          ? `<article class="card lesson-section"><h3>ออกคูปองไม่สำเร็จ</h3><p class="muted">${esc(r.couponError)}</p></article>`
          : '';

    const androidGrant = Math.max(0, Number(r.grantedMinutes) || 0);
    const androidBlock = r.androidKiosk
      ? r.androidUnlockError
        ? `<article class="card lesson-section"><h3>ปลดล็อก Android ไม่สำเร็จ</h3><p class="muted">${esc(r.androidUnlockError)}</p></article>`
        : androidGrant > 0
          ? `<article class="card lesson-section" style="text-align:center"><h3>ปลดล็อก Tablet แล้ว</h3><p>ใช้เครื่องได้ <strong>${androidGrant >= 120 ? '2 ชั่วโมง' : '1 ชั่วโมง'}</strong></p><p class="muted">Android Kiosk ใช้คะแนนปลดเวลาโดยตรง จึงไม่สร้างคูปอง</p></article>`
          : `<article class="card lesson-section"><h3>ยังไม่ผ่านเกณฑ์ปลดล็อก</h3><p class="muted">ต้องได้อย่างน้อย 26/30 เพื่อปลดล็อก 1 ชั่วโมง และ 29/30 ขึ้นไปเพื่อปลดล็อก 2 ชั่วโมง</p></article>`
      : '';

    $('resultContent').innerHTML = `
      <article class="result-card card">
        <span class="pill">${esc(r.quizName)}</span>
        <div class="score-circle"><div><strong>${r.score}/${r.total}</strong><span>${r.percent}%</span></div></div>
        <h2>${level}</h2>
        <p class="muted">คะแนนล่าสุดของวิชานี้เก็บไว้เฉพาะในเบราว์เซอร์เครื่องนี้</p>
        <button class="primary" id="retryBtn" type="button">ทำแบบทดสอบอีกครั้ง</button>
      </article>
      ${couponBlock}
      ${androidBlock}
      ${r.mistakes && r.mistakes.length ? `<article class="card lesson-section"><h3>ข้อที่ควรทบทวน</h3><div class="mistake-list">${r.mistakes.map(m => `<div class="mistake-item"><p><strong>${esc(m.q)}</strong></p><small>คำตอบที่เลือก: ${esc(m.selected)} • คำตอบที่ถูก: ${esc(m.correct)}</small><p>${esc(m.explanation)}</p></div>`).join('')}</div></article>` : `<article class="card lesson-section"><h3>เยี่ยมมาก</h3><p>ตอบถูกทุกข้อในรอบนี้</p></article>`}`;
    $('retryBtn').addEventListener('click', () => setView('quizSelect'));
    const copyCouponBtn = $('copyCouponBtn');
    if (copyCouponBtn && r.couponCode) {
      copyCouponBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(String(r.couponCode));
          copyCouponBtn.textContent = 'คัดลอกแล้ว';
        } catch (_) {
          copyCouponBtn.textContent = String(r.couponCode);
        }
      });
    }
  }

  tabs.forEach(t => t.addEventListener('click', () => {
    if (t.classList.contains('disabled-tab')) return;
    if (['home','settings'].includes(t.dataset.view)) stopSpeech('พร้อมอ่าน');
    setView(t.dataset.view);
  }));

  document.querySelectorAll('.go-settings').forEach(b => b.addEventListener('click', () => {
    stopSpeech('พร้อมอ่าน');
    setView('settings');
  }));

  document.querySelectorAll('.back-subjects').forEach(b => b.addEventListener('click', () => {
    stopSpeech('พร้อมอ่าน');
    setView('home');
  }));
  document.querySelectorAll('.back-to-subject').forEach(b => b.addEventListener('click', () => {
    stopSpeech('พร้อมอ่าน');
    setView('subject');
  }));

  $('lessonSelect').addEventListener('change', ev => {
    currentLessonId = ev.target.value;
    stopSpeech('พร้อมอ่าน');
    renderLesson();
  });
  $('readLessonBtn').addEventListener('click', () => speakSequence(lessonSpeechParts(getLesson(currentLessonId)), 480));
  $('lessonBackBtn').addEventListener('click', () => {
    stopSpeech('พร้อมอ่าน');
    setView('subject');
  });
  $('stopSpeechBtn').addEventListener('click', () => stopSpeech());
  $('testSpeechBtn').addEventListener('click', () => speakSequence([
    {text:'สวัสดีค่ะ',pause:500,maxLen:80},
    {text:'นี่คือเสียงที่คุณเลือกไว้',pause:700,maxLen:120},
    {text:'ระบบจะเว้นจังหวะระหว่างประโยค และระหว่างรายการให้ชัดเจนขึ้น',pause:300,maxLen:190}
  ], 450));
  $('speechRate').addEventListener('input', ev => {
    speechRate = Number(ev.target.value);
    $('speechRateValue').textContent = `${speechRate.toFixed(2)}x`;
    neuralAudioCache.clear();
    
    saveSpeechPrefs();
  });
  $('speechVoice').addEventListener('change', () => {
    neuralAudioCache.clear();
    
    saveSpeechPrefs();
    stopSpeech('เลือกเสียงแล้ว • ระบบจะล็อกเสียงนี้ตลอดการอ่าน');
    refreshVoices();
  });
  $('backToQuizSelect').addEventListener('click', () => {
    stopSpeech('พร้อมอ่าน');
    setView('subject');
  });
  $('checkAnswerBtn').addEventListener('click', checkAnswer);
  $('nextQuestionBtn').addEventListener('click', nextQuestion);
  $('readQuestionAllBtn').addEventListener('click', () => {
    if (speechUiBusy) return;
    const q = quizQuestions[quizIndex];
    if (!q) return;
    speakQuizQuestion(q);
  });

  loadSpeechPrefs();
  refreshVoices();

  if ('speechSynthesis' in window) {
    speechSynthesis.addEventListener?.('voiceschanged', () => {});
  }

  window.addEventListener('beforeunload', () => stopSpeech(''));

  renderSubjects();
  renderSubjectLabels();
  renderSubjectPage();
  renderLessonSelect();
  renderLesson();
  renderQuizSets();
  renderResults();
  setView('home');

  
  
  
  /* QUIZWEB_GLOBAL_HOME_START */
  function goQuizWebHome() {
    try { stopSpeech('พร้อมอ่าน'); } catch (_) {}
    try { quizQuestions = []; } catch (_) {}
    try { quizIndex = 0; } catch (_) {}
    try { selectedIndex = null; } catch (_) {}
    try { answered = false; } catch (_) {}
    try { score = 0; } catch (_) {}
    try { mistakes = []; } catch (_) {}
    try { activeQuizName = ''; } catch (_) {}
    try { setView('home'); } catch (_) {}
    requestAnimationFrame(updateGlobalHomeButtons);
  }

  function makeGlobalHomeButton() {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ghost global-home-button';
    b.textContent = 'หน้าหลัก';
    b.setAttribute('aria-label', 'กลับหน้าหลัก');
    b.addEventListener('click', goQuizWebHome);
    return b;
  }

  function installGlobalHomeButtons() {
    const views = [...document.querySelectorAll('[id^="view-"]')];

    views.forEach(view => {
      // No Home button on the real Home page or while actively taking a quiz.
      if (view.id === 'view-home' || view.id === 'view-quiz') {
        view.querySelectorAll('.global-home-button').forEach(x => x.remove());
        view.querySelectorAll('.global-page-nav').forEach(x => x.remove());
        const oldHeading = view.querySelector('.section-heading');
        if (oldHeading) oldHeading.classList.remove('has-global-home');
        return;
      }

      // Subject page already has a button that goes directly home.
      const nativeHome = view.querySelector('.back-subjects');
      if (nativeHome) {
        nativeHome.textContent = 'หน้าหลัก';
        nativeHome.setAttribute('aria-label', 'กลับหน้าหลัก');

        view.querySelectorAll('.global-home-button').forEach(x => x.remove());
        view.querySelectorAll('.global-page-nav').forEach(x => x.remove());

        const heading = view.querySelector('.section-heading');
        if (heading) heading.classList.remove('has-global-home');
        return;
      }

      let button = view.querySelector('.global-home-button');

      if (!button) {
        button = makeGlobalHomeButton();

        const heading = view.querySelector('.section-heading');
        if (heading) {
          heading.classList.add('has-global-home');
          heading.appendChild(button);
        } else {
          let nav = view.querySelector(':scope > .global-page-nav');
          if (!nav) {
            nav = document.createElement('div');
            nav.className = 'global-page-nav';
            view.insertBefore(nav, view.firstChild);
          }
          nav.appendChild(button);
        }
      }
    });

    updateGlobalHomeButtons();
  }

  function updateGlobalHomeButtons() {
    const home = document.getElementById('view-home');
    const onHome = !!(home && home.classList.contains('active'));

    document.querySelectorAll('.global-home-button').forEach(b => {
      b.hidden = onHome;
    });

    document.querySelectorAll('.global-page-nav').forEach(nav => {
      nav.hidden = onHome;
    });
  }

  installGlobalHomeButtons();

  const globalHomeObserver = new MutationObserver(() => {
    installGlobalHomeButtons();
  });

  document.querySelectorAll('[id^="view-"]').forEach(view => {
    globalHomeObserver.observe(view, {
      attributes: true,
      attributeFilter: ['class'],
      childList: true,
      subtree: false
    });
  });
  /* QUIZWEB_GLOBAL_HOME_END */


  /* QUIZWEB_HOME_MINIMAL_START */
  function updateHomeEmptyState() {
    const grid = document.getElementById('subjectGrid');
    if (!grid) return;

    const realItems = [...grid.children].filter(el => !el.classList.contains('home-empty-state'));
    let empty = grid.querySelector('.home-empty-state');

    if (realItems.length === 0) {
      if (!empty) {
        empty = document.createElement('div');
        empty.className = 'home-empty-state';
        empty.textContent = 'ยังไม่มีวิชา';
        grid.appendChild(empty);
      }
    } else if (empty) {
      empty.remove();
    }
  }

  const homeGrid = document.getElementById('subjectGrid');
  if (homeGrid) {
    updateHomeEmptyState();
    const homeGridObserver = new MutationObserver(() => updateHomeEmptyState());
    homeGridObserver.observe(homeGrid, { childList: true });
  }
  /* QUIZWEB_HOME_MINIMAL_END */

})();

/* QUIZWEB_GAMELOCK_LAYOUT_BT_START */
(function () {
  function applyGameLockMode() {
    try {
      const params = new URLSearchParams(window.location.search || '');
      const byQuery = params.get('gamelock') === '1';
      const byWebView = !!(window.chrome && window.chrome.webview);

      if (byQuery || byWebView) {
        document.documentElement.classList.add('gamelock-mode');
      }
    } catch (_) {
      if (window.chrome && window.chrome.webview) {
        document.documentElement.classList.add('gamelock-mode');
      }
    }
  }

  applyGameLockMode();
  document.addEventListener('DOMContentLoaded', applyGameLockMode, { once: true });
  window.addEventListener('popstate', applyGameLockMode);
  window.addEventListener('hashchange', applyGameLockMode);
})();
 /* QUIZWEB_GAMELOCK_LAYOUT_BT_END */
