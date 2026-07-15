'use strict';
/* Historia — the Grand Timeline. A two-part instrument for travelling 5,000
 * years without the old "wall of tiny dots" problem:
 *
 *  1. SCRUBBER (top) — a fixed minimap of the whole span: colored era bands, a
 *     dot for every event, and a playhead marking where you are. Drag it (or
 *     tap an era) to leap anywhere instantly; it's the map.
 *  2. CARD DECK (below) — every event as a big, cinematic, swipeable card
 *     (year · title · one-sentence blurb). Full-width tap targets, snap
 *     scrolling, momentum on iOS; it's the detail.
 *
 * The two stay in sync: dragging the scrubber snaps the deck to that year;
 * swiping the deck slides the playhead and updates the "you are here" readout.
 * window.Timeline.focusYear(y) is the cross-tab API (Home/Stories deep-links). */

(function () {
  const MIN_Y = -3200, MAX_Y = 2040;
  const pct = (y) => Math.max(0, Math.min(100, ((y - MIN_Y) / (MAX_Y - MIN_Y)) * 100));
  const evs = () => [...window.H_EVENTS].sort((a, b) => a.y - b.y);
  const nearestTo = (y, list) => list.reduce((b, e) => Math.abs(e.y - y) < Math.abs(b.y - y) ? e : b, list[0]);

  let raf = 0;

  function setReadout(year) {
    const era = window.H_ERA_OF_YEAR(Math.round(year));
    const now = $('#tl-now');
    if (now) now.innerHTML = `<span class="tl-now-d" style="background:${era.color}"></span>${era.emoji} ${esc(era.label)} · <b>${fmtYear(Math.round(year))}</b>`;
    const play = $('#tl-play');
    if (play) play.style.left = pct(year) + '%';
  }

  function centeredCard() {
    const track = $('#tl-track'); if (!track) return null;
    const mid = track.scrollLeft + track.clientWidth / 2;
    let best = null, bd = Infinity;
    for (const el of $$('#tl-track .tl-card')) {
      const cx = el.offsetLeft + el.offsetWidth / 2;
      const d = Math.abs(cx - mid);
      if (d < bd) { bd = d; best = el; }
    }
    return best;
  }
  function centerCard(el, behavior) {
    const track = $('#tl-track'); if (!track || !el) return;
    const left = el.offsetLeft - (track.clientWidth - el.offsetWidth) / 2;
    track.scrollTo({ left, behavior: behavior || 'auto' });
  }
  function scrollToYear(y, behavior) {
    const el = $(`#tl-track .tl-card[data-y="${nearestTo(y, evs()).y}"]`);
    centerCard(el, behavior);
  }

  function render(centerYear) {
    const host = $('#timeline-host'); if (!host) return;
    const list = evs();

    const bands = window.H_ERAS.map((e) => {
      const l = pct(Math.max(e.from, MIN_Y)), r = pct(Math.min(e.to, MAX_Y));
      return `<button class="tl-band" data-jump="${e.k}" style="left:${l}%;width:${r - l}%;background:${e.color}" title="${esc(e.label)}"></button>`;
    }).join('');
    const dots = list.map((e) => `<span class="tl-sdot" style="left:${pct(e.y)}%;background:${window.H_ERA_OF_YEAR(e.y).color}"></span>`).join('');

    const cards = list.map((e) => {
      const er = window.H_ERA_OF_YEAR(e.y);
      return `<button class="tl-card" data-ev="${e.id}" data-y="${e.y}" style="--ec:${er.color}">
        <span class="tl-card-era"><span class="tl-now-d" style="background:${er.color}"></span>${er.emoji} ${esc(er.label)}</span>
        <span class="tl-card-year">${fmtYear(e.y, e.approx)}</span>
        <span class="tl-card-title">${esc(e.title)}</span>
        <span class="tl-card-blurb">${esc(e.blurb || '')}</span>
        <span class="tl-card-more">Open ›</span>
      </button>`;
    }).join('');

    host.innerHTML = `
      <div class="tl-head">
        <span class="tl-now" id="tl-now"></span>
        <span class="tl-nav">
          <button class="btn tl-navbtn" id="tl-prev" aria-label="Previous event">‹</button>
          <button class="btn tl-navbtn" id="tl-next" aria-label="Next event">›</button>
        </span>
      </div>
      <div class="tl-scrub" id="tl-scrub" title="Drag to travel">
        ${bands}${dots}
        <div class="tl-play" id="tl-play"></div>
      </div>
      <p class="tl-hint">Drag the bar to travel 5,000 years · swipe the cards · tap a card to open it. ${window.H_EVENTS.length} events and counting.</p>
      <div class="tl-track" id="tl-track">${cards}</div>`;

    // open an event
    $$('#timeline-host .tl-card').forEach((b) => (b.onclick = () => openEventSheet(window.H_EVENTS.find((e) => e.id === b.dataset.ev))));
    // era band → jump to that era's first event
    $$('#timeline-host .tl-band').forEach((b) => (b.onclick = () => {
      const era = window.H_ERA_BY_KEY[b.dataset.jump];
      const first = list.find((e) => e.y >= era.from) || list[list.length - 1];
      centerCard($(`#tl-track .tl-card[data-y="${first.y}"]`), 'smooth');
    }));
    // prev / next (desktop-friendly)
    const step = (dir) => {
      const cur = centeredCard(); if (!cur) return;
      const sib = dir < 0 ? cur.previousElementSibling : cur.nextElementSibling;
      if (sib && sib.classList.contains('tl-card')) centerCard(sib, 'smooth');
    };
    $('#tl-prev').onclick = () => step(-1);
    $('#tl-next').onclick = () => step(1);

    // deck scroll → move playhead + readout
    const track = $('#tl-track');
    track.addEventListener('scroll', () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = 0; const c = centeredCard(); if (c) setReadout(+c.dataset.y); });
    });

    // scrubber drag → snap the deck to that year
    const scrub = $('#tl-scrub');
    const yearAt = (clientX) => {
      const r = scrub.getBoundingClientRect();
      const f = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
      return MIN_Y + f * (MAX_Y - MIN_Y);
    };
    let dragging = false;
    const drag = (x) => { const y = yearAt(x); setReadout(y); scrollToYear(y, 'auto'); };
    scrub.addEventListener('pointerdown', (e) => {
      // let taps on an era band do their jump; bare-track drags scrub
      dragging = true; scrub.setPointerCapture(e.pointerId);
      if (!e.target.classList.contains('tl-band')) drag(e.clientX);
    });
    scrub.addEventListener('pointermove', (e) => { if (dragging) drag(e.clientX); });
    scrub.addEventListener('pointerup', () => { dragging = false; });
    scrub.addEventListener('pointercancel', () => { dragging = false; });

    // land on the anchor year
    requestAnimationFrame(() => {
      scrollToYear(centerYear != null ? centerYear : 1969, 'auto');
      setReadout(centerYear != null ? centerYear : 1969);
    });
  }

  window.Timeline = {
    render: () => render(1969),
    focusYear: (y) => { render(y); },
  };
})();
