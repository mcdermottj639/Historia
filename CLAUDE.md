# CLAUDE.md — Historia

Guidance for Claude (and humans) working on this repo. Read this first.

> ## ⚠️ Standing rule: keep this file current
> Whenever you change the architecture, data model, or add/remove a feature,
> **update the relevant section of this file in the SAME commit**. Future
> sessions rely on this file being accurate. When you bump `APP_VERSION`, also
> update the "Current version" line below.

## What this is

**Historia** is a personal history app for the owner (same owner as
[Sports-Hub](https://github.com/mcdermottj639/Sports-Hub) — read that repo's
CLAUDE.md for the house style). History made genuinely fun: a scrubbable
**Grand Timeline** of 5,000 years, cinematic tap-through **Stories**, era
guides and a figures gallery (**Learn**), chronology **Games**, and a daily
**Time Machine**, tied together by a Wisdom-XP/rank/day-streak progression.
It's a **pure static browser app** — HTML/CSS/vanilla JS, no build step, no
framework, no backend, no API keys — shipped via **GitHub Pages**, installable
as a PWA.

Live URL (once Pages is enabled): **https://mcdermottj639.github.io/Historia/**

## Hard constraints (do not break these)

- **No backend, no API keys, no build step.** Everything runs client-side from
  static files.
- **Deploys from `main`** via GitHub Pages (root). The owner adopted
  Sports-Hub's **ship-to-main-by-default** rule for this repo (chosen
  2026-07-15): when a change is complete and syntax-checks pass, fast-forward
  `main` and push so it goes live — don't stop at a feature branch, don't ask
  first. Hold back only if the owner says so or the change is knowingly broken.
- **Runtime data sources = keyless + CORS-friendly only** (Wikipedia/Wikimedia,
  OpenTDB). See "Data sources" below before adding any new source.
- **Facts are hand-checked.** Blurbs/stories are written in a storyteller
  voice, but dates and claims must be real; approximate dates carry
  `approx: 1` and render as "c.". Where legend diverges from the record
  (Et tu Brute, "for a man"), the content says so — that's part of the brand.
- **No model identifier** in commits, code, PRs, or any pushed artifact.
- Don't create PRs unless explicitly asked.

## Files

- `index.html` — single page, all tabs (Home · Timeline · Stories · Games ·
  Learn · About). Asset URLs carry `?v=N` cache-busting.
- `styles.css` — design system. **Dark "reading room" default** (oxblood
  `--brand`, antique-gold `--accent`, serif `--serif` = ui-serif/New York for
  headlines); **light "Editorial/Museum" theme** in a
  `:root[data-theme="light"]` block at the END of the file (same mechanism as
  Sports-Hub). New components must use the CSS vars so they theme for free.
- `data/eras.js` — `H_ERAS`: 9 eras with year ranges, colors, emoji, intros.
  Era of an event is always **derived from its year** (`H_ERA_OF_YEAR`).
- `data/events.js` — `H_EVENTS` (~436): the master event list
  `{id, y (neg = BCE), approx?, region, title, blurb, wiki?, fig?}`. **One
  dataset powers the timeline, Before/After, the Time Machine, era pages and
  future games** — grow this and everything gets richer.
- `data/figures.js` — `H_FIGURES` (~122): `{id, name, born, died, era, region,
  tag, facts[2], wiki}`. Powers the figures gallery + sheets (and the future
  Who Am I?).
- `data/stories.js` — `H_STORIES`: Story Mode narratives
  `{id, era, emoji, title, kicker, minutes, slides[{k?,t,body}], quiz[3],
  events[], figures[]}`.
- `core.js` — helpers (`$`, `el`, `esc`, seeded PRNG, `fmtYear`), localStorage
  wrappers, **Wisdom XP + ranks** (`addXP`, `rankFor`, `dayStreak`), toast,
  bottom sheets (`openEventSheet` — now with an async Wikipedia image banner —
  and `openFigureSheet`), and `fetchThumb(title)` (Wikipedia REST summary
  thumbnails for BOTH figures and events, one localStorage cache, silent
  fallback offline; `fetchPortrait(fig)` is a thin wrapper).
