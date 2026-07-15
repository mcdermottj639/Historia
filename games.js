'use strict';
/* Historia — Games. First playable: ⚖️ Before or After (which event came
 * first?), driven entirely by data/events.js. The year gap between the two
 * events shrinks as your streak grows, so it ramps from gimme to brutal.
 * More games (Timeline Sort, Guess the Era, Who Am I?, the full Trivia Lab)
 * land in upcoming versions — tiles below show the roadmap honestly. */

(function () {
  const GAMES = [
    { k: 'ba', live: 1, emoji: '⚖️', name: 'Before or After', desc: 'Two events. Tap the one that happened first. Three lives — the gaps get cruel.' },
    { k: 'sort', live: 0, emoji: '⏳', name: 'Timeline Sort', desc: 'Put 5 shuffled events in chronological order. Coming next update.' },
    { k: 'era', live: 0, emoji: '🔮', name: 'Guess the Era', desc: 'Read the scene, name the century. Coming soon.' },
    { k: 'who', live: 0, emoji: '🎭', name: 'Who Am I?', desc: 'Progressive clues about a figure — buzz early for more points. Coming soon.' },
    { k: 'trivia', live: 0, emoji: '🧠', name: 'Trivia Lab', desc: 'The deep-cut hand-written question bank, daily challenge and all. Coming soon.' },
  ];

  function renderHub() {
    const host = $('#games-host');
    if (!host) return;
    const best = readJSON(K.BEST, {});
    host.innerHTML = `
      <div class="game-grid">
        ${GAMES.map((g) => `
          <button class="game-tile ${g.live ? '' : 'soon'}" data-game="${g.k}" ${g.live ? '' : 'disabled'}>
            <span class="g-emoji">${g.emoji}</span>
            <div class="g-name">${esc(g.name)}</div>
            <div class="g-desc">${esc(g.desc)}</div>
            ${g.live ? `<div class="g-best">${best[g.k] ? `Best: ${best[g.k]}` : 'New — set a best score'}</div>` : ''}
          </button>`).join('')}
      </div>`;
    $$('#games-host [data-game]').forEach((b) => (b.onclick = () => { if (b.dataset.game === 'ba') startBA(); }));
  }

  // --- ⚖️ Before or After ----------------------------------------------------
  let ba = null; // {score, streak, lives, pair, locked}

  // Difficulty ramp: required gap between the two years shrinks with streak.
  const gapFloor = (streak) => (streak < 3 ? 150 : streak < 6 ? 60 : streak < 10 ? 25 : 8);

  function pickPair() {
    const evs = window.H_EVENTS;
    const need = gapFloor(ba.streak);
    for (let tries = 0; tries < 60; tries++) {
      const a = evs[Math.floor(rrng() * evs.length)];
      const b = evs[Math.floor(rrng() * evs.length)];
      if (a === b) continue;
      const gap = Math.abs(a.y - b.y);
      if (gap >= Math.min(need, 8) && gap <= (ba.streak < 3 ? 4000 : 100000) && gap >= 3) {
        if (ba.pair && (ba.pair.some((e) => e.id === a.id || e.id === b.id))) continue; // don't repeat immediately
        return rrng() < .5 ? [a, b] : [b, a];
      }
    }
    // fallback: any distinct pair ≥3 years apart
    for (;;) {
      const a = evs[Math.floor(rrng() * evs.length)];
      const b = evs[Math.floor(rrng() * evs.length)];
      if (a !== b && Math.abs(a.y - b.y) >= 3) return [a, b];
    }
  }

  function startBA() {
    ba = { score: 0, streak: 0, lives: 3, pair: null, locked: false };
    nextRound();
  }

  function nextRound() {
    ba.pair = pickPair();
    ba.locked = false;
    paintBA();
  }

  function baCard(ev, i, reveal) {
    const era = window.H_ERA_OF_YEAR(ev.y);
    return `<button class="ba-card" data-pick="${i}" ${reveal ? 'disabled' : ''}>
      <span class="bc-era" style="background:${era.color}">${era.emoji} ${esc(era.label)}</span>
      <span class="bc-title">${esc(ev.title)}</span>
      <span class="bc-year">${reveal ? fmtYear(ev.y, ev.approx) : '?'}</span>
    </button>`;
  }

  function paintBA(revealData) {
    const host = $('#games-host');
    const [a, b] = ba.pair;
    host.innerHTML = `
      <div class="ba-top">
        <button class="btn small ghost" id="ba-exit">‹ Games</button>
        <span class="ba-score">⭐ ${ba.score}</span>
        <span class="ba-lives">${'❤️'.repeat(ba.lives)}${'🖤'.repeat(3 - ba.lives)}</span>
        <span class="ba-best">🔥 streak ${ba.streak} · best ${readJSON(K.BEST, {}).ba || 0}</span>
      </div>
      <p class="ba-prompt">Which happened <b>first</b>?</p>
      <div class="ba-cards">${baCard(a, 0, !!revealData)}${baCard(b, 1, !!revealData)}</div>
      ${revealData ? `
        <div class="ba-after">
          <div class="ba-verdict ${revealData.ok ? 'ok' : 'no'}">${revealData.ok ? `✅ Correct · +${revealData.pts}` : '❌ Not quite'}</div>
          <p class="ba-fact">${esc(revealData.first.title)} (${fmtYear(revealData.first.y, revealData.first.approx)}) — ${esc(revealData.first.blurb)}</p>
          <button class="btn primary" id="ba-next">${ba.lives > 0 ? 'Next →' : 'See results'}</button>
        </div>` : ''}`;
    $('#ba-exit').onclick = () => { endBA(true); };
    if (revealData) {
      // color the cards by outcome
      const cards = $$('#games-host .ba-card');
      const firstIdx = ba.pair[0].y <= ba.pair[1].y ? 0 : 1;
      cards[firstIdx].classList.add('reveal-right');
      if (!revealData.ok) cards[revealData.picked].classList.add('reveal-wrong');
      $('#ba-next').onclick = () => (ba.lives > 0 ? nextRound() : endBA());
    } else {
      $$('#games-host [data-pick]').forEach((c) => (c.onclick = () => pickBA(+c.dataset.pick)));
    }
  }

  function pickBA(i) {
    if (ba.locked) return;
    ba.locked = true;
    const [a, b] = ba.pair;
    const first = a.y <= b.y ? a : b;
    const ok = ba.pair[i] === first;
    let pts = 0;
    if (ok) {
      ba.streak++;
      pts = 10 + Math.min(ba.streak, 10) * 2;
      ba.score += pts;
    } else {
      ba.streak = 0;
      ba.lives--;
    }
    paintBA({ ok, pts, first, picked: i });
  }

  function endBA(quiet) {
    const best = readJSON(K.BEST, {});
    const isBest = ba.score > (best.ba || 0);
    if (isBest && ba.score > 0) { best.ba = ba.score; writeJSON(K.BEST, best); }
    if (ba.score > 0) addXP(Math.max(5, Math.round(ba.score / 4)), 'Before or After');
    if (quiet) { renderHub(); return; }
    const host = $('#games-host');
    host.innerHTML = `
      <div class="ba-over card">
        <div class="bo-big">${isBest ? '🏆' : ba.score >= 100 ? '🌟' : '⏳'}</div>
        <h3>${isBest ? 'New best score!' : 'Time’s up'}</h3>
        <p class="muted">⭐ ${ba.score} points${isBest ? '' : ` · best ${best.ba || 0}`}</p>
        <button class="btn primary" id="ba-again">Play again</button>
        <button class="btn ghost" id="ba-back">All games</button>
      </div>`;
    $('#ba-again').onclick = startBA;
    $('#ba-back').onclick = renderHub;
  }

  window.Games = { renderHub, startBA };
})();
