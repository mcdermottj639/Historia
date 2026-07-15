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
- `data/events.js` — `H_EVENTS` (~141): the master event list
  `{id, y (neg = BCE), approx?, region, title, blurb, wiki?, fig?}`. **One
  dataset powers the timeline, Before/After, the Time Machine, era pages and
  future games** — grow this and everything gets richer.
- `data/figures.js` — `H_FIGURES` (~28): `{id, name, born, died, era, region,
  tag, facts[2], wiki}`. Powers the figures gallery + sheets (and the future
  Who Am I?).
- `data/stories.js` — `H_STORIES`: Story Mode narratives
  `{id, era, emoji, title, kicker, minutes, slides[{k?,t,body}], quiz[3],
  events[], figures[]}`.
- `core.js` — helpers (`$`, `el`, `esc`, seeded PRNG, `fmtYear`), localStorage
  wrappers, **Wisdom XP + ranks** (`addXP`, `rankFor`, `dayStreak`), toast,
  bottom sheets (`openEventSheet`, `openFigureSheet`), and `fetchPortrait`
  (Wikipedia REST summary thumbnails, cached in localStorage, silent monogram
  fallback offline).
- `timeline.js` — the Grand Timeline. Native horizontal scroll (free iOS
  momentum); zoom presets `LEVELS` = px/year each with a **marker mode**
  (`dot` → `year` → `full` labels as you zoom); events group into fixed-width
  buckets → "+N" cluster pills that zoom in on tap; era bands are clickable.
  `window.Timeline.focusYear(y, level)` is the cross-tab API.
- `story.js` — Story Mode player (fixed full-screen overlay, progress bars,
  tap right/left-third nav, 3-question quiz, XP payout; replays pay a token
  amount so it can't be farmed). `window.Story.renderShelf()/.open(id)`.
- `games.js` — Games hub + **⚖️ Before or After** (3 lives, streak scoring,
  year-gap difficulty ramp `gapFloor`, best in `historia:best.ba`). Roadmap
  tiles for Timeline Sort / Guess the Era / Who Am I? / Trivia Lab are shown
  disabled — replace a tile with a real game when it lands.
- `learn.js` — era accordions (intro, people chips, event rows) + figures
  gallery with async portrait fill-in.
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

Current version as of this writing: **v1** (first shipped increment: Grand
Timeline, Story Mode with 2 stories, Before/After, Learn, Time Machine home,
XP/ranks, PWA/offline, both themes).

## Data sources — what works client-side

- ✅ **Wikipedia REST** `en.wikipedia.org/api/rest_v1/page/summary/{title}` —
  CORS `*`, keyless. Used for figure portraits (thumbnails). Also good for
  event images later.
- ✅ **Wikimedia Feed API**
  `api.wikimedia.org/feed/v1/wikipedia/en/onthisday/{type}/{MM}/{DD}` — CORS
  `*`, keyless. NOT yet wired — planned for the Home "On This Day" card.
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
- `historia:portraits` — `{wikiTitle: thumbUrl | 0}` cache.
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

Next up, in rough order: **Timeline Sort** game · **On This Day** on Home
(Feed API) · **Trivia Lab port** with history categories + OpenTDB blend ·
**Guess the Era** & **Who Am I?** · more stories (goal: 10+) · event images in
sheets (REST summaries) · **SVG map view** (authoring-time geocoding) ·
per-era mastery.
