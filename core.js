'use strict';
/* Historia — core: shared helpers, persistence, XP/rank system, bottom sheets,
 * Wikipedia portrait fetches. Loaded after data/*, before the feature modules.
 * Everything here is deliberately dependency-free vanilla JS. */

// --- tiny helpers -----------------------------------------------------------
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// seeded PRNG (same family as Sports-Hub's Trivia Lab) so daily picks are
// identical for a given date on every device.
function hashStr(s) { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function seededRng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const shuffleWith = (arr, rng) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const rrng = () => Math.random();
function todayStr() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }

// year formatting: negative = BCE. "c." marks approximate dates honestly.
function fmtYear(y, approx) {
  const n = y < 0 ? `${-y} BCE` : (y < 1000 ? `${y} CE` : String(y));
  return (approx ? 'c. ' : '') + n;
}
const REGIONS = { europe: 'Europe', asia: 'Asia', africa: 'Africa', mideast: 'Middle East', americas: 'The Americas', oceania: 'Oceania', global: 'The World' };

// --- persistence -------------------------------------------------------------
// localStorage keys all live under historia:* — per browser/device.
const readJSON = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (_) { return d; } };
const writeJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} };
const K = {
  XP: 'historia:xp',           // number — lifetime Wisdom
  DAYS: 'historia:days',       // {'YYYY-MM-DD': true} — any-activity days (streak)
  STORIES: 'historia:stories', // {storyId: {done, best}}
  BEST: 'historia:best',       // {gameKey: bestScore}
  THEME: 'historia:theme',     // 'light' | 'dark'
  PORTRAITS: 'historia:portraits', // {wikiTitle: thumbUrl | 0 (known-missing)}
  XROADS: 'historia:crossroads',   // {scenarioId: {done, best (matches)}}
  DAILY: 'historia:daily',         // {date, clues, wrong, out[], done, score} — today's Reckoning
};

// --- Wisdom (XP) + ranks ------------------------------------------------------
const RANKS = [
  { at: 0, name: 'Apprentice', emoji: '🕯️' },
  { at: 150, name: 'Scribe', emoji: '🖋️' },
  { at: 400, name: 'Chronicler', emoji: '📜' },
  { at: 900, name: 'Scholar', emoji: '🎓' },
  { at: 1800, name: 'Historian', emoji: '🏛️' },
  { at: 3200, name: 'Master Historian', emoji: '👑' },
  { at: 6000, name: 'Keeper of Ages', emoji: '⏳' },
];
const getXP = () => readJSON(K.XP, 0) || 0;
function rankFor(xp) {
  let r = RANKS[0], next = null;
  for (let i = 0; i < RANKS.length; i++) { if (xp >= RANKS[i].at) { r = RANKS[i]; next = RANKS[i + 1] || null; } }
  return { ...r, next };
}
function addXP(n, label) {
  if (!n || n <= 0) return;
  const before = rankFor(getXP());
  const xp = getXP() + Math.round(n);
  writeJSON(K.XP, xp);
  const days = readJSON(K.DAYS, {}); days[todayStr()] = true; writeJSON(K.DAYS, days);
  const after = rankFor(xp);
  toast(after.name !== before.name
    ? `${after.emoji} Rank up — you are now a ${after.name}!`
    : `✨ +${Math.round(n)} Wisdom${label ? ` · ${label}` : ''}`);
  if (typeof renderHome === 'function') renderHome(); // keep the hero stats live
}
function dayStreak() {
  const map = readJSON(K.DAYS, {});
  let n = 0; const d = new Date();
  for (;;) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (map[key]) { n++; d.setDate(d.getDate() - 1); } else break;
  }
  return n;
}

// --- toast ---------------------------------------------------------------------
let toastTimer = null;
function toast(msg) {
  $$('.toast').forEach((t) => t.remove());
  const t = el('div', 'toast', esc(msg));
  document.body.appendChild(t);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.remove(), 2600);
}

// --- bottom sheet ----------------------------------------------------------------
function closeSheet() { $$('.sheet, .sheet-backdrop').forEach((n) => n.remove()); }
function openSheet(innerHTML) {
  closeSheet();
  const back = el('div', 'sheet-backdrop');
  const sh = el('div', 'sheet', `<div class="sheet-grab"></div>${innerHTML}`);
  back.onclick = closeSheet;
  document.body.append(back, sh);
  return sh;
}

