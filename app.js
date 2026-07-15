'use strict';
/* Historia — app shell: version, tabs, theme, Home (Time Machine + stats),
 * About, service-worker registration. Loaded LAST — data/*, core.js and the
 * feature modules (timeline/story/games/learn) are already on window. */

const APP_VERSION = 'v8';

// --- tabs ---------------------------------------------------------------------
const PANELS = ['home', 'timeline', 'stories', 'games', 'learn', 'about'];
function showTab(name) {
  PANELS.forEach((p) => {
    const panel = document.getElementById(p);
    const tab = document.getElementById('tab-' + p);
    const on = p === name;
    if (panel) panel.classList.toggle('active', on);
    if (tab) { tab.classList.toggle('active', on); tab.setAttribute('aria-selected', on ? 'true' : 'false'); }
  });
  window.scrollTo({ top: 0 });
  // lazy first render per tab
  if (name === 'timeline' && !$('#timeline-host').dataset.ready) { $('#timeline-host').dataset.ready = 1; window.Timeline.render(); }
  if (name === 'stories') window.Story.renderShelf();
  if (name === 'games' && !$('#games-host').dataset.ready) { $('#games-host').dataset.ready = 1; window.Games.renderHub(); }
  if (name === 'learn' && !$('#learn-host').dataset.ready) { $('#learn-host').dataset.ready = 1; window.Learn.renderLearn(); }
}
$$('#tabs button').forEach((b) => (b.onclick = () => showTab(b.dataset.tab)));

// --- theme (dark default; light = editorial/museum) ------------------------------
const themeMeta = document.querySelector('meta[name="theme-color"]');
const effectiveTheme = () => (document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  if (themeMeta) themeMeta.setAttribute('content', t === 'light' ? '#f6f1e7' : '#241a12');
  const btn = $('#theme-toggle');
  if (btn) { btn.textContent = t === 'light' ? '☀️' : '🌙'; btn.setAttribute('aria-label', t === 'light' ? 'Switch to dark mode' : 'Switch to light mode'); }
}
applyTheme(effectiveTheme());
$('#theme-toggle').addEventListener('click', () => {
  const next = effectiveTheme() === 'light' ? 'dark' : 'light';
  try { localStorage.setItem(K.THEME, next); } catch (e) {}
  applyTheme(next);
});
window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
  if (!localStorage.getItem(K.THEME)) applyTheme(e.matches ? 'light' : 'dark');
});

// --- Home ------------------------------------------------------------------------
// Time Machine: a seeded daily landing — same year for everyone on a given date.
function timeMachinePick() {
  const rng = seededRng(hashStr('tm-' + todayStr()));
  const ev = window.H_EVENTS[Math.floor(rng() * window.H_EVENTS.length)];
  const nearby = window.H_EVENTS.filter((e) => Math.abs(e.y - ev.y) <= 2)
    .sort((a, b) => a.y - b.y || (a.id === ev.id ? -1 : 1)).slice(0, 3);
  return { ev, nearby };
}

