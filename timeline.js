'use strict';
/* Historia — the Grand Timeline. 5,000+ years on one horizontally scrollable
 * strip: a year ruler, colored era bands, and every event in data/events.js as
 * a tappable marker. Zoom presets change the px-per-year scale.
 *
 * Markers LANE-PACK: events that would collide are stacked into vertical lanes
 * (greedy first-fit) instead of merging into one "+N" pill, so a dense century
 * shows a dozen readable events instead of a beige cluster. Clusters only
 * appear as a last resort when even the lanes are full (very wide zooms).
 * A sticky "you are here" readout + center crosshair keep you oriented while
 * you drag. Native horizontal scroll = free momentum/inertia on iOS. */

(function () {
  const MIN_Y = -3200, MAX_Y = 2040, PAD = 46;
  // px-per-year presets, each with a marker mode: at wide zooms markers are
  // dots (density view); zooming in earns year labels, then full titles.
  const LEVELS = [
    { ppy: 0.34, mode: 'dot' },
    { ppy: 1.4, mode: 'year' },
    { ppy: 5, mode: 'full' },
    { ppy: 14, mode: 'full' },
  ];
  // per-mode layout: label box width (for collision packing) + lane row height.
  const LAYOUT = {
    dot: { w: 20, rowH: 20, gap: 5, base: 6, pad: 8 },
    year: { w: 52, rowH: 30, gap: 8, base: 10, pad: 16 },
    full: { w: 116, rowH: 54, gap: 10, base: 12, pad: 46 },
  };
  const BANDS_BOTTOM = 74; // ruler(30) + bands(44)
  let level = 2; // land on a readable zoom, not the dot soup

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

  function updateReadout() {
    const now = $('#tl-now'); if (!now) return;
    const y = Math.round(yearAtCenter());
    const era = window.H_ERA_OF_YEAR(y);
    now.innerHTML = `<span class="dot" style="background:${era.color}"></span>${era.emoji} ${esc(era.label)} · <b>${fmtYear(y)}</b>`;
  }

  function render(centerYear) {
    const host = $('#timeline-host');
    if (!host) return;
    const { ppy, mode } = LEVELS[level];
    const L = LAYOUT[mode];
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

    // events → greedy lane packing. Sort by year, drop each into the first lane
    // whose last marker has cleared the horizontal room; if every lane is taken,
    // the event falls into an overflow cluster for its region.
    const evs = [...window.H_EVENTS].sort((a, b) => a.y - b.y);
    // how many lanes fit in the events zone at this row height
    const zoneH = 300; // generous; inner height is trimmed to what we actually use
    const maxLanes = Math.max(2, Math.floor((zoneH - L.base) / L.rowH));
    const laneEdge = new Array(maxLanes).fill(-1e9);
    const placed = [];
    const overflow = [];
    for (const ev of evs) {
      const cx = xOf(ev.y);
      let lane = -1;
      for (let i = 0; i < maxLanes; i++) {
        if (cx - L.w / 2 > laneEdge[i] + L.gap) { lane = i; break; }
      }
      if (lane < 0) { overflow.push({ ev, cx }); continue; }
      laneEdge[lane] = cx + L.w / 2;
      placed.push({ ev, cx, lane });
    }

    // overflow → fixed-width cluster pills tucked just under the band
    const clusterPx = 54;
    const byBucket = new Map();
    for (const o of overflow) {
      const idx = Math.floor((o.cx - PAD) / clusterPx);
      if (!byBucket.has(idx)) byBucket.set(idx, []);
      byBucket.get(idx).push(o);
    }

    let evHtml = '';
    let usedLanes = 0;
    for (const p of placed) {
      const { ev, cx, lane } = p;
      usedLanes = Math.max(usedLanes, lane + 1);
      const stem = L.base + lane * L.rowH;
      const era = window.H_ERA_OF_YEAR(ev.y);
      if (mode === 'dot') {
        evHtml += `<button class="tl-ev tl-ev-dot" data-ev="${ev.id}" style="left:${cx}px;top:0" title="${esc(ev.title)}">
            <span class="ev-stem" style="height:${stem}px"></span>
            <span class="ev-dot" style="background:${era.color}"></span>
          </button>`;
      } else if (mode === 'year') {
        evHtml += `<button class="tl-ev tl-ev-year" data-ev="${ev.id}" style="left:${cx}px;top:0" title="${esc(ev.title)}">
            <span class="ev-stem" style="height:${stem}px"></span>
            <span class="ev-dot" style="background:${era.color}"></span>
            <span class="ev-year">${fmtYear(ev.y, ev.approx)}</span>
          </button>`;
      } else {
        evHtml += `<button class="tl-ev" data-ev="${ev.id}" style="left:${cx}px;top:0">
            <span class="ev-stem" style="height:${stem}px"></span>
            <span class="ev-dot" style="background:${era.color}"></span>
            <span class="ev-year">${fmtYear(ev.y, ev.approx)}</span>
            <span class="ev-label">${esc(ev.title)}</span>
          </button>`;
      }
    }
    for (const [, items] of byBucket) {
      const cx = items.reduce((s, o) => s + o.cx, 0) / items.length;
      const midY = Math.round((items[0].ev.y + items[items.length - 1].ev.y) / 2);
      evHtml += `<button class="tl-cluster" data-year="${midY}" style="left:${cx}px;top:2px" title="Zoom in">+${items.length}</button>`;
    }

    // trim the strip to the lanes we actually used — no more dead white space
    const innerH = BANDS_BOTTOM + L.base + Math.max(usedLanes, 1) * L.rowH + L.pad;

    host.innerHTML = `
      <div class="tl-wrap">
        <div class="tl-toolbar">
          <div class="tl-now" id="tl-now"></div>
          <div class="tl-zoom">
            <button class="btn" id="tl-out" aria-label="Zoom out" ${level === 0 ? 'disabled' : ''}>−</button>
            <button class="btn" id="tl-in" aria-label="Zoom in" ${level === LEVELS.length - 1 ? 'disabled' : ''}>+</button>
          </div>
        </div>
        <div class="chip-row tl-jumps">
          ${window.H_ERAS.map((e) => `<button class="chip" data-jump="${e.k}" title="${esc(e.label)}"><span class="dot" style="background:${e.color}"></span>${e.emoji}</button>`).join('')}
        </div>
        <div class="tl-stage">
          <div class="tl-crosshair"></div>
          <div class="tl-scroll" id="tl-scroll">
          <div class="tl-inner" style="width:${width}px;height:${innerH}px">
            <div class="tl-ruler">${ticks}</div>
            <div class="tl-bands">${bands}</div>
            <div class="tl-events">${evHtml}</div>
          </div>
          </div>
        </div>
        <p class="tl-hint">Drag to travel · <b>−/+</b> to zoom · tap any event for the story · era chips jump you there. ${window.H_EVENTS.length} events and counting.</p>
      </div>`;

    // wiring
    $('#tl-in').onclick = () => setLevel(level + 1);
    $('#tl-out').onclick = () => setLevel(level - 1);
    $$('#timeline-host [data-ev]').forEach((b) => (b.onclick = () => openEventSheet(window.H_EVENTS.find((e) => e.id === b.dataset.ev))));
    $$('#timeline-host [data-year]').forEach((b) => (b.onclick = () => focusYear(+b.dataset.year, Math.min(level + 1, LEVELS.length - 1))));
    $$('#timeline-host [data-jump]').forEach((b) => (b.onclick = () => {
      const e = window.H_ERA_BY_KEY[b.dataset.jump];
      focusYear((e.from + Math.min(e.to, MAX_Y)) / 2, Math.max(level, 1));
    }));
    $$('#timeline-host [data-era]').forEach((b) => (b.onclick = () => {
      const e = window.H_ERA_BY_KEY[b.dataset.era];
      focusYear((e.from + Math.min(e.to, MAX_Y)) / 2, Math.min(level + 1, LEVELS.length - 1));
    }));

    // keep the readout live as you scroll
    const sc = $('#tl-scroll');
    sc.addEventListener('scroll', () => {
      if (sc._raf) return;
      sc._raf = requestAnimationFrame(() => { sc._raf = 0; updateReadout(); });
    });

    // restore the anchor year at viewport center
    requestAnimationFrame(() => {
      if (sc && centerYear != null) sc.scrollLeft = xOf(centerYear) - sc.clientWidth / 2;
      updateReadout();
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
