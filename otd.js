'use strict';
/* Historia — 📅 On This Day. Live from the Wikimedia Feed API
 * (api.wikimedia.org, CORS *, keyless): curated "selected" anniversaries for
 * today's date. Cached in localStorage per calendar day so it costs one fetch
 * per day; the section hides itself entirely when offline with no cache —
 * the app never shows a broken box. Attribution: content is from Wikipedia. */

(function () {
  const KEY = 'historia:otd'; // {mmdd, items:[{y,text,title,thumb,extract,url}]}
  const pad2 = (n) => String(n).padStart(2, '0');

  async function getToday() {
    const d = new Date();
    const mmdd = `${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    const cached = readJSON(KEY, null);
    if (cached && cached.mmdd === mmdd && Array.isArray(cached.items) && cached.items.length) return cached.items;
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 9000);
    try {
      const res = await fetch(`https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/selected/${pad2(d.getMonth() + 1)}/${pad2(d.getDate())}`, { signal: ctrl.signal });
      if (!res.ok) return null;
      const data = await res.json();
      // trim hard: the raw feed is big; we keep only what we render
      const items = (data.selected || []).map((s) => {
        const p = (s.pages && s.pages[0]) || {};
        return {
          y: s.year, text: s.text,
          title: (p.titles && p.titles.normalized) || '',
          thumb: (p.thumbnail && p.thumbnail.source) || '',
          extract: p.extract || '',
          url: (p.content_urls && p.content_urls.desktop && p.content_urls.desktop.page) || '',
        };
      }).filter((x) => x.y != null && x.text).slice(0, 20);
      if (!items.length) return null;
      writeJSON(KEY, { mmdd, items });
      return items;
    } catch (e) { return null; }
    finally { clearTimeout(to); }
  }

  function openOTDSheet(x) {
    openSheet(`
      <span class="sheet-era" style="background:var(--accent)">📅 On this day</span>
      ${x.thumb ? `<div class="sheet-img" style="background-image:url('${encodeURI(x.thumb)}')"></div>` : ''}
      <div class="sheet-year">${x.y < 0 ? `${-x.y} BCE` : x.y}</div>
      ${x.title ? `<h3 class="sheet-title">${esc(x.title)}</h3>` : ''}
      <p class="sheet-blurb">${esc(x.text)}</p>
      ${x.extract ? `<div class="sheet-meta">${esc(x.extract)}</div>` : ''}
      <div class="sheet-actions">
        ${x.url ? `<a class="btn small ghost" href="${esc(x.url)}" target="_blank" rel="noopener">Read more ↗</a>` : ''}
      </div>`);
  }

  // Renders into a host div; hides the host when nothing usable is available.
  async function renderInto(sel) {
    const host = $(sel);
    if (!host) return;
    const items = await getToday();
    if (!items || !items.length) { host.hidden = true; host.innerHTML = ''; return; }
    // seeded daily pick of 5, shown oldest → newest
    const rng = seededRng(hashStr('otd-' + todayStr()));
    const picks = shuffleWith(items, rng).slice(0, 5).sort((a, b) => a.y - b.y);
    const label = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    host.hidden = false;
    host.innerHTML = `
      <h2 class="section-title">📅 On This Day · ${label}</h2>
      <div class="tm-card"><div class="tm-body" style="padding-top:10px">
        ${picks.map((x, i) => `<div class="tm-event" data-otd="${i}" role="button" tabindex="0">
          <span class="tm-ey">${x.y < 0 ? `${-x.y} BCE` : x.y}</span>
          <span class="tm-et"><b>${esc(x.title || 'This happened')}</b><span>${esc(x.text)}</span></span>
        </div>`).join('')}
      </div></div>
      <p class="note" style="margin-top:8px">Live from Wikipedia’s “On this day” — a fresh set every morning.</p>`;
    host.querySelectorAll('[data-otd]').forEach((r) => {
      const go = () => openOTDSheet(picks[+r.dataset.otd]);
      r.onclick = go;
      r.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } };
    });
  }

  window.OTD = { renderInto };
})();
