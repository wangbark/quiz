/* QuizWeb Games: static public configuration only. Never call a localhost admin API from clients. */
(() => {
  'use strict';
  const grid = document.getElementById('gameGrid');
  const empty = document.getElementById('emptyGames');
  const badge = document.querySelector('.count-badge');
  const known = new Map([
    ['typing-th', 'thai-typing'],
    ['typing-en', 'english-typing'],
    ['letter-tetris-en', 'english-letter-tetris'],
    ['typing-rhythm-en', 'english-rhythm-typing'],
    ['word-survivor', 'word-survivor']
  ]);
  if (!grid) return;
  fetch('./games.config.json', { cache: 'no-store' })
    .then(r => { if (!r.ok) throw new Error('config unavailable'); return r.json(); })
    .then(config => {
      if (!config || !Array.isArray(config.items)) return;
      const items = new Map(config.items.filter(item => item && known.get(item.id) === item.slug).map(item => [item.id, item]));
      const cards = [...grid.querySelectorAll('[data-game-id]')];
      cards.forEach(card => {
        const item = items.get(card.dataset.gameId);
        if (!item) return;
        card.hidden = item.enabled === false;
        card.dataset.order = Number.isFinite(Number(item.order)) ? String(Number(item.order)) : card.dataset.order;
        if (typeof item.title === 'string' && item.title.trim()) card.querySelector('.game-title').textContent = item.title.trim().slice(0, 80);
        const description = card.querySelector('.game-description');
        if (description && typeof item.description === 'string' && item.description.trim()) description.textContent = item.description.trim().slice(0, 220);
      });
      cards.sort((a, b) => Number(a.dataset.order) - Number(b.dataset.order)).forEach(card => grid.appendChild(card));
      const visible = cards.filter(card => !card.hidden).length;
      if (badge) badge.textContent = `${visible} เกม`;
      if (empty) empty.hidden = visible !== 0;
    })
    .catch(() => { /* Embedded cards are the offline fallback. */ });
})();
