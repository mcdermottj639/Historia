'use strict';
/* Historia — Learn tab: the era browser (each era = an expandable card with
 * its intro, events and people) and the Figures gallery (portrait cards,
 * Wikipedia thumbnails at runtime with a monogram fallback). */

(function () {
  function renderLearn() {
    const host = $('#learn-host');
    if (!host) return;
    const figsByEra = {};
    for (const f of window.H_FIGURES) (figsByEra[f.era] = figsByEra[f.era] || []).push(f);
    const evsByEra = {};
    for (const ev of window.H_EVENTS) {
      const k = window.H_ERA_OF_YEAR(ev.y).k;
      (evsByEra[k] = evsByEra[k] || []).push(ev);
    }

    host.innerHTML = `
      <div class="era-list">
        ${window.H_ERAS.map((e) => {
          const evs = (evsByEra[e.k] || []).sort((a, b) => a.y - b.y);
          const figs = figsByEra[e.k] || [];
          return `<div class="era-card" data-era="${e.k}">
            <button class="era-head" aria-expanded="false">
              <span class="era-swatch" style="background:${e.color}"></span>
              <span class="era-emoji">${e.emoji}</span>
              <span>
                <div class="era-name">${esc(e.label)}</div>
                <div class="era-range">${fmtYear(e.from)} – ${e.k === 'modern' ? 'today' : fmtYear(e.to)}</div>
              </span>
              <span class="era-count">${evs.length} events${figs.length ? ` · ${figs.length} people` : ''}</span>
            </button>
            <div class="era-body">
              <p class="era-intro">${esc(e.intro)}</p>
              ${figs.length ? `<div class="era-sec">People</div>
                <div class="chip-row" style="margin-top:0">${figs.map((f) => `<button class="chip" data-fig="${f.id}">👤 ${esc(f.name)}</button>`).join('')}</div>` : ''}
              <div class="era-sec">Events</div>
              ${evs.map((ev) => `<div class="era-ev" data-ev="${ev.id}" role="button" tabindex="0">
                  <span class="ee-y" style="color:${e.color}">${fmtYear(ev.y, ev.approx)}</span>
                  <span class="ee-t">${esc(ev.title)}</span>
                </div>`).join('')}
              <div class="chip-row" style="margin-top:12px"><button class="chip" data-tl="${(e.from + Math.min(e.to, 2030)) / 2}">🕰️ See this era on the timeline</button></div>
            </div>
          </div>`;
        }).join('')}
      </div>

      <h2 class="section-title">Figures gallery</h2>
      <p class="section-sub">Tap anyone to meet them. Portraits load live from Wikipedia when online.</p>
      <div class="fig-grid">
        ${[...window.H_FIGURES].sort((a, b) => a.born - b.born).map((f) => {
          const era = window.H_ERA_BY_KEY[f.era];
          return `<button class="fig-card" data-fig="${f.id}">
            <div class="fig-face" data-face="${esc(f.wiki)}" style="background-color:${era.color}">${esc(f.name[0])}</div>
            <div class="fig-name">${esc(f.name)}</div>
            <div class="fig-years">${fmtYear(f.born)} – ${f.died == null ? 'now' : fmtYear(f.died)}</div>
            <div class="fig-tagline">${esc(f.tag)}</div>
          </button>`;
        }).join('')}
      </div>
      <p class="note" style="margin-top:12px">Everything here is hand-written. “Read more ↗” links open the full Wikipedia article — Historia never scrapes article text, it links to the source.</p>`;

    // era accordions
    $$('#learn-host .era-head').forEach((h) => (h.onclick = () => {
      const card = h.closest('.era-card');
      const open = card.classList.toggle('open');
      h.setAttribute('aria-expanded', open ? 'true' : 'false');
    }));
    // events + figures + timeline links
    $$('#learn-host [data-ev]').forEach((r) => {
      const go = () => openEventSheet(window.H_EVENTS.find((e) => e.id === r.dataset.ev));
      r.onclick = go;
      r.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } };
    });
    $$('#learn-host [data-fig]').forEach((b) => (b.onclick = () => openFigureSheet(window.H_FIG_BY_ID[b.dataset.fig])));
    $$('#learn-host [data-tl]').forEach((b) => (b.onclick = () => { showTab('timeline'); window.Timeline.focusYear(+b.dataset.tl, 1); }));

    // portrait fill-in (async, cached, silent offline)
    for (const f of window.H_FIGURES) {
      fetchPortrait(f).then((url) => {
        if (!url) return;
        $$(`#learn-host [data-face="${CSS.escape(f.wiki)}"]`).forEach((n) => {
          n.textContent = '';
          n.style.backgroundImage = `url("${url}")`;
        });
      });
    }
  }

  window.Learn = { renderLearn };
})();
