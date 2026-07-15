'use strict';
/* Historia — the Grand Timeline. A map + list, built so it's easy to read and
 * easy to tap on a phone (the old dot-strip was neither):
 *
 *  1. SCRUBBER (top) — a fixed minimap of the whole 5,000 years: colored era
 *     bands, a dot for every event, and a translucent WINDOW showing the slice
 *     you're viewing. Drag anywhere on it to travel; tap an era to jump.
 *  2. EVENT LIST (below) — the events inside that window as big full-width
 *     rows (year · title · era dot). Tap a row to open it. "Wider / Closer"
 *     grows or shrinks the window (60 years → the whole span).
 *
 * window.Timeline.focusYear(y) centres the window on a year (Home/Stories
 * deep-links). One dataset (H_EVENTS) drives it, so the backfill just shows up. */

(function () {
  const MIN_Y = -3200, MAX_Y = 2040;
  const SPANS = [60, 150, 400, 1000, MAX_Y - MIN_Y]; // window widths in years
  let center = 1950, spanIdx = 0;

  const pct = (y) => Math.max(0, Math.min(100, ((y - MIN_Y) / (MAX_Y - MIN_Y)) * 100));
  const clampCenter = (c, span) => Math.max(MIN_Y + span / 2, Math.min(MAX_Y - span / 2, c));
  const sorted = () => [...window.H_EVENTS].sort((a, b) => a.y - b.y);

  function bounds() {
    const span = SPANS[spanIdx];
    center = clampCenter(center, span);
    return { start: Math.round(center - span / 2), end: Math.round(center + span / 2), span };
  }

  // rebuild only the parts that change as you scrub (cheap): readout, window
  // box, span buttons and the list. The 279-dot scrubber is built once.
  function refresh() {
    const { start, end } = bounds();
    const era = window.H_ERA_OF_YEAR(Math.round(center));
    const inWin = sorted().filter((e) => e.y >= start && e.y <= end);

    const now = $('#tl-now');
    if (now) now.innerHTML = `<span class="tl-now-d" style="background:${era.color}"></span>${era.emoji} ${esc(era.label)}`;
    const range = $('#tl-range');
    if (range) range.textContent = `${fmtYear(start)} – ${fmtYear(end)}`;

    const win = $('#tl-win');
    if (win) { win.style.left = pct(start) + '%'; win.style.width = (pct(end) - pct(start)) + '%'; }

    const wider = $('#tl-wider'), closer = $('#tl-closer');
    if (wider) wider.disabled = spanIdx === SPANS.length - 1;
    if (closer) closer.disabled = spanIdx === 0;

    const list = $('#tl-list');
    if (list) {
      list.innerHTML = inWin.length
        ? inWin.map((e) => {
            const er = window.H_ERA_OF_YEAR(e.y);
            return `<button class="tl-row" data-ev="${e.id}">
              <span class="tl-row-dot" style="background:${er.color}"></span>
              <span class="tl-row-year">${fmtYear(e.y, e.approx)}</span>
              <span class="tl-row-title">${esc(e.title)}</span>
              <span class="tl-row-chev">›</span>
            </button>`;
          }).join('')
        : `<p class="tl-empty">No events in this ${end - start}-year window — tap <b>Wider</b> to zoom out.</p>`;
      $$('#tl-list [data-ev]').forEach((b) => (b.onclick = () => openEventSheet(window.H_EVENTS.find((e) => e.id === b.dataset.ev))));
    }
  }

  function render() {
    const host = $('#timeline-host'); if (!host) return;
    const list = sorted();

    const bands = window.H_ERAS.map((e) => {
      const l = pct(Math.max(e.from, MIN_Y)), r = pct(Math.min(e.to, MAX_Y));
      return `<button class="tl-band" data-jump="${e.k}" style="left:${l}%;width:${r - l}%;background:${e.color}" title="${esc(e.label)}"></button>`;
    }).join('');
    const dots = list.map((e) => `<span class="tl-sdot" style="left:${pct(e.y)}%;background:${window.H_ERA_OF_YEAR(e.y).color}"></span>`).join('');

    host.innerHTML = `
      <div class="tl-head">
        <span class="tl-now" id="tl-now"></span>
        <span class="tl-range" id="tl-range"></span>
        <span class="tl-span">
          <button class="btn tl-spanbtn" id="tl-wider">Wider</button>
          <button class="btn tl-spanbtn" id="tl-closer">Closer</button>
        </span>
      </div>
      <div class="tl-scrub" id="tl-scrub" title="Drag to travel">
        ${bands}${dots}
        <div class="tl-win" id="tl-win"></div>
      </div>
      <p class="tl-hint">Drag the bar to travel 5,000 years · tap an event to open it. ${window.H_EVENTS.length} events and counting.</p>
      <div class="tl-list" id="tl-list"></div>`;

    $('#tl-wider').onclick = () => { if (spanIdx < SPANS.length - 1) { spanIdx++; refresh(); } };
    $('#tl-closer').onclick = () => { if (spanIdx > 0) { spanIdx--; refresh(); } };
    $$('#timeline-host .tl-band').forEach((b) => (b.onclick = (ev) => {
      ev.stopPropagation();
      const era = window.H_ERA_BY_KEY[b.dataset.jump];
      center = (era.from + Math.min(era.to, MAX_Y)) / 2; refresh();
    }));

    const scrub = $('#tl-scrub');
    const yearAt = (clientX) => {
      const r = scrub.getBoundingClientRect();
      const f = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
      return MIN_Y + f * (MAX_Y - MIN_Y);
    };
    let dragging = false;
    const move = (x) => { center = clampCenter(yearAt(x), SPANS[spanIdx]); refresh(); };
    scrub.addEventListener('pointerdown', (e) => {
      dragging = true; scrub.setPointerCapture(e.pointerId);
      if (!e.target.classList.contains('tl-band')) move(e.clientX);
    });
    scrub.addEventListener('pointermove', (e) => { if (dragging) move(e.clientX); });
    scrub.addEventListener('pointerup', () => { dragging = false; });
    scrub.addEventListener('pointercancel', () => { dragging = false; });

    refresh();
  }

  window.Timeline = {
    render: () => { center = 1950; spanIdx = 0; render(); },
    focusYear: (y) => { center = y; render(); },
  };
})();