function renderHome() {
  const host = $('#home-host');
  if (!host) return;
  const xp = getXP();
  const rank = rankFor(xp);
  const streak = dayStreak();
  const storiesDone = Object.keys(readJSON(K.STORIES, {})).length;
  const best = readJSON(K.BEST, {});
  const pctToNext = rank.next ? Math.min(100, Math.round(((xp - rank.at) / (rank.next.at - rank.at)) * 100)) : 100;
  const { ev, nearby } = timeMachinePick();
  const era = window.H_ERA_OF_YEAR(ev.y);
  const storyRng = seededRng(hashStr('story-' + todayStr()));
  const todaysStory = window.H_STORIES[Math.floor(storyRng() * window.H_STORIES.length)];

  host.innerHTML = `
    <div class="hero">
      <div class="hero-kicker">History, the fun way</div>
      <h2>Historia</h2>
      <p class="hero-sub">Travel the timeline, live the stories, play the past. Everything runs on your phone — even offline.</p>
      <div class="stat-strip">
        <div class="stat"><span class="stat-n">✨ ${xp.toLocaleString()}</span><span class="stat-l">Wisdom</span></div>
        <div class="stat"><span class="stat-n">🔥 ${streak}</span><span class="stat-l">Day streak</span></div>
        <div class="stat"><span class="stat-n">${storiesDone}/${window.H_STORIES.length}</span><span class="stat-l">Stories</span></div>
        <div class="stat"><span class="stat-n">⚖️ ${best.ba || 0}</span><span class="stat-l">B/A best</span></div>
      </div>
      <div class="rank-line">
        <span class="rank-badge">${rank.emoji} ${rank.name}</span>
        <div class="xp-bar"><div class="xp-fill" style="width:${pctToNext}%"></div></div>
        <span class="xp-note">${rank.next ? `${(rank.next.at - xp).toLocaleString()} to ${rank.next.name}` : 'Max rank — for now'}</span>
      </div>
    </div>

    <h2 class="section-title">🕰️ The Time Machine</h2>
    <div class="tm-card">
      <div class="tm-top">
        <div class="tm-kicker">Today the machine landed in…</div>
        <div class="tm-year">${fmtYear(ev.y, ev.approx)}</div>
        <div class="tm-era">${era.emoji} ${esc(era.label)} · ${esc(REGIONS[ev.region] || ev.region)}</div>
      </div>
      <div class="tm-body">
        ${nearby.map((e) => `<div class="tm-event" data-ev="${e.id}">
          <span class="tm-ey">${fmtYear(e.y, e.approx)}</span>
          <span class="tm-et"><b>${esc(e.title)}</b><span>${esc(e.blurb)}</span></span>
        </div>`).join('')}
      </div>
      <div class="tm-actions">
        <button class="btn primary" data-act="tl">Explore ${fmtYear(ev.y)} on the timeline</button>
        <button class="btn ghost" data-act="game">Play today’s round</button>
      </div>
    </div>

    <div id="home-otd" hidden></div>

    <h2 class="section-title">📖 Today’s story</h2>
    <div class="story-grid" id="home-story"></div>

    <p class="note" style="margin-top:16px">A new landing year and featured story every day — same for every traveler, seeded by the date. Wisdom, streaks and bests live on this device.</p>`;

  // On This Day — async, cached daily, hides itself when unavailable
  window.OTD.renderInto('#home-otd');

  // wire
  $$('#home-host [data-ev]').forEach((r) => (r.onclick = () => openEventSheet(window.H_EVENTS.find((e) => e.id === r.dataset.ev))));
  host.querySelector('[data-act="tl"]').onclick = () => { showTab('timeline'); window.Timeline.focusYear(ev.y, 2); };
  host.querySelector('[data-act="game"]').onclick = () => { showTab('games'); window.Games.startBA(); };

  // today's featured story card (reuses the shelf card look)
  const sEra = window.H_ERA_BY_KEY[todaysStory.era];
  const done = readJSON(K.STORIES, {})[todaysStory.id];
  const sc = el('button', 'story-card', `
    <div class="story-cover" style="background:linear-gradient(135deg, ${sEra.color}55, ${sEra.color}22), linear-gradient(180deg, #241c14, #191410)">${todaysStory.emoji}</div>
    <div class="story-body">
      <div class="story-kicker">${esc(todaysStory.kicker)}</div>
      <div class="story-title">${esc(todaysStory.title)}</div>
      <div class="story-meta"><span>⏱ ${todaysStory.minutes} min</span><span>·</span><span>${todaysStory.slides.length} chapters</span>${done ? `<span class="story-done">✓ ${done.best}/3</span>` : ''}</div>
    </div>`);
  sc.onclick = () => window.Story.open(todaysStory.id);
  $('#home-story').appendChild(sc);
}

// --- About -------------------------------------------------------------------------
function renderAbout() {
  const host = $('#about-host');
  if (!host) return;
  host.innerHTML = `
    <div class="card">
      <p><b>Historia ${APP_VERSION}</b> — a personal history app: a scrubbable
      Grand Timeline of 5,000 years, cinematic tap-through stories, a daily
      “On This Day” feed, era guides, a figures gallery and chronology games
      (Before or After, Timeline Sort), with more on the way — Guess the Era,
      Who Am I?, the deep-cut Trivia Lab, and maps. Sibling app to
      <a href="https://mcdermottj639.github.io/Sports-Hub/" rel="noopener">Sports-Hub</a>.</p>
      <p class="muted">Pure static app — no backend, no accounts, no tracking. Progress
      (Wisdom, streaks, bests) is saved on this device only. Install it to your
      home screen; it works offline after first load and auto-updates when online.</p>
      <p class="muted">Content: all events, stories and figure bios are hand-written and
      fact-checked. Portraits and “read more” links come live from Wikipedia’s
      public API when online (and degrade gracefully when not).</p>
    </div>`;
}

// --- boot -----------------------------------------------------------------------------
$('#app-version').textContent = APP_VERSION;
renderHome();
renderAbout();

// service worker: network-first auto-update with offline fallback (see sw.js)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
}
