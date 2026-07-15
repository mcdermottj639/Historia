'use strict';
/* Historia — Games. First playable: ⚖️ Before or After (which event came
 * first?), driven entirely by data/events.js. The year gap between the two
 * events shrinks as your streak grows, so it ramps from gimme to brutal.
 * More games (Timeline Sort, Guess the Era, Who Am I?, the full Trivia Lab)
 * land in upcoming versions — tiles below show the roadmap honestly. */

(function () {
  const GAMES = [
    { k: 'ba', live: 1, emoji: '⚖️', name: 'Before or After', desc: 'Two events. Tap the one that happened first. Three lives — the gaps get cruel.' },
    { k: 'sort', live: 1, emoji: '⏳', name: 'Timeline Sort', desc: 'Five shuffled events — tap them in chronological order, earliest first. Rounds get tighter.' },
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
    $$('#games-host [data-game]').forEach((b) => (b.onclick = () => {
      if (b.dataset.game === 'ba') startBA();
      if (b.dataset.game === 'sort') startSort();
    }));
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
      ${reveal ? `<span class="bc-era" style="background:${era.color}">${era.emoji} ${esc(era.label)}</span>` : ''}
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

  // --- ⏳ Timeline Sort --------------------------------------------------------
  // Five shuffled events; tap them earliest-first. Each round's minimum year
  // gap shrinks, so round 1 is a warm-up and round 5+ is for Keepers of Ages.
  let ts = null; // {round, score, lives, set, nextIdx, mistakes}
  const ROUND_GAP = [150, 80, 40, 15, 6]; // min pairwise years, by round

  function pickSortSet(minGap) {
    const evs = window.H_EVENTS;
    for (let tries = 0; tries < 200; tries++) {
      const set = shuffleWith(evs, rrng).slice(0, 5);
      const ys = set.map((e) => e.y).sort((a, b) => a - b);
      let ok = true;
      for (let i = 1; i < ys.length; i++) if (ys[i] - ys[i - 1] < minGap) { ok = false; break; }
      if (ok) return set;
    }
    // fallback: force distinct-enough years by spacing picks across the sorted bank
    const sorted = [...evs].sort((a, b) => a.y - b.y);
    const step = Math.floor(sorted.length / 5);
    return [0, 1, 2, 3, 4].map((i) => sorted[i * step + Math.floor(rrng() * step)]);
  }

  function startSort() {
    ts = { round: 1, score: 0, lives: 3, set: null, nextIdx: 0, mistakes: 0 };
    nextSortRound();
  }
  function nextSortRound() {
    const gap = ROUND_GAP[Math.min(ts.round - 1, ROUND_GAP.length - 1)];
    ts.set = pickSortSet(gap);
    ts.order = [...ts.set].sort((a, b) => a.y - b.y).map((e) => e.id); // correct id sequence
    ts.placed = {}; // id -> position (1-based)
    ts.nextIdx = 0;
    ts.mistakes = 0;
    paintSort();
  }

  function paintSort(banner) {
    const host = $('#games-host');
    const roundDone = ts.nextIdx >= ts.order.length;
    host.innerHTML = `
      <div class="ba-top">
        <button class="btn small ghost" id="ts-exit">‹ Games</button>
        <span class="ba-score">⭐ ${ts.score}</span>
        <span class="ba-lives">${'❤️'.repeat(ts.lives)}${'🖤'.repeat(Math.max(0, 3 - ts.lives))}</span>
        <span class="ba-best">Round ${ts.round} · best ${readJSON(K.BEST, {}).sort || 0}</span>
      </div>
      <p class="ba-prompt">Tap the events in order — <b>earliest first</b>.</p>
      <div class="ts-list">
        ${ts.set.map((ev) => {
          const era = window.H_ERA_OF_YEAR(ev.y);
          const pos = ts.placed[ev.id];
          return `<button class="ts-card ${pos ? 'placed' : ''}" data-ts="${ev.id}" ${pos || roundDone ? 'disabled' : ''}>
            <span class="ts-slot">${pos ? pos : '·'}</span>
            <span class="ts-body">
              ${pos || roundDone ? `<span class="bc-era" style="background:${era.color}">${era.emoji} ${esc(era.label)}</span>` : ''}
              <span class="ts-title">${esc(ev.title)}</span>
            </span>
            <span class="ts-year">${pos || roundDone ? fmtYear(ev.y, ev.approx) : ''}</span>
          </button>`;
        }).join('')}
      </div>
      ${banner ? `<div class="ba-after">
          <div class="ba-verdict ${banner.cls}">${banner.msg}</div>
          ${roundDone ? `<button class="btn primary" id="ts-next">${ts.lives > 0 ? 'Next round →' : 'See results'}</button>` : ''}
        </div>` : ''}`;
    $('#ts-exit').onclick = () => endSort(true);
    $$('#games-host [data-ts]').forEach((b) => (b.onclick = () => pickSort(b.dataset.ts, b)));
    if (roundDone && $('#ts-next')) $('#ts-next').onclick = () => (ts.lives > 0 ? (ts.round++, nextSortRound()) : endSort());
  }

  function pickSort(id, btn) {
    if (!ts || ts.nextIdx >= ts.order.length) return;
    if (id === ts.order[ts.nextIdx]) {
      ts.nextIdx++;
      ts.placed[id] = ts.nextIdx;
      ts.score += 20;
      if (ts.nextIdx >= ts.order.length) {
        const perfect = ts.mistakes === 0;
        if (perfect) ts.score += 50;
        paintSort({ cls: 'ok', msg: perfect ? '🏆 Perfect round · +50 bonus' : '✅ Round clear' });
      } else paintSort();
    } else {
      ts.mistakes++;
      ts.lives--;
      if (btn) { btn.classList.add('reveal-wrong'); setTimeout(() => btn.classList.remove('reveal-wrong'), 450); }
      if (ts.lives <= 0) {
        // reveal the rest and offer results
        ts.set.forEach((e) => { if (!ts.placed[e.id]) ts.placed[e.id] = 0; });
        ts.nextIdx = ts.order.length;
        paintSort({ cls: 'no', msg: '💔 Out of lives — years revealed' });
      } else {
        const fb = $('#games-host .ba-after');
        if (!fb) paintSort({ cls: 'no', msg: '❌ Not that one — earlier events remain' });
      }
    }
  }

  function endSort(quiet) {
    const best = readJSON(K.BEST, {});
    const isBest = ts.score > (best.sort || 0);
    if (isBest && ts.score > 0) { best.sort = ts.score; writeJSON(K.BEST, best); }
    if (ts.score > 0) addXP(Math.max(5, Math.round(ts.score / 5)), 'Timeline Sort');
    if (quiet) { renderHub(); return; }
    const host = $('#games-host');
    host.innerHTML = `
      <div class="ba-over card">
        <div class="bo-big">${isBest ? '🏆' : ts.score >= 300 ? '🌟' : '⏳'}</div>
        <h3>${isBest ? 'New best score!' : 'The sands ran out'}</h3>
        <p class="muted">⭐ ${ts.score} points · reached round ${ts.round}${isBest ? '' : ` · best ${best.sort || 0}`}</p>
        <button class="btn primary" id="ts-again">Play again</button>
        <button class="btn ghost" id="ts-back">All games</button>
      </div>`;
    $('#ts-again').onclick = startSort;
    $('#ts-back').onclick = renderHub;
  }

  window.Games = { renderHub, startBA, startSort };
})();