- `timeline.js` — the Grand Timeline, a **scrubber + event list** (v9; the
  earlier dot-strip and card-deck were too busy / too fiddly to tap). Top: a
  fixed **scrubber minimap** (`.tl-scrub`, positioned in %) — era bands + a dot
  per event + a translucent **window** (`.tl-win`) showing the slice in view;
  drag anywhere to travel, tap an era band to jump. Below: the events inside
  that window as big full-width **rows** (`.tl-row`: era dot · year · title ·
  chevron) — tap to open the sheet. **Wider/Closer** grow/shrink the window
  (`SPANS`, 60 years → whole span). Only the window box + list rebuild on
  scrub (the ~279-dot scrubber is built once). `window.Timeline.focusYear(y)`
  centres the window on a year (cross-tab API; no zoom levels).
- `story.js` — Story Mode player (fixed full-screen overlay, progress bars,
  tap right/left-third nav, 3-question quiz, XP payout; replays pay a token
  amount so it can't be farmed). `window.Story.renderShelf()/.open(id)`.
- `games.js` — Games hub + **⚖️ Before or After** (3 lives, streak scoring,
  year-gap difficulty ramp `gapFloor`, best in `historia:best.ba`) +
  **⏳ Timeline Sort** (tap 5 events earliest-first; per-round min-gap ramp
  `ROUND_GAP`, +20/pick, +50 perfect-round bonus, shared 3 lives, best in
  `historia:best.sort`). Roadmap tiles for Guess the Era / Who Am I? /
  Trivia Lab shown disabled — replace a tile with a real game when it lands.
- `learn.js` — era accordions (intro, people chips, event rows) + figures
  gallery with async portrait fill-in.
- `otd.js` — 📅 On This Day (Home section): Wikimedia Feed API `selected`
  anniversaries, trimmed + cached per calendar day (`historia:otd`), seeded
  daily pick of 5, tap → sheet with image/extract/link. The section hides
  itself entirely when offline with no cache. NOTE: unverifiable from the
  sandbox (network blocked) — behavior confirmed on device only.
- `app.js` — `APP_VERSION`, tab router, theme wiring, **Home** (hero stats,
  rank bar, seeded daily **Time Machine** + featured story), About, SW
  registration. Loaded LAST; data → core → modules → app is the script order.
- `sw.js` — network-first auto-update service worker, versioned `CACHE`
  (`historia-vN`) purged on activate — bump with `APP_VERSION`.
- `manifest.webmanifest`, `icon-192/512.png`, `apple-touch-icon.png`,
  `favicon.png` — PWA. Icons are the 📜 emoji (NotoColorEmoji) on a leather
  gradient, generated by a one-off script (not in repo).
- `PLAN.md` — the vision + roadmap. Keep it honest about what's shipped vs next.

## Release / versioning ritual (EVERY change)

1. Bump `APP_VERSION` in `app.js` (v1 → v2 …).
2. Bump the matching `?v=N` on ALL assets in `index.html` (styles, data/*,
   core, modules, app) and `CACHE` in `sw.js`.
3. `node --check` every touched JS file (no test suite; syntax is the gate).
4. **Verify in the browser** — this sandbox has Chromium + Playwright
   (`executablePath: '/opt/pw-browsers/chromium'`); serve with
   `python3 -m http.server` and screenshot the touched surfaces at
   390×844 before shipping. Check BOTH themes for new components.
5. Commit, push `main` (fast-forward from the session branch), keep the
   session branch pushed too.
6. The version shows in the header badge so the owner can confirm on device.

Current version as of this writing: **v9**.

- **v9** — Grand Timeline reworked from the v5 card deck to a **scrubber +
  event list** (owner preferred it): the same draggable era/event minimap on
  top, now with a translucent window, feeding a calm vertical list of big
  full-width event rows below. Easier to read and to tap than the swipe deck;
  Wider/Closer resize the window.
- **v8** — 🗽 The Great Backfill, Wave 4 (1750–1914 dense pass): +81 events
  (436 total) and +26 figures (122 total — the 120 figure goal is met). A dense
  US thread (Revolution deep cuts, the early republic, the antebellum slavery
  crisis, the Civil War, Reconstruction's 13th–15th Amendments, the Plains
  Wars, the Gilded Age) balanced by Latin American independence (Bolívar, San
  Martín, Toussaint, Hidalgo, Ayacucho, Ipiranga, Juárez, Brazil's Golden Law),
  19th-c Asia (Opium Wars, Taiping, Perry, the Meiji Restoration, the Satsuma
  rebellion, Tsushima, the Sepoy Rebellion, the Raj) and 19th-c Africa + the
  industrial world (Muhammad Ali, Shaka's Zulu, Isandlwana, the Berlin
  Conference, Khartoum, Leopold's Congo, Adwa, the Irish Famine, Marx, Pasteur,
  Mendeleev). Age of Revolutions 21→56 events, Industrial Age 15→61. New figures
  include Jefferson, Douglass, Sojourner Truth, Sacagawea, Sitting Bull, Ida B.
  Wells, Bolívar, Rani Lakshmibai, Cixi, Menelik II and Florence Nightingale.
  (Authored as v7 in parallel with a Story Mode layout fix; ships as v8 on top.)
- **v7** — Story Mode slide layout fix: content slides now **vertically center**
  their kicker/title/body instead of pinning them to the bottom, which left a
  large dead gap in the middle of every non-intro slide. The intro slide keeps
  its deliberate title-card split (emoji top, headline bottom) via a new
  `.story-slide.intro` class; the empty `.sl-emoji` div is no longer emitted on
  content slides.
- **v6** — ⛵ The Great Backfill, Wave 3 (1400–1800 depth): +76 events
  (355 total) and +24 figures (96 total). Renaissance/Reformation/Scientific
  Revolution (Medici, Machiavelli, Vesalius, Kepler, Descartes), Ottomans/
  Safavids/Mughals (Suleiman, Mohács, both Sieges of Vienna, Shah Abbas, Babur,
  Akbar, the Taj Mahal), Ming/Qing China + Japan/Korea (Zheng He, the Forbidden
  City, Hangul, Nobunaga, Sekigahara, sakoku, Kangxi, the 47 Ronin), the age of
  exploration + Columbian exchange + Atlantic slave trade told honestly (Kongo's
  Afonso, the Middle Passage, Potosí, La Malinche, Metacom, Equiano, Penn's
  Philadelphia) and the Enlightenment (Locke, Voltaire, Rousseau, Montesquieu,
  Adam Smith, Émilie du Châtelet). Renaissance era 18→57 events, Early Modern
  9→43. (This wave was authored as v5 in parallel with the timeline rebuild;
  it ships as v6 on top of it.)
- **v5** — Grand Timeline rebuilt as a **scrubber + swipeable card deck**: a
  draggable era/event minimap on top synced to a deck of big cinematic event
  cards below. Replaces the old horizontal zoom-and-cluster strip, which was
  visually busy and hard to tap precisely on a phone. Every event is now a
  full-width tap target; the "+N" clusters and px/year zoom levels are gone.
- **v4** — 🏰 The Great Backfill, Wave 2 (Middle Ages worldwide): +73 events
  (279 total) and +21 figures (72 total). Byzantium & the Islamic Golden Age
  (Hagia Sophia, Baghdad, al-Khwarizmi, Ibn Sina, Saladin, the Mongol sack of
  Baghdad), Tang/Song China + Japan/Korea/Khmer (Wu Zetian, Murasaki's Genji,
  Angkor Wat, the kamikaze, movable type), medieval Africa (Aksum, Ghana, Mali/
  Sundiata, Great Zimbabwe, Kilwa, Timbuktu, Songhai), Europe & the Vikings
  (Justinian, Kievan Rus, Canossa, universities, Gothic, Aquinas, Crécy,
  Chaucer) and the medieval Americas + Pacific (Tikal, Cahokia, Chan Chan,
  Machu Picchu, plus real Oceania weight: Polynesian voyaging, Rapa Nui moai,
  Māori, Tuʻi Tonga). Middle Ages era jumps from 14 to 79 events.
- **v3** — 🏛️ The Great Backfill, Wave 1 (Ancient World depth): +65 events
  (206 total) and +22 figures (51 total) across Mesopotamia, Egypt & Nubia/Kush,
  Persia, India (Indus→Maurya→Gupta), China (Shang→Han) and the early Americas
  (Caral, Olmec, Chavín, Maya, Nazca), plus Greece/Rome deep cuts. Ancient era
  jumps from ~24 to 88 events / 27 figures. Global, gender-balanced (Enheduanna,
  Hatshepsut, Amanirenas, Ban Zhao, Hypatia), every circa date flagged `approx`.
- **v2** — ⏳ Timeline Sort game; 📅 On This Day on Home (first live
  Wikimedia Feed integration); event images in timeline sheets (generalized
  `fetchThumb`); third story: "The Night the Wall Fell by Accident" (Berlin,
  Nov 9 1989).
- **v1** — first shipped increment: Grand Timeline, Story Mode with 2 stories,
  Before/After, Learn, Time Machine home, XP/ranks, PWA/offline, both themes.

## Data sources — what works client-side

- ✅ **Wikipedia REST** `en.wikipedia.org/api/rest_v1/page/summary/{title}` —
  CORS `*`, keyless. Used for figure portraits (thumbnails). Also good for
  event images later.
- ✅ **Wikimedia Feed API**
  `api.wikimedia.org/feed/v1/wikipedia/en/onthisday/{type}/{MM}/{DD}` — CORS
  `*`, keyless. Wired in v2 (`otd.js`, type `selected`).
- ✅ **OpenTDB** (`category=23` History, 22 Geography, 20 Mythology) — proven
  in production in Sports-Hub's Trivia Lab; 1 req/5s rate limit; CC BY-SA
  attribution required. NOT yet wired — comes with the Trivia Lab port.
- ❌ **RapidAPI history APIs / API Ninjas** (owner asked 2026-07-15): all
  require an API key in every request — a key in static JS is public and the
  quota gets stolen. Same wall as Sports-Hub's API-Sports. Usable only as
  **authoring-time** references for curating bundled data.
- ⚠️ **World Historical Gazetteer / Wikidata SPARQL** — authoring-time tools
  (geocoding events for the future map view), never runtime.
- General rule: hand-authored bundled data is the backbone; live APIs are
  garnish (freshness, images, bonus volume).

## Testing reality

- The sandbox's network policy **blocks outbound calls** to opentdb.com /
  wikipedia.org (CONNECT 403 at the proxy gateway) — live API behavior must be
  verified on the owner's device. Code defensively: every fetch has an abort
  timeout and a silent fallback (portraits → monogram tiles).
- Local **Playwright + Chromium IS available** (unlike the old Sports-Hub
  sandbox) — use it every release (see ritual step 4).

## localStorage keys (all per browser/device)

- `historia:xp` — lifetime Wisdom (number). Ranks derive from it (`RANKS`).
- `historia:days` — `{date: true}` map of activity days → day streak.
- `historia:stories` — `{storyId: {done, best}}`.
- `historia:best` — per-game best scores (`ba`, …).
- `historia:portraits` — `{wikiTitle: thumbUrl | 0}` cache (figures + events).
- `historia:otd` — `{mmdd, items}` — today's On This Day picks, one day kept.
- `historia:theme` — `'light' | 'dark'`; absent = follow OS.

## GitHub Pages gotcha

Pages must be enabled manually once (Settings → Pages → Deploy from branch →
`main` / root). A bot cannot do it. If the URL 404s, that's the first check.

## Style of work the owner expects

- **Visuals, stories and fun first** — the owner explicitly doesn't want a
  quiz app with notes attached; they want to be shown the light. Big serif
  headlines, era colors, cinematic moments. No walls of text.
- Be honest about platform limits (CORS, keys, offline) — say what can't work
  and why, in About and in this file.
- Ship small verifiable increments; bump the version; the owner verifies on
  iPhone (Safari + home-screen PWA).
- Content quality bar: deep-cut, storyteller-voiced, fact-checked. When
  adding events/figures/stories, keep the one-vivid-sentence blurb style.

## Roadmap (see PLAN.md for detail)

Next up, in rough order: **Trivia Lab port** with history categories +
OpenTDB blend · **Guess the Era** & **Who Am I?** · more stories (goal: 10+) ·
**SVG map view** (authoring-time geocoding) · per-era mastery ·
`historia:otd` cache pruning if it ever grows beyond one day's entry.
