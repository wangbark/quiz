/* QuizWeb Reward Client v1. Result capture only; NO GameLock unlocking. */
(function (root) {
  'use strict';
  const endpoint = '/api/reward/v1/results';
  const allowed = new Set(['vocab', 'diary', 'games']);
  function newAttemptId() {
    if (root.crypto && typeof root.crypto.randomUUID === 'function') {
      return root.crypto.randomUUID();
    }
    // crypto.getRandomValues is also available on most plain-HTTP LAN origins.
    if (!root.crypto || typeof root.crypto.getRandomValues !== 'function') {
      throw new Error('A browser with cryptographic random values is required');
    }
    const b = new Uint8Array(16);
    root.crypto.getRandomValues(b);
    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;
    const h = Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
    return [h.slice(0, 8), h.slice(8, 12), h.slice(12, 16), h.slice(16, 20), h.slice(20)].join('-');
  }
  async function submitResult(input) {
    if (!input || !allowed.has(input.module)) {
      throw new TypeError('Invalid reward module');
    }
    const payload = {
      schemaVersion: 1,
      module: input.module,
      activityId: input.activityId,
      attemptId: input.attemptId,
      score: input.score,
      maxScore: input.maxScore,
      completed: input.completed === true
    };
    if (input.clientSessionId) payload.clientSessionId = input.clientSessionId;
    if (Number.isInteger(input.durationMs)) payload.durationMs = input.durationMs;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      cache: 'no-store',
      body: JSON.stringify(payload)
    });
    let data;
    try { data = await response.json(); }
    catch (_) { throw new Error('Reward server returned an invalid response'); }
    if (!response.ok || !data || data.ok !== true) {
      throw new Error(data && data.error ? data.error : 'Could not save reward result');
    }
    return data; // Always unverified and grantedMinutes=0 in v1.
  }
  root.QuizWebReward = Object.freeze({
    version: 'v1',
    enabled: true,
    grantEnabled: false,
    newAttemptId,
    submitResult
  });
})(window);
