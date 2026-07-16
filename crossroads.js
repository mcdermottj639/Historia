'use strict';
/* Historia — 👑 Crossroads. The flagship game: become the figure, face their
 * real decisions, then see history's path vs the road not taken. Reuses the
 * Story Mode player grammar (full-screen overlay, progress bars) and pays
 * Wisdom by "Historian's Instinct" — how many of the figure's real choices
 * you matched. Matching isn't always the smart play (see Fort Washington);
 * the reveal text is honest about that. Data: data/crossroads.js. */

(function () {
  let cx = null; // {sc, i (-1 = intro), phase:'scene'|'reveal'|'end', matched, pickedReal, orders:{i:[idx,..]}, awarded}

  const doneMap = () => readJSON(K.XROADS, {});

  function open(id) {
    const sc = window.H_XR_BY_ID[id];
    if (!sc) return;
    cx = { sc, i: -1, phase: 'scene', matched: 0, pickedReal: false, orders: {}, awarded: false };
    paint();
  }

  function close() {
    $$('.story-player.xr').forEach((n) => n.remove());
    document.body.style.overflow = '';
    cx = null;
    if (window.Games) window.Games.renderHub();
    if (typeof renderHome === 'function') renderHome();
  }

  function choiceOrder(i) {
    // shuffle once per beat entry so the real choice isn't always first
    if (!cx.orders[i]) cx.orders[i] = shuffleWith(cx.sc.beats[i].choices.map((_, n) => n), rrng);
    return cx.orders[i];
  }

  function paint() {
    $$('.story-player.xr').forEach((n) => n.remove());
    if (!cx) return;
    document.body.style.overflow = 'hidden';
    const { sc } = cx;
    const era = window.H_ERA_BY_KEY[sc.era];
    const total = sc.beats.length + 1; // intro + beats
    const seg = cx.phase === 'end' ? total : cx.i + 1;
    const bars = Array.from({ length: total }, (_, n) =>
      `<i class="${n < seg ? 'done' : n === seg ? 'now' : ''}"><b></b></i>`).join('');

    let inner = '';
    if (cx.i === -1) {
      inner = `
        <div class="story-slide intro">
          <div class="sl-emoji">${sc.emoji}</div>
          <div class="sl-kicker">${esc(sc.kicker)}</div>
          <h2 class="sl-title">${esc(sc.title)}</h2>
          <p class="sl-body">${esc(sc.intro)}</p>
          <button class="btn primary xr-begin">Step into their shoes →</button>
        </div>`;
    } else if (cx.phase === 'end') {
      const n = sc.beats.length;
      const first = !doneMap()[sc.id];
      const xp = first ? 45 + cx.matched * 10 : 8 + cx.matched * 2;
      const line = cx.matched === n ? 'You walked their exact path.'
        : cx.matched >= n - 1 ? 'Nearly their shadow.'
        : cx.matched >= Math.ceil(n / 2) ? 'You share their instincts — mostly.'
        : 'You would have written a very different history.';
      inner = `
        <div class="story-quiz story-end">
          <div class="se-big">${cx.matched === n ? '🏛️' : cx.matched >= Math.ceil(n / 2) ? '🌟' : '🔀'}</div>
          <h3>Historian’s Instinct: ${cx.matched}/${n}</h3>
          <p>${esc(line)}</p>
          <p class="xr-fate">${esc(sc.fate)}</p>
          <span class="se-xp">✨ +${xp} Wisdom</span><br/>
          <button class="btn primary" data-done="close">Back to games</button>
          <button class="btn ghost" data-done="replay">Live it again</button>
        </div>`;
      const map = doneMap();
      if (!map[sc.id] || cx.matched > map[sc.id].best) map[sc.id] = { done: 1, best: cx.matched };
      writeJSON(K.XROADS, map);
      if (!cx.awarded) { cx.awarded = true; addXP(xp, 'Crossroads'); }
    } else {
      const b = sc.beats[cx.i];
      if (cx.phase === 'scene') {
        inner = `
          <div class="story-slide xr-scroll">
            <div class="sl-kicker">${esc(b.k)}</div>
            <h2 class="sl-title">${esc(b.t)}</h2>
            <p class="sl-body">${esc(b.scene)}</p>
            <div class="xr-choices">
              <div class="xr-ask">What do you do?</div>
              ${choiceOrder(cx.i).map((ci) => `<button class="sq-opt" data-choice="${ci}">${esc(b.choices[ci].t)}</button>`).join('')}
            </div>
          </div>`;
      } else {
        const real = b.choices.find((c) => c.real);
        inner = `
          <div class="story-slide xr-scroll">
            <div class="sl-kicker">${esc(b.k)}</div>
            <div class="xr-verdict ${cx.pickedReal ? 'match' : 'diverge'}">${cx.pickedReal ? '🏛️ You matched history' : '🔀 You went your own way'}</div>
            <div class="xr-panel path">
              <div class="xr-ph">✓ History’s path — “${esc(real.t)}”</div>
              <p>${esc(b.outcome)}</p>
            </div>
            <div class="xr-panel alt">
              <div class="xr-ph">🔮 The road not taken — historians can only guess</div>
              <p>${esc(b.alt)}</p>
            </div>
            <button class="btn primary xr-next">${cx.i < sc.beats.length - 1 ? 'Continue →' : 'Your reckoning →'}</button>
          </div>`;
      }
    }

    const p = el('div', 'story-player xr');
    p.innerHTML = `
      <div class="story-bg" style="background-color:#191410;background-image:linear-gradient(160deg, ${era.color}33, rgba(25,20,16,0) 55%)"></div>
      <div class="story-progress">${bars}</div>
      <div class="story-top">
        <span class="st-name">${sc.emoji} ${esc(sc.title)}</span>
        <button class="story-close" aria-label="Close">✕</button>
      </div>
      ${inner}`;
    document.body.appendChild(p);

    p.querySelector('.story-close').onclick = close;
    const begin = p.querySelector('.xr-begin');
    if (begin) begin.onclick = () => { cx.i = 0; cx.phase = 'scene'; paint(); };
    $$('[data-choice]', p).forEach((btn) => (btn.onclick = () => {
      const c = cx.sc.beats[cx.i].choices[+btn.dataset.choice];
      cx.pickedReal = !!c.real;
      if (c.real) cx.matched++;
      cx.phase = 'reveal';
      paint();
    }));
    const nxt = p.querySelector('.xr-next');
    if (nxt) nxt.onclick = () => {
      if (cx.i < cx.sc.beats.length - 1) { cx.i++; cx.phase = 'scene'; } else { cx.phase = 'end'; }
      paint();
    };
    $$('[data-done]', p).forEach((btn) => (btn.onclick = () => (btn.dataset.done === 'replay' ? open(cx.sc.id) : close())));
  }

  window.Crossroads = { open };
})();
