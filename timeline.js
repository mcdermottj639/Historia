'use strict';
/* Historia — the Grand Timeline. 5,000+ years on one horizontally scrollable
 * strip: a year ruler, colored era bands, and every event in data/events.js as
 * a tappable marker. Zoom presets change the px-per-year scale; events that
 * would collide at the current scale merge into "+N" cluster pills that zoom
 * in when tapped. Native horizontal scroll = free momentum/inertia on iOS. */

(function () {
  const MIN_Y = -3200, MAX_Y = 2040, PAD = 46;
  // px-per-year presets, each with a marker mode: at wide zooms markers are
  // dots (density view); zooming in earns year labels, then full titles.
  const LEVELS = [
    { ppy: 0.34, gap: 15, mode: 'dot' },
    { ppy: 1.4, gap: 34, mode: 'year' },
    { ppy: 5, gap: 90, mode: 'full' },
    { ppy: 14, gap: 96, mode: 'full' },
  ];
  let level = 0;

  const xOf = (y) => (y - MIN_Y) * LEVELS[level].ppy + PAD;
  const yearAtCenter = () => {
    const sc = $('#tl-scroll'); if (!sc) return 0;
    return (sc.scrollLeft + sc.clientWidth / 2 - PAD) / LEVELS[level].ppy + MIN_Y;
  };

  function tickStep() {
    // pick the FINEST step that still keeps ticks ≥ 70px apart
    for (const s of [5, 10, 25, 50, 100, 250, 500, 1000]) if (s * LEVELS[level].ppy >= 70) return s;
    return 1000;
  }

  function render(centerYear) {
    const host = $('#timeline-host');
    if (!host) return;
    const { ppy, mode } = LEVELS[level];
    const width = (MAX_Y - MIN_Y) * ppy + PAD * 2;

    // ruler ticks
    const step = tickStep();
    let ticks = '';
    for (let y = Math.ceil(MIN_Y / step) * step; y <= MAX_Y; y += step) {
      ticks += `<div class="tl-tick" style="left:${xOf(y)}px">${y < 0 ? -y + ' BCE' : y}</div>`;
    }

    // era bands
    const bands = window.H_ERAS.map((e) => {
      const l = xOf(Math.max(e.from, MIN_Y)), r = xOf(Math.min(e.to, MAX_Y));
      return `<button class="tl-band" data-era="${e.k}" style="left:${l}px;width:${r - l}px;background:linear-gradient(180deg, ${e.color}, ${e.color}cc)" title="${esc(e.label)}">
        <span class="tl-band-label">${e.emoji} ${esc(e.label)}</span></button>`;
    }).join('');

    // events → singles + clusters at this scale. FIXED-WIDTH buckets (not
    // chain-merging) so a dense century becomes several "+N" pills instead of
    // one mega-cluster swallowing 250 years.
    const evs = [...window.H_EVENTS].sort((a, b) => a.y - b.y);
    const minGap = LEVELS[level].gap;
    const bucketPx = Math.max(minGap, 40);
    const byBucket = new Map();
    for (const ev of evs) {
      const x = xOf(ev.y);
      const idx = Math.floor((x - PAD) / bucketPx);
      if (!byBucket.has(idx)) byBucket.set(idx, { x0: x, x1: x, items: [] });
      const g = byBucket.get(idx);
      g.items.push(ev); g.x1 = x;
    }
    const groups = [...byBucket.values()];
    let evHtml = '';
    let lane = 0;
    for (const g of groups) {
      const cx = (g.x0 + g.x1) / 2;
      if (g.items.length === 1) {
        const ev = g.items[0];
        const era = window.H_ERA_OF_YEAR(ev.y);
        if (mode === 'dot') {
          evHtml += `<button class="tl-ev tl-ev-dot" data-ev="${ev.id}" style="left:${cx}px;top:0" title="${esc(ev.title)}">
              <span class="ev-dot" style="background:${era.color}"></span>
            </button>`;
        } else if (mode === 'year') {
          const stem = lane % 2 ? 26 : 6; lane++;
          evHtml += `<button class="tl-ev tl-ev-year" data-ev="${ev.id}" style="left:${cx}px;top:0" title="${esc(ev.title)}">
              <span class="ev-dot" style="background:${era.color}"></span>
              <span class="ev-stem" style="height:${stem}px"></span>
              <span class="ev-year">${fmtYear(ev.y, ev.approx)}</span>
            </button>`;
        } else {
          const stem = lane % 2 ? 84 : 16; lane++; // alternate so labels breathe
          evHtml += `<button class="tl-ev" data-ev="${ev.id}" style="left:${cx}px;top:0">
              <span class="ev-dot" style="background:${era.color}"></span>
              <span class="ev-stem" style="height:${stem}px"></span>
              <span class="ev-year">${fmtYear(ev.y, ev.approx)}</span>
              <span class="ev-label">${esc(ev.title)}</span>
            </button>`;
        }
      } else {
        const midY = Math.round((g.items[0].y + g.items[g.items.length - 1].y) / 2);
        evHtml += `<button class="tl-cluster" data-year="${midY}" style="left:${cx}px;top:${mode === 'dot' ? 2 : 14}px" title="Zoom in">+${g.items.length}</button>`;
        lane = 0;
      }
    }

    host.innerHTML = `
      <div class="tl-wrap">
        <div class="tl-toolbar">
          <div class="chip-row" style="margin:0">
            ${window.H_ERAS.map((e) => `<button class="chip" data-jump="${e.k}" style="padding:6px 10px;font-size:12px"><span class="dot" style="background:${e.color}"></span>${e.emoji}</button>`).join('')}
          </div>
          <div class="tl-zoom">
            <button class="btn" id="tl-out" aria-label="Zoom out" ${level === 0 ? 'disabled' : ''}>−</button>
            <button class="btn" id="tl-in" aria-label="Zoom in" ${level === LEVELS.length - 1 ? 'disabled' : ''}>+</button>
          </div>
        </div>
        <div class="tl-scroll" id="tl-scroll">
          <div class="tl-inner" style="width:${width}px">
            <div class="tl-ruler">${ticks}</div>
            <div class="tl-bands">${bands}</div>
            <div class="tl-events">${evHtml}</div>
          </div>
        </div>
      </div>
      <p class="tl-hint" style="padding:8px 4px 0">Drag to travel · pinch-free zoom with − / + · tap a <b>+N</b> pill to dive in · tap an era chip to jump. ${window.H_EVENTS.length} events and counting.</p>`;

    // wiring
    $('#tl-in').onclick = () => setLevel(level + 1);
    $('#tl-out').onclick = () => setLevel(level - 1);
    $$('#timeline-host [data-ev]').forEach((b) => (b.onclick = () => openEventSheet(window.H_EVENTS.find((e) => e.id === b.dataset.ev))));
    $$('#timeline-host [data-year]').forEach((b) => (b.onclick = () => focusYear(+b.dataset.year, Math.min(level + 1, LEVELS.length - 1))));
    $$('#timeline-host [data-jump]').forEach((b) => (b.onclick = () => {
      const e = window.H_ERA_BY_KEY[b.dataset.jump];
      focusYear((e.from + Math.min(e.to, MAX_Y)) / 2, level);
    }));
    $$('#timeline-host [data-era]').forEach((b) => (b.onclick = () => {
      const e = window.H_ERA_BY_KEY[b.dataset.era];
      focusYear((e.from + Math.min(e.to, MAX_Y)) / 2, Math.min(level + 1, LEVELS.length - 1));
    }));

    // restore the anchor year at viewport center
    requestAnimationFrame(() => {
      const sc = $('#tl-scroll');
      if (sc && centerYear != null) sc.scrollLeft = xOf(centerYear) - sc.clientWidth / 2;
    });
  }

  function setLevel(l, centerYear) {
    const anchor = centerYear != null ? centerYear : yearAtCenter();
    level = Math.max(0, Math.min(LEVELS.length - 1, l));
    render(anchor);
  }
  function focusYear(y, l) {
    if (l != null && l !== level) { level = Math.max(0, Math.min(LEVELS.length - 1, l)); }
    render(y);
  }

  window.Timeline = {
    render: () => render(1969), // first open lands on a good year
    focusYear,
  };
})();