// Event detail sheet — shared by the timeline, era browser and Time Machine.
function openEventSheet(ev) {
  const era = window.H_ERA_OF_YEAR(ev.y);
  const figs = (ev.fig || []).map((id) => window.H_FIG_BY_ID[id]).filter(Boolean);
  const sh = openSheet(`
    <span class="sheet-era" style="background:${era.color}">${era.emoji} ${esc(era.label)}</span>
    <div class="sheet-img" data-img hidden></div>
    <div class="sheet-year">${fmtYear(ev.y, ev.approx)}</div>
    <h3 class="sheet-title">${esc(ev.title)}</h3>
    <p class="sheet-blurb">${esc(ev.blurb)}</p>
    <div class="sheet-meta">📍 ${esc(REGIONS[ev.region] || ev.region)} · ${esc(era.label)}, ${fmtYear(era.from)} – ${fmtYear(era.to)}</div>
    ${figs.length ? `<div class="chip-row">${figs.map((f) => `<button class="chip" data-fig="${f.id}">👤 ${esc(f.name)}</button>`).join('')}</div>` : ''}
    <div class="sheet-actions">
      <button class="btn small" data-act="tl">🕰️ See on timeline</button>
      ${ev.wiki ? `<a class="btn small ghost" href="https://en.wikipedia.org/wiki/${encodeURIComponent(ev.wiki.replace(/ /g, '_'))}" target="_blank" rel="noopener">Read more ↗</a>` : ''}
    </div>`);
  sh.querySelector('[data-act="tl"]').onclick = () => { closeSheet(); showTab('timeline'); window.Timeline && window.Timeline.focusYear(ev.y, 2); };
  $$('[data-fig]', sh).forEach((b) => (b.onclick = () => openFigureSheet(window.H_FIG_BY_ID[b.dataset.fig])));
  if (ev.wiki) fetchThumb(ev.wiki).then((url) => {
    const img = sh.querySelector('[data-img]');
    if (url && img) { img.hidden = false; img.style.backgroundImage = `url("${url}")`; }
  });
}

// Figure detail sheet.
function openFigureSheet(f) {
  if (!f) return;
  const era = window.H_ERA_BY_KEY[f.era];
  const lived = `${fmtYear(f.born)} – ${f.died == null ? 'present' : fmtYear(f.died)}`;
  const sh = openSheet(`
    <span class="sheet-era" style="background:${era.color}">${era.emoji} ${esc(era.label)}</span>
    <div style="display:flex;gap:14px;align-items:center;margin-top:12px">
      <div class="fig-face" data-face style="background-color:${era.color}">${esc(f.name[0])}</div>
      <div>
        <h3 class="sheet-title" style="margin:0">${esc(f.name)}</h3>
        <div class="sheet-meta" style="margin:4px 0 0">${lived}</div>
      </div>
    </div>
    <p class="sheet-blurb" style="margin-top:12px"><b>${esc(f.tag)}.</b></p>
    <ul class="fig-facts">${f.facts.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    <div class="sheet-actions">
      ${f.wiki ? `<a class="btn small ghost" href="https://en.wikipedia.org/wiki/${encodeURIComponent(f.wiki.replace(/ /g, '_'))}" target="_blank" rel="noopener">Full biography ↗</a>` : ''}
    </div>`);
  fetchPortrait(f).then((url) => { const face = sh.querySelector('[data-face]'); if (url && face) { face.textContent = ''; face.style.backgroundImage = `url("${url}")`; } });
}

// --- Wikipedia thumbnails (REST summary; ACAO:* — browser-direct, no key) --------
// One cache for figure portraits AND event images, keyed by article title:
// {title: url} or {title: 0} for known-missing, so offline environments
// degrade silently (monogram tiles / no image) and never refetch known-misses.
const thumbInflight = {};
function fetchThumb(title) {
  if (!title) return Promise.resolve(null);
  const cache = readJSON(K.PORTRAITS, {});
  if (Object.prototype.hasOwnProperty.call(cache, title)) return Promise.resolve(cache[title] || null);
  if (thumbInflight[title]) return thumbInflight[title];
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 8000);
  thumbInflight[title] = fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`, { signal: ctrl.signal })
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => {
      const url = d && d.thumbnail && d.thumbnail.source ? d.thumbnail.source : 0;
      const c = readJSON(K.PORTRAITS, {}); c[title] = url; writeJSON(K.PORTRAITS, c);
      return url || null;
    })
    .catch(() => null) // network blocked/offline: no cache write, retry next visit
    .finally(() => { clearTimeout(to); delete thumbInflight[title]; });
  return thumbInflight[title];
}
const fetchPortrait = (f) => fetchThumb(f && f.wiki);
