'use strict';
/* Historia — Story Mode. Cinematic tap-through stories (the Instagram-stories
 * grammar: full-screen slides, progress bars up top, tap right to advance,
 * left third to go back), ending in a 3-question retention quiz that pays
 * Wisdom. Pure DOM — the "player" is one fixed-position div. */

(function () {
  let st = null; // {story, i, phase:'slides'|'quiz'|'end', qi, right, picked}

  const doneMap = () => readJSON(K.STORIES, {});

  function renderShelf() {
    const host = $('#stories-host');
    if (!host) return;
    const done = doneMap();
    host.innerHTML = `
      <div class="story-grid">
        ${window.H_STORIES.map((s) => {
          const era = window.H_ERA_BY_KEY[s.era];
          const d = done[s.id];
          return `<button class="story-card" data-story="${s.id}">
            <div class="story-cover" style="background:linear-gradient(135deg, ${era.color}55, ${era.color}22), linear-gradient(180deg, #241c14, #191410)">${s.emoji}</div>
            <div class="story-body">
              <div class="story-kicker">${esc(s.kicker)}</div>
              <div class="story-title">${esc(s.title)}</div>
              <div class="story-meta"><span>⏱ ${s.minutes} min</span><span>·</span><span>${s.slides.length} chapters</span>
                ${d ? `<span class="story-done">✓ ${d.best}/3</span>` : ''}</div>
            </div>
          </button>`;
        }).join('')}
      </div>
      <p class="note" style="margin-top:12px">Every story is hand-written and fact-checked — where legend crept into the record, the story says so. More stories land with every update; tell me which moments you want told.</p>`;
    $$('#stories-host [data-story]').forEach((b) => (b.onclick = () => open(b.dataset.story)));
  }

  function open(id) {
    const story = window.H_STORY_BY_ID[id];
    if (!story) return;
    st = { story, i: 0, phase: 'slides', qi: 0, right: 0, picked: false };
    paint();
  }
  function close() {
    $$('.story-player').forEach((n) => n.remove());
    document.body.style.overflow = '';
    st = null;
    renderShelf();
    if (typeof renderHome === 'function') renderHome();
  }

  function paint() {
    $$('.story-player').forEach((n) => n.remove());
    if (!st) return;
    document.body.style.overflow = 'hidden';
    const { story } = st;
    const era = window.H_ERA_BY_KEY[story.era];
    const total = story.slides.length;
    const p = el('div', 'story-player');
    const bars = Array.from({ length: total }, (_, i) =>
      `<i class="${i < st.i ? 'done' : i === st.i && st.phase === 'slides' ? 'now' : ''}"><b></b></i>`).join('');

    let inner = '';
    if (st.phase === 'slides') {
      const s = story.slides[st.i];
      inner = `
        <div class="story-slide">
          <div class="sl-emoji">${st.i === 0 ? story.emoji : ''}</div>
          ${s.k ? `<div class="sl-kicker">${esc(s.k)}</div>` : ''}
          <h2 class="sl-title">${esc(s.t)}</h2>
          <p class="sl-body">${esc(s.body)}</p>
        </div>
        <div class="story-nav">
          <button class="nv back" aria-label="Previous"></button>
          <button class="nv fwd" aria-label="Next"></button>
        </div>
        <div class="story-tapnote">tap to continue · ${st.i + 1}/${total}</div>`;
    } else if (st.phase === 'quiz') {
      const q = st.q[st.qi];
      inner = `
        <div class="story-quiz">
          <div class="sq-step">Did you catch it? · ${st.qi + 1} of ${st.q.length}</div>
          <h3 class="sq-q">${esc(q.q)}</h3>
          <div class="sq-opts">${q.choices.map((c, i) => `<button class="sq-opt" data-i="${i}">${esc(c)}</button>`).join('')}</div>
        </div>`;
    } else {
      const first = !doneMap()[story.id];
      const xp = first ? 40 + st.right * 15 : 10 + st.right * 2;
      inner = `
        <div class="story-quiz story-end">
          <div class="se-big">${st.right === st.q.length ? '🏆' : st.right >= 2 ? '🌟' : '📖'}</div>
          <h3>${st.right}/${st.q.length} — ${st.right === st.q.length ? 'Perfect recall' : st.right >= 2 ? 'Well read' : 'Story absorbed'}</h3>
          <p>${esc(story.title)} · ${esc(story.kicker)}</p>
          <span class="se-xp">✨ +${xp} Wisdom</span><br/>
          <button class="btn primary" data-done="close">Back to the shelf</button>
          <button class="btn ghost" data-done="replay">Replay</button>
        </div>`;
      // persist once per paint of the end screen
      const map = doneMap();
      if (!map[story.id] || st.right > map[story.id].best) map[story.id] = { done: 1, best: st.right };
      writeJSON(K.STORIES, map);
      if (!st.awarded) { st.awarded = true; addXP(xp, 'story'); }
    }

    p.innerHTML = `
      <div class="story-bg" style="background-color:#191410;background-image:linear-gradient(160deg, ${era.color}33, rgba(25,20,16,0) 55%)"></div>
      <div class="story-progress">${bars}</div>
      <div class="story-top">
        <span class="st-name">${story.emoji} ${esc(story.title)}</span>
        <button class="story-close" aria-label="Close story">✕</button>
      </div>
      ${inner}`;
    document.body.appendChild(p);

    p.querySelector('.story-close').onclick = close;
    if (st.phase === 'slides') {
      p.querySelector('.nv.fwd').onclick = next;
      p.querySelector('.nv.back').onclick = back;
    } else if (st.phase === 'quiz') {
      $$('.sq-opt', p).forEach((b) => (b.onclick = () => pick(+b.dataset.i, p)));
    } else {
      $$('[data-done]', p).forEach((b) => (b.onclick = () => (b.dataset.done === 'replay' ? open(story.id) : close())));
    }
  }

  function next() {
    if (st.i < st.story.slides.length - 1) { st.i++; paint(); }
    else {
      // build the quiz with shuffled choices once
      st.q = st.story.quiz.map((q) => {
        const choices = shuffleWith([q.a, ...q.w], rrng);
        return { q: q.q, choices, answer: choices.indexOf(q.a) };
      });
      st.phase = 'quiz'; st.qi = 0; st.right = 0;
      paint();
    }
  }
  function back() { if (st.i > 0) { st.i--; paint(); } }

  function pick(i, p) {
    const q = st.q[st.qi];
    if (st.picked) return;
    st.picked = true;
    if (i === q.answer) st.right++;
    $$('.sq-opt', p).forEach((b, bi) => {
      b.disabled = true;
      if (bi === q.answer) b.classList.add('right');
      else if (bi === i) b.classList.add('wrong');
    });
    const nextBtn = el('button', 'btn primary sq-next', st.qi < st.q.length - 1 ? 'Next →' : 'Finish');
    nextBtn.onclick = () => {
      st.picked = false;
      if (st.qi < st.q.length - 1) { st.qi++; paint(); }
      else { st.phase = 'end'; paint(); }
    };
    p.querySelector('.story-quiz').appendChild(nextBtn);
  }

  window.Story = { renderShelf, open };
})();
