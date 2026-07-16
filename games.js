'use strict';
/* Historia — Games. The hub leads with the story-first games: 👑 Crossroads
 * (see crossroads.js + data/crossroads.js) and the once-a-day 🗓️ Daily
 * Reckoning, then the quick games — 🎭 Who Am I?, 🔮 What Happened Next?,
 * ⚖️ Before or After and ⏳ Timeline Sort — all driven by the bundled
 * event/figure datasets. Chronology games keep the era pill and year hidden
 * until the reveal (a face-up era would spoil the guess), but the face-down
 * cards DO show the blurb: you should be guessing from the story, not from
 * a bare title. */

(function () {
  const QUICK = [
    { k: 'who', live: 1, emoji: '🎭', name: 'Who Am I?', desc: 'A mystery figure, four suspects, clues that get more obvious — and cheaper. Buzz early.' },
    { k: 'next', live: 1, emoji: '🔮', name: 'What Happened Next?', desc: 'Read the moment, then pick what that part of the world did next. Two options already happened.' },
    { k: 'ba', live: 1, emoji: '⚖️', name: 'Before or After', desc: 'Two events. Tap the one that happened first. Three lives — the gaps get cruel.' },
    { k: 'sort', live: 1, emoji: '⏳', name: 'Timeline Sort', desc: 'Five shuffled events — tap them in chronological order. First slip each round is free.' },
    { k: 'trivia', live: 0, emoji: '🧠', name: 'Trivia Lab', desc: 'The deep-cut hand-written question bank, daily challenge and all. Coming soon.' },
  ];

  function renderHub() {
    const host = $('#games-host');
    if (!host) return;
    const best = readJSON(K.BEST, {});
    const daily = readJSON(K.DAILY, {});
    const dailyDone = daily.date === todayStr() && daily.done;
    const xr = readJSON(K.XROADS, {});
    host.innerHTML = `
      <button class="daily-card" id="daily-open">
        <span class="dc-emoji">🗓️</span>
        <span class="dc-body">
          <span class="dc-name">The Daily Reckoning</span>
          <span class="dc-desc">${dailyDone
            ? `Solved — ⭐ ${daily.score} today. A new mystery arrives at midnight.`
            : 'One mystery event. Four clues. Once a day — the same puzzle for every traveler.'}</span>
        </span>
        <span class="dc-state ${dailyDone ? 'done' : ''}">${dailyDone ? '✓' : 'Play'}</span>
      </button>

      <h3 class="games-head">👑 Crossroads — become the figure</h3>
      <p class="games-sub">Their life, your calls. Face the real decisions they faced — then see history’s path, and the road not taken.</p>
      <div class="story-grid">
        ${window.H_CROSSROADS.map((sc) => {
          const era = window.H_ERA_BY_KEY[sc.era];
          const d = xr[sc.id];
          return `<button class="story-card" data-xr="${sc.id}">
            <div class="story-cover" style="background:linear-gradient(135deg, ${era.color}55, ${era.color}22), linear-gradient(180deg, #241c14, #191410)">${sc.emoji}</div>
            <div class="story-body">
              <div class="story-kicker">${esc(sc.kicker)}</div>
              <div class="story-title">${esc(sc.title)}</div>
              <div class="story-meta"><span>⏱ ${sc.minutes} min</span><span>·</span><span>${sc.beats.length} decisions</span>
                ${d ? `<span class="story-done">✓ instinct ${d.best}/${sc.beats.length}</span>` : ''}</div>
            </div>
          </button>`;
        }).join('')}
      </div>

      <h3 class="games-head">⚡ Quick games</h3>
      <div class="game-grid">
        ${QUICK.map((g) => `
          <button class="game-tile ${g.live ? '' : 'soon'}" data-game="${g.k}" ${g.live ? '' : 'disabled'}>
            <span class="g-emoji">${g.emoji}</span>
            <div class="g-name">${esc(g.name)}</div>
            <div class="g-desc">${esc(g.desc)}</div>
            ${g.live ? `<div class="g-best">${best[g.k] ? `Best: ${best[g.k]}` : 'New — set a best score'}</div>` : ''}
          </button>`).join('')}
      </div>`;
    $('#daily-open').onclick = startDaily;
    $$('#games-host [data-xr]').forEach((b) => (b.onclick = () => window.Crossroads.open(b.dataset.xr)));
    $$('#games-host [data-game]').forEach((b) => (b.onclick = () => {
      if (b.dataset.game === 'ba') startBA();
      if (b.dataset.game === 'sort') startSort();
      if (b.dataset.game === 'who') startWho();
      if (b.dataset.game === 'next') startNext();
    }));
  }

  // shared header strip for in-game screens
  const topBar = (exitId, score, lives, right) => `
    <div class="ba-top">
      <button class="btn small ghost" id="${exitId}">‹ Games</button>
      <span class="ba-score">⭐ ${score}</span>
      ${lives != null ? `<span class="ba-lives">${'❤️'.repeat(lives)}${'🖤'.repeat(Math.max(0, 3 - lives))}</span>` : ''}
      <span class="ba-best">${right}</span>
    </div>`;

  const endScreen = (host, { big, title, sub, again, back }) => {
    host.innerHTML = `
      <div class="ba-over card">
        <div class="bo-big">${big}</div>
        <h3>${esc(title)}</h3>
        <p class="muted">${sub}</p>
        <button class="btn primary" id="gg-again">Play again</button>
        <button class="btn ghost" id="gg-back">All games</button>
      </div>`;
    $('#gg-again').onclick = again;
    $('#gg-back').onclick = back || renderHub;
  };

  const saveBest = (key, score) => {
    const best = readJSON(K.BEST, {});
    const isBest = score > (best[key] || 0);
    if (isBest && score > 0) { best[key] = score; writeJSON(K.BEST, best); }
    return isBest;
  };

  // --- 🗓️ The Daily Reckoning -------------------------------------------------
  // One seeded mystery event per calendar day (same for everyone). Clues reveal
  // one at a time; wrong guesses eliminate an option, cost points and unlock the
  // next clue free. State persists in K.DAILY so refreshing can't re-roll it.
  function dailyPuzzle() {
    const rng = seededRng(hashStr('reckon-' + todayStr()));
    const evs = window.H_EVENTS;
    const pool = shuffleWith(evs, rng);
    const mystery = pool[0];
    const mEra = window.H_ERA_OF_YEAR(mystery.y).k;
    // decoys: 2 sharing the era, 1 sharing the region, 2 from anywhere — so the
    // clue ladder eliminates some options but never all of them at once.
    const used = new Set([mystery.id]);
    const take = (pred, n) => pool.filter((e) => !used.has(e.id) && pred(e)).slice(0, n).map((e) => { used.add(e.id); return e; });
    const decoys = [
      ...take((e) => window.H_ERA_OF_YEAR(e.y).k === mEra, 2),
      ...take((e) => e.region === mystery.region, 1),
    ];
    decoys.push(...take(() => true, 5 - decoys.length));
    const options = shuffleWith([mystery, ...decoys], rng);
    const era = window.H_ERA_OF_YEAR(mystery.y);
    const anchor = mystery.y + Math.round((rng() - 0.5) * 36);
    const clues = [
      { ic: era.emoji, t: `It happened in the ${era.label} era (${fmtYear(era.from)} – ${fmtYear(era.to)}).` },
      { ic: '📍', t: `The place: ${REGIONS[mystery.region] || mystery.region}.` },
      { ic: '⏳', t: `The time: within 30 years of ${fmtYear(anchor)}.` },
      { ic: '📜', t: `The chronicle says: “${mystery.blurb}”` },
    ];
    return { mystery, options, clues };
  }

  const dailyState = () => {
    const s = readJSON(K.DAILY, {});
    return s.date === todayStr() ? s : { date: todayStr(), clues: 1, wrong: [], done: 0, score: 0 };
  };
  const dailyPot = (s) => Math.max(15, 100 - (s.clues - 1) * 10 - s.wrong.length * 20);

  function startDaily() {
    paintDaily(dailyPuzzle(), dailyState());
  }

  function paintDaily(pz, s) {
    const host = $('#games-host');
    const solved = !!s.done;
    host.innerHTML = `
      <div class="ba-top">
        <button class="btn small ghost" id="dr-exit">‹ Games</button>
        <span class="ba-score">${solved ? `⭐ ${s.score}` : `💰 pot ${dailyPot(s)}`}</span>
        <span class="ba-best">🗓️ ${todayStr()} · same puzzle for everyone</span>
      </div>
      <p class="ba-prompt">${solved ? 'Today’s mystery, solved. Come back at midnight.' : 'Name today’s mystery event. Guess early for more Wisdom — wrong guesses cost <b>20</b>, extra clues cost <b>10</b>.'}</p>
      <div class="clue-list">
        ${pz.clues.slice(0, solved ? 4 : s.clues).map((c) => `<div class="clue"><span class="clue-ic">${c.ic}</span><span>${esc(c.t)}</span></div>`).join('')}
      </div>
      ${!solved && s.clues < pz.clues.length ? `<button class="btn small" id="dr-clue">🔍 Reveal the next clue (−10)</button>` : ''}
      <div class="ts-list dr-opts">
        ${pz.options.map((o) => {
          const out = s.wrong.includes(o.id);
          const isIt = solved && o.id === pz.mystery.id;
          return `<button class="ts-card ${out ? 'dr-out' : ''} ${isIt ? 'placed' : ''}" data-dr="${o.id}" ${out || solved ? 'disabled' : ''}>
            <span class="ts-body"><span class="ts-title">${esc(o.title)}</span>${isIt ? `<span class="ts-blurb">${esc(o.blurb)}</span>` : ''}</span>
            ${isIt ? `<span class="ts-year">${fmtYear(o.y, o.approx)}</span>` : ''}
          </button>`;
        }).join('')}
      </div>
      ${solved ? `<div class="ba-after"><div class="ba-verdict ok">✅ Reckoned — ⭐ ${s.score} · ✨ +${Math.round(s.score / 2)} Wisdom paid</div></div>` : ''}`;
    $('#dr-exit').onclick = renderHub;
    const clueBtn = $('#dr-clue');
    if (clueBtn) clueBtn.onclick = () => { s.clues++; writeJSON(K.DAILY, s); paintDaily(pz, s); };
    if (!solved) $$('#games-host [data-dr]').forEach((b) => (b.onclick = () => {
      if (b.dataset.dr === pz.mystery.id) {
        s.done = 1; s.score = dailyPot(s);
        writeJSON(K.DAILY, s);
        addXP(Math.round(s.score / 2), 'Daily Reckoning');
        paintDaily(pz, s);
      } else {
        s.wrong.push(b.dataset.dr);
        if (s.clues < pz.clues.length) s.clues++; // wrong guess unlocks the next clue free
        writeJSON(K.DAILY, s);
        paintDaily(pz, s);
        toast('❌ Not that one — next clue is on the house');
      }
    }));
  }

  // --- 🎭 Who Am I? -------------------------------------------------------------
  // Progressive clues about a figure (name-redacted), four suspects. Guessing
  // on an early clue pays more; wrong guesses cost a life AND shrink the pot.
  let wa = null; // {score, lives, round, fig, opts, clue, wrongHere, solved}
  const WHO_PTS = [80, 60, 40, 25];

  function redactName(text, name) {
    let out = text;
    name.split(/\s+/).filter((w) => w.replace(/[^A-Za-zÀ-ž]/g, '').length > 3).forEach((w) => {
      const safe = w.replace(/[^A-Za-zÀ-ž]/g, '');
      out = out.replace(new RegExp(safe, 'gi'), '⸺');
    });
    return out;
  }

  function whoClues(f) {
    return [
      `Lived ${fmtYear(f.born)} – ${f.died == null ? 'present' : fmtYear(f.died)} · ${REGIONS[f.region] || f.region}`,
      redactName(f.facts[0], f.name),
      redactName(f.facts[1], f.name),
      `They’re remembered as: “${redactName(f.tag, f.name)}”`,
    ];
  }

  function pickWhoRound() {
    const figs = window.H_FIGURES;
    const f = figs[Math.floor(rrng() * figs.length)];
    const sameEra = shuffleWith(figs.filter((x) => x.id !== f.id && x.era === f.era), rrng);
    const others = shuffleWith(figs.filter((x) => x.id !== f.id && x.era !== f.era), rrng);
    const decoys = [...sameEra, ...others].slice(0, 3);
    wa.fig = f;
    wa.opts = shuffleWith([f, ...decoys], rrng);
    wa.clue = 1;
    wa.wrongHere = 0;
    wa.solved = false;
  }

  function startWho() {
    wa = { score: 0, lives: 3, round: 1 };
    pickWhoRound();
    paintWho();
  }

  function paintWho() {
    const host = $('#games-host');
    const f = wa.fig;
    const clues = whoClues(f);
    const pot = Math.max(10, WHO_PTS[wa.clue - 1] - wa.wrongHere * 15);
    host.innerHTML = `
      ${topBar('wa-exit', wa.score, wa.lives, `Round ${wa.round} · best ${readJSON(K.BEST, {}).who || 0}`)}
      <p class="ba-prompt">${wa.solved ? 'Identified.' : `Who am I? Guess now for <b>+${pot}</b>, or take another clue for less.`}</p>
      <div class="clue-list">
        ${clues.slice(0, wa.solved ? clues.length : wa.clue).map((c) => `<div class="clue"><span class="clue-ic">🕵️</span><span>${esc(c)}</span></div>`).join('')}
      </div>
      ${!wa.solved && wa.clue < clues.length ? `<button class="btn small" id="wa-clue">🔍 Next clue (smaller pot)</button>` : ''}
      <div class="ts-list dr-opts">
        ${wa.opts.map((o) => {
          const isIt = wa.solved && o.id === f.id;
          const out = o.gone;
          return `<button class="ts-card ${out ? 'dr-out' : ''} ${isIt ? 'placed' : ''}" data-wa="${o.id}" ${out || wa.solved ? 'disabled' : ''}>
            <span class="ts-body"><span class="ts-title">${esc(o.name)}</span></span>
          </button>`;
        }).join('')}
      </div>
      ${wa.solved ? `
        <div class="ba-after">
          <div class="wa-reveal">
            <div class="fig-face" data-face style="background-color:${window.H_ERA_BY_KEY[f.era].color}">${esc(f.name[0])}</div>
            <div class="wa-rv-body"><b>${esc(f.name)}</b><span>${esc(f.tag)}</span></div>
          </div>
          <div class="ba-verdict ${wa.gotIt ? 'ok' : 'no'}">${wa.gotIt ? `✅ +${wa.paid}` : '💔 They slipped away'}</div>
          <button class="btn primary" id="wa-next">${wa.lives > 0 ? 'Next figure →' : 'See results'}</button>
          <button class="btn small ghost" id="wa-bio">Their story</button>
        </div>` : ''}`;
    $('#wa-exit').onclick = () => endWho(true);
    const clueBtn = $('#wa-clue');
    if (clueBtn) clueBtn.onclick = () => { wa.clue++; paintWho(); };
    if (!wa.solved) $$('#games-host [data-wa]').forEach((b) => (b.onclick = () => {
      const o = wa.opts.find((x) => x.id === b.dataset.wa);
      if (o.id === f.id) {
        wa.paid = Math.max(10, WHO_PTS[wa.clue - 1] - wa.wrongHere * 15);
        wa.score += wa.paid;
        wa.gotIt = true; wa.solved = true;
        paintWho();
      } else {
        o.gone = true; wa.wrongHere++; wa.lives--;
        if (wa.lives <= 0) { wa.gotIt = false; wa.solved = true; }
        paintWho();
      }
    }));
    if (wa.solved) {
      fetchPortrait(f).then((url) => { const face = $('#games-host [data-face]'); if (url && face) { face.textContent = ''; face.style.backgroundImage = `url("${url}")`; } });
      $('#wa-next').onclick = () => {
        wa.opts.forEach((o) => delete o.gone);
        if (wa.lives > 0) { wa.round++; pickWhoRound(); paintWho(); } else endWho();
      };
      $('#wa-bio').onclick = () => openFigureSheet(f);
    }
  }

  function endWho(quiet) {
    wa.opts && wa.opts.forEach((o) => delete o.gone);
    const isBest = saveBest('who', wa.score);
    if (wa.score > 0) addXP(Math.max(5, Math.round(wa.score / 4)), 'Who Am I?');
    if (quiet) { renderHub(); return; }
    endScreen($('#games-host'), {
      big: isBest ? '🏆' : wa.score >= 200 ? '🌟' : '🎭',
      title: isBest ? 'New best score!' : 'The gallery closes',
      sub: `⭐ ${wa.score} points · ${wa.round} figure${wa.round > 1 ? 's' : ''}${isBest ? '' : ` · best ${readJSON(K.BEST, {}).who || 0}`}`,
      again: startWho,
    });
  }

  // --- 🔮 What Happened Next? ------------------------------------------------------
  // An anchor moment (fully face-up, blurb and all), three candidate follow-ups
  // from the same region — one really came next; the other two had already
  // happened. Reading the stories IS the strategy.
  let wn = null; // {score, streak, lives, q, locked}

  function pickNextQ() {
    const evs = window.H_EVENTS;
    for (let t = 0; t < 120; t++) {
      const loose = t > 80; // relax the tight-gap rule if we're struggling
      const a = evs[Math.floor(rrng() * evs.length)];
      const later = evs.filter((e) => e.region === a.region && e.y > a.y).sort((x, y) => x.y - y.y);
      if (!later.length) continue;
      const real = later[0];
      if (!loose && real.y - a.y > 300) continue;
      const before = evs.filter((e) => e.region === a.region && e.y < a.y).sort((x, y) => y.y - x.y);
      if (before.length < 2) continue;
      if (wn.q && wn.q.anchor.id === a.id) continue;
      const decoys = shuffleWith(before.slice(0, 8), rrng).slice(0, 2);
      return { anchor: a, real, options: shuffleWith([real, ...decoys], rrng) };
    }
    // practically unreachable with 500+ events, but never return null
    const sorted = [...evs].sort((x, y) => x.y - y.y);
    return { anchor: sorted[1], real: sorted[2], options: shuffleWith([sorted[2], sorted[0], sorted[3]], rrng) };
  }

  function startNext() {
    wn = { score: 0, streak: 0, lives: 3, q: null, locked: false };
    wn.q = pickNextQ();
    paintNext();
  }

  function paintNext(reveal) {
    const host = $('#games-host');
    const { anchor, real, options } = wn.q;
    const era = window.H_ERA_OF_YEAR(anchor.y);
    host.innerHTML = `
      ${topBar('wn-exit', wn.score, wn.lives, `🔥 streak ${wn.streak} · best ${readJSON(K.BEST, {}).next || 0}`)}
      <div class="wn-anchor">
        <span class="bc-era" style="background:${era.color}">${era.emoji} ${esc(era.label)}</span>
        <span class="wn-year">${fmtYear(anchor.y, anchor.approx)} · ${esc(REGIONS[anchor.region] || anchor.region)}</span>
        <span class="wn-title">${esc(anchor.title)}</span>
        <span class="wn-blurb">${esc(anchor.blurb)}</span>
      </div>
      <p class="ba-prompt">What happened <b>next</b> in ${esc(REGIONS[anchor.region] || anchor.region)}? <span class="muted">(the other two had already happened)</span></p>
      <div class="ts-list dr-opts">
        ${options.map((o) => {
          const right = reveal && o.id === real.id;
          const wrongPick = reveal && !reveal.ok && o.id === reveal.picked;
          return `<button class="ts-card ${right ? 'placed' : ''} ${wrongPick ? 'reveal-wrong' : ''}" data-wn="${o.id}" ${reveal ? 'disabled' : ''}>
            <span class="ts-body"><span class="ts-title">${esc(o.title)}</span>${reveal ? `<span class="ts-blurb">${esc(o.blurb)}</span>` : ''}</span>
            <span class="ts-year">${reveal ? fmtYear(o.y, o.approx) + (o.id === real.id ? '' : ' ⏮') : ''}</span>
          </button>`;
        }).join('')}
      </div>
      ${reveal ? `
        <div class="ba-after">
          <div class="ba-verdict ${reveal.ok ? 'ok' : 'no'}">${reveal.ok ? `✅ Correct · +${reveal.pts}` : '❌ Not quite — ⏮ marks what had already happened'}</div>
          <button class="btn primary" id="wn-next">${wn.lives > 0 ? 'Next moment →' : 'See results'}</button>
        </div>` : ''}`;
    $('#wn-exit').onclick = () => endNext(true);
    if (reveal) {
      $('#wn-next').onclick = () => { if (wn.lives > 0) { wn.q = pickNextQ(); wn.locked = false; paintNext(); } else endNext(); };
    } else {
      $$('#games-host [data-wn]').forEach((b) => (b.onclick = () => {
        if (wn.locked) return;
        wn.locked = true;
        const ok = b.dataset.wn === real.id;
        let pts = 0;
        if (ok) { wn.streak++; pts = 12 + Math.min(wn.streak, 10) * 3; wn.score += pts; }
        else { wn.streak = 0; wn.lives--; }
        paintNext({ ok, pts, picked: b.dataset.wn });
      }));
    }
  }

  function endNext(quiet) {
    const isBest = saveBest('next', wn.score);
    if (wn.score > 0) addXP(Math.max(5, Math.round(wn.score / 4)), 'What Happened Next?');
    if (quiet) { renderHub(); return; }
    endScreen($('#games-host'), {
      big: isBest ? '🏆' : wn.score >= 150 ? '🌟' : '🔮',
      title: isBest ? 'New best score!' : 'The thread runs out',
      sub: `⭐ ${wn.score} points${isBest ? '' : ` · best ${readJSON(K.BEST, {}).next || 0}`}`,
      again: startNext,
    });
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
      <span class="bc-blurb">${esc(ev.blurb)}</span>
      <span class="bc-year">${reveal ? fmtYear(ev.y, ev.approx) : '?'}</span>
    </button>`;
  }

  function paintBA(revealData) {
    const host = $('#games-host');
    const [a, b] = ba.pair;
    host.innerHTML = `
      ${topBar('ba-exit', ba.score, ba.lives, `🔥 streak ${ba.streak} · best ${readJSON(K.BEST, {}).ba || 0}`)}
      <p class="ba-prompt">Which happened <b>first</b>?</p>
      <div class="ba-cards">${baCard(a, 0, !!revealData)}${baCard(b, 1, !!revealData)}</div>
      ${revealData ? `
        <div class="ba-after">
          <div class="ba-verdict ${revealData.ok ? 'ok' : 'no'}">${revealData.ok ? `✅ Correct · +${revealData.pts}` : '❌ Not quite'}</div>
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
    const isBest = saveBest('ba', ba.score);
    if (ba.score > 0) addXP(Math.max(5, Math.round(ba.score / 4)), 'Before or After');
    if (quiet) { renderHub(); return; }
    endScreen($('#games-host'), {
      big: isBest ? '🏆' : ba.score >= 100 ? '🌟' : '⏳',
      title: isBest ? 'New best score!' : 'Time’s up',
      sub: `⭐ ${ba.score} points${isBest ? '' : ` · best ${readJSON(K.BEST, {}).ba || 0}`}`,
      again: startBA,
    });
  }

  // --- ⏳ Timeline Sort --------------------------------------------------------
  // Five shuffled events; tap them earliest-first. Each round's minimum year
  // gap shrinks. The first slip of a round is a free warning (it still voids
  // the perfect bonus); later slips cost a life.
  let ts = null; // {round, score, lives, set, nextIdx, mistakes, grace}
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
    ts = { round: 1, score: 0, lives: 3, set: null, nextIdx: 0, mistakes: 0, grace: 1 };
    nextSortRound();
  }
  function nextSortRound() {
    const gap = ROUND_GAP[Math.min(ts.round - 1, ROUND_GAP.length - 1)];
    ts.set = pickSortSet(gap);
    ts.order = [...ts.set].sort((a, b) => a.y - b.y).map((e) => e.id); // correct id sequence
    ts.placed = {}; // id -> position (1-based)
    ts.nextIdx = 0;
    ts.mistakes = 0;
    ts.grace = 1; // one free slip per round
    paintSort();
  }

  function paintSort(banner) {
    const host = $('#games-host');
    const roundDone = ts.nextIdx >= ts.order.length;
    host.innerHTML = `
      ${topBar('ts-exit', ts.score, ts.lives, `Round ${ts.round} · best ${readJSON(K.BEST, {}).sort || 0}`)}
      <p class="ba-prompt">Tap the events in order — <b>earliest first</b>. First slip of the round is free.</p>
      <div class="ts-list">
        ${ts.set.map((ev) => {
          const era = window.H_ERA_OF_YEAR(ev.y);
          const pos = ts.placed[ev.id];
          return `<button class="ts-card ${pos ? 'placed' : ''}" data-ts="${ev.id}" ${pos || roundDone ? 'disabled' : ''}>
            <span class="ts-slot">${pos ? pos : '·'}</span>
            <span class="ts-body">
              ${pos || roundDone ? `<span class="bc-era" style="background:${era.color}">${era.emoji} ${esc(era.label)}</span>` : ''}
              <span class="ts-title">${esc(ev.title)}</span>
              <span class="ts-blurb">${esc(ev.blurb)}</span>
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
      if (btn) { btn.classList.add('reveal-wrong'); setTimeout(() => btn.classList.remove('reveal-wrong'), 450); }
      if (ts.grace > 0) {
        ts.grace--;
        paintSort({ cls: 'no', msg: '⚠️ Not that one — first slip is free (no perfect bonus)' });
        return;
      }
      ts.lives--;
      if (ts.lives <= 0) {
        // reveal the rest and offer results
        ts.set.forEach((e) => { if (!ts.placed[e.id]) ts.placed[e.id] = 0; });
        ts.nextIdx = ts.order.length;
        paintSort({ cls: 'no', msg: '💔 Out of lives — years revealed' });
      } else {
        paintSort({ cls: 'no', msg: '❌ Not that one — earlier events remain' });
      }
    }
  }

  function endSort(quiet) {
    const isBest = saveBest('sort', ts.score);
    if (ts.score > 0) addXP(Math.max(5, Math.round(ts.score / 5)), 'Timeline Sort');
    if (quiet) { renderHub(); return; }
    endScreen($('#games-host'), {
      big: isBest ? '🏆' : ts.score >= 300 ? '🌟' : '⏳',
      title: isBest ? 'New best score!' : 'The sands ran out',
      sub: `⭐ ${ts.score} points · reached round ${ts.round}${isBest ? '' : ` · best ${readJSON(K.BEST, {}).sort || 0}`}`,
      again: startSort,
    });
  }

  window.Games = { renderHub, startBA, startSort, startDaily, startWho, startNext };
})();
