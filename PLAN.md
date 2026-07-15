# Historia — Architecture Proposal & Build Plan

> Working name: **Historia** (this repo's name — see "Naming" below). A standalone
> history learning + trivia + games PWA, sibling to Sports-Hub, sharing its
> philosophy: pure static HTML/CSS/vanilla JS, no build step, no backend, no API
> keys, GitHub Pages deploy, dark-default + light "editorial" theme, mobile-first.

Status: **proposal only — nothing built yet.** This doc is the contract for what
gets built and in what order. When Phase 0 ships, a proper `CLAUDE.md` gets
created from the decisions here (with Sports-Hub's "keep this file current"
standing rule).

---

## 1. Naming

The repo is already called **Historia**, and it's honestly a better name than
"History Hub" — one word, installs cleanly on a home screen, and it's the
original Greek/Latin word for "inquiry / learning by investigation," which is
exactly the app's thesis. Alternatives if the owner wants options:

- **Historia** ← recommended (already the repo, already the Pages URL)
- Epochs / Eras — era-browsing flavor
- Chronicle — editorial flavor
- Timeline Lab — matches "Trivia Lab" naming lineage
- History Hub — matches "Sports-Hub" naming lineage (but two-word PWA names
  truncate on iOS home screens; "Sports-Hub" already lives with this)

Decision needed from owner; everything below says "Historia."

## 2. Own repo vs. subfolder — OWN REPO (this one)

Recommendation: **standalone repo (this one), its own GitHub Pages site.**

- **PWA scoping is the technical clincher.** A PWA's identity = manifest URL +
  service-worker scope. Two apps in one repo would fight over SW scope and
  cache, and iOS "Add to Home Screen" treats them as one app. Separate repo →
  clean `https://mcdermottj639.github.io/Historia/` scope, own icon, own
  offline cache, own version badge.
- Sports-Hub's repo already carries a live backend + labs; mixing a second
  full app in would bloat both CLAUDE.md contexts.
- Cost of separation is near zero: we copy the proven patterns (theme CSS
  variables, SW, seeded PRNG, quiz engine) once, then they diverge freely.

## 3. File layout

Flat like Sports-Hub, but with **data split from logic** — history content will
be several times larger than the sports Q bank, and hand-editing a 200-line
`events.js` beats scrolling a 5,000-line `app.js`.

```
Historia/
  index.html            single page, all tabs; ?v=N cache-busting on assets
  styles.css            ported CSS-variable system: dark default + light
                        editorial theme in :root[data-theme="light"] block
  app.js                boot, tab router, theme toggle, shared helpers
                        ($, el, esc, seeded PRNG, fetchJSON w/ TTL cache),
                        APP_VERSION, daily-challenge rotation, progress store
  trivia.js             quiz engine (ported from Sports-Hub trivia.js)
  games.js              Timeline Sort, Higher/Lower, Guess the Era, Who Am I
  timeline.js           interactive visual timeline (Phase 2)
  learn.js              era browser + explainer cards + figure cards
  data/
    questions.js        window.H_QUESTIONS — curated trivia bank {q,a,w,c,d,ex,topic}
    events.js           window.H_EVENTS   — dated events (fuels timeline + 3 games)
    figures.js          window.H_FIGURES  — people (fuels Who Am I + portrait cards)
    explainers.js       window.H_EXPLAINERS — learning cards, keyed by topic id
  sw.js                 network-first auto-update SW, versioned cache (ported)
  manifest.webmanifest  + icons (192/512/apple-touch/favicon)
  CLAUDE.md             created in Phase 0
  PLAN.md               this file
```

- Data files are **plain `<script>` globals, not fetched JSON** — no CORS/
  file:// issues, works offline for free, keeps the no-build rule.
- **One event dataset powers everything visual and 3 of the games.** This is
  the core architectural bet: hand-author `events.js` once
  (`{id, year, month?, day?, era, region, tags[], title, blurb, figureIds[],
  topicId, img?}`) and it feeds the scrubable timeline, Timeline Sort,
  Higher/Lower, Guess the Era, and "On This Day" fallbacks. Same for
  `figures.js` → Who Am I + portrait cards. Content written once, surfaced
  five ways.
- **Cross-linking contract:** every question's `topic` and every event's
  `topicId` point at an explainer id, so a trivia miss renders "📚 Learn why"
  → opens the explainer. Misses become study prompts — the loop the owner
  asked for.

### Tabs (single page, Sports-Hub-style tab bar)

🏠 **Home** (daily challenge card + On This Day + stats strip) · 📚 **Learn**
(eras → explainers → figures) · 🕰️ **Timeline** (Phase 2) · 🎮 **Games** ·
🧠 **Trivia** · 📈 **Progress** · ℹ️ **About**

### Conventions carried over from Sports-Hub

- `APP_VERSION` badge + bump `?v=N` + SW `CACHE` version on every change;
  `node --check` as the gate; ship small increments the owner verifies on
  iPhone.
- localStorage namespace `historia:*` (e.g. `historia:life`, `historia:best`,
  `historia:daily`, `historia:mastery`, `historia:theme`, `historia:otdb:23`).
  Per-device, same caveat as Sports-Hub.
- `esc()` every externally-sourced string before `innerHTML`. Accordions,
  wrapping jump-nav chips, 44px touch targets, ARIA tablist.

## 4. Trivia design (the seed feature)

Port the engine nearly verbatim (seeded daily PRNG, streak multipliers 1.5×@3 /
2×@5, difficulty points, endless free play + Finish&save, miss review, per-key
bests). Changes:

- **Categories** (curated bank, ~120 questions at MVP, growing):
  - 🏛️ Ancient World (Egypt, Greece, Rome, Mesopotamia)
  - 🏰 Middle Ages & Empires
  - 🧭 Explorers & Discovery
  - 🇺🇸 US History (colonial → 1900)
  - 🎩 Presidents
  - ⚔️ World Wars
  - ✊ Civil Rights & Movements
  - 💡 Inventions & Science
  - 🔔 Philadelphia & the Revolution — the "Eagles category" equivalent:
    owner's-city deep cuts (Franklin, Independence Hall, 1793 yellow fever,
    Constitutional Convention). Optional — confirm with owner.
- Same difficulty philosophy: `d:2` HARD / `d:3` ELITE, deep-cut. ("Who was
  the only president to serve two non-consecutive terms" is the FLOOR, not the
  ceiling.)
- **Daily Challenge 2.0:** seeded 10-question set, but 2 of the 10 slots rotate
  in non-trivia formats (a Higher/Lower and a Timeline-sort mini) once Phase 3
  lands — one shared day-streak.
- 🌍 OpenTDB blend: History (23) as the live garnish, exactly like the sports
  blend — cached harvest, tagged 🌍, never in the seeded Daily. Also Geography
  (22) and Mythology (20) as their own "Beyond the bank" tiles.

## 5. Games (beyond trivia)

All driven by `events.js` / `figures.js` — no new content authoring per game.

1. **⏳ Timeline Sort** — deal 4–6 event cards, tap-to-reorder into
   chronological order (tap-swap first — drag is fussy on iOS Safari; drag can
   come later). Score by inversions fixed; streaks for perfect sorts.
2. **⚖️ Before or After (Higher/Lower)** — "Fall of Constantinople vs.
   Gutenberg's press — which came first?" Endless run, one life, high score.
   Cheap to build, weirdly addictive, teaches relative chronology.
3. **🔮 Guess the Era** — show an event blurb (later: an image) with names/dates
   stripped → pick the decade/era from 4 choices. Uses `tags` to avoid
   giveaway text.
4. **🎭 Who Am I?** — progressive clues from `figures.js` (3–5 clues, obscure →
   obvious; earlier guess = more points), free-text-free: 4 portrait/name
   choices appear after clue 2.
5. **🗓️ Daily rotation** — the Home daily card rotates game type by date seed
   (Mon trivia, Tue sort, … or seeded-random); all feed one day-streak.

## 6. Learning layer

- **Explainers**: ~1 short card per topic (150–250 words, 3–5 "why it matters"
  bullets + 3 key dates + linked figures). Hand-written, extractive style.
  MVP: 12 topics (one per era/category), growing alongside the Q bank.
- **Era browser**: Learn tab groups explainers by era band (Ancient → Medieval
  → Early Modern → Revolutionary → Industrial → Modern → Contemporary), each
  era an accordion with its events + figures + explainers.
- **Figure cards**: name, life dates, one-line "why they matter", 2–3 fun
  facts; portrait fetched at runtime from Wikipedia REST summary (thumbnail)
  with graceful no-image fallback (era-colored monogram tile). Cached via
  fetchJSON TTL + SW.
- **Read more →** links to the Wikipedia article (opens externally). We never
  scrape article bodies — summaries only, via the REST API.

## 7. Data sources — what's real vs. what needs a server

⚠️ Honesty note: this sandbox's network policy blocks outbound calls to these
hosts (CONNECT 403 at the gateway — verified against opentdb.com and
en.wikipedia.org on 2026-07-15), so none of this was live-tested from here.
Confidence below comes from (a) OpenTDB already shipping in Sports-Hub's
trivia lab in production, and (b) Wikimedia's documented CORS policy. Phase 1
ships each integration behind the same defensive fallbacks as Sports-Hub, and
the owner verifies on device.

### ✅ Usable client-side (high confidence)

| Source | What | Why confident |
|---|---|---|
| **OpenTDB** `opentdb.com/api.php?category=23` | ~300 casual history MCQs; also 22 Geography, 20 Mythology, 24 Politics | **Proven in production** — Sports-Hub's trivia lab already reads OpenTDB browser-direct (`Access-Control-Allow-Origin: *`), History 23 is literally already wired as a "Beyond sports" tile there. Same 1-req/5s rate limit, same harvest/cache pattern ports over. CC BY-SA attribution required. |
| **Wikipedia REST** `en.wikipedia.org/api/rest_v1/page/summary/{title}` | Title → extract, description, thumbnail URL, canonical link | Wikimedia serves anonymous API requests with `ACAO: *` (documented CORS policy; the API's own docs advertise client-side use). Powers figure portraits + "read more" summaries. |
| **Wikimedia Feed API** `api.wikimedia.org/feed/v1/wikipedia/en/onthisday/{all\|events\|births\|deaths}/{MM}/{DD}` | "On This Day" — dated events with linked article summaries + thumbnails | Same Wikimedia CORS policy; purpose-built public feed. Powers the Home "📅 On This Day" card AND a generated quiz mode ("What year did X happen?" with year distractors — the history version of Sports IQ). |
| **`upload.wikimedia.org`** images | Portraits/photos in `<img>` tags | Plain image loads don't need CORS at all; Wikimedia sends `ACAO: *` anyway. Hotlinking is permitted; attribution/licensing shown via the linked article. |
| **MediaWiki Action API** `en.wikipedia.org/w/api.php?origin=*` | Search, extracts, geosearch | CORS works for anonymous requests when `origin=*` is passed — documented MediaWiki behavior. Nice-to-have (search box in Learn tab), not MVP. |

### ⚠️ Usable with caveats

- **Wikidata SPARQL** (`query.wikidata.org`) — sends CORS `*` but slow, strict
  rate limits, complex. Use as an **authoring-time tool only** (me generating
  candidate event/figure lists to hand-curate into `data/*.js`), never at
  runtime.
- **Map tiles (OSM/Leaflet)** — technically key-free, but OSM's tile usage
  policy is for light use, tiles break offline, and it's our first external JS
  dependency. **Recommendation: bundled simplified SVG world map** with
  era-filtered event pins instead — zero dependencies, offline, themeable with
  CSS vars. Revisit real tiles only if the SVG map feels too limited.

### ❌ Needs a backend — not doing (same wall Sports-Hub hit)

- Scraping History.com / Britannica / museum sites — no CORS, ToS problems.
- Reddit / social feeds — no CORS (already proven dead in Sports-Hub v60).
- Runtime LLM generation of questions — needs an API key → needs a server.
- Cross-device sync of progress — localStorage per device, period (same
  caveat as Sports-Hub; a backend could fix it someday, not now).

**Content strategy that follows:** the hand-authored bundled bank is the
backbone (that's where deep-cut quality comes from — OpenTDB history is
bar-trivia casual); live APIs are the garnish: daily freshness (On This Day),
images (portraits), and bonus volume (🌍 blend).

## 8. Phased build plan

Each phase = one or more small shippable increments, `APP_VERSION` bumped,
owner verifies on iPhone before the next starts.

**Phase 0 — Scaffold (v1)**
Repo hygiene + `index.html` shell with tab bar + ported `styles.css` variable
system (dark + light editorial) + theme toggle + SW + manifest + icons +
`CLAUDE.md`. Owner enables GitHub Pages (Settings → Pages → main/root — manual,
a bot can't) and confirms the empty shell installs to home screen, offline
reload works, version badge shows.

**Phase 1 — MVP (v2–v6): Trivia + 2 games + starter learning**
- Port trivia engine; hand-write ~120 curated questions across the categories
  (incl. `ex` facts + `topic` links); seeded Daily Challenge; endless free
  play; per-category bests; miss review with "📚 Learn why" links.
- OpenTDB 23 blend + 22/20 tiles (harvest/cache pattern ported).
- `data/events.js` (~150 events to start) + **Before or After** + **Timeline
  Sort**.
- 12 starter explainers + Learn tab (era accordions); Progress tab v1
  (lifetime stats, day streak, per-category bests).

**Phase 2 — Visuals (v7–v10)**
- Interactive **timeline**: horizontal scrub, era color bands, region/tag
  filter chips, tap event → detail card → explainer link. Pure DOM/CSS
  transforms, no library.
- **Figure cards** with Wikipedia REST portraits (+ graceful fallback).
- **📅 On This Day** on Home (Feed API) + "This day in history" generated
  quiz mode.
- Grow bank: +100 questions, +100 events, +12 explainers.

**Phase 3 — More games + map (v11–v14)**
- **Guess the Era**, **Who Am I?**; daily challenge starts rotating game
  types; one unified day-streak.
- **SVG map view**: simplified world map, event pins filtered by era/timeline
  scrub position (the "where" dimension).

**Phase 4 — Depth & polish (v15+)**
- Per-category **mastery** (accuracy-weighted, decays toward "review me");
  achievements; bank growth toward 400+ questions / 400+ events; images in
  Guess the Era; Wikidata-assisted authoring passes.

## 9. Open questions for the owner

1. **Name:** keep **Historia**? (Recommended — it's already the repo + URL.)
2. **Ship-to-main:** adopt Sports-Hub's "push straight to main by default"
   standing rule for this repo too? (This session's work stays on
   `claude/history-hub-architecture-nl7jjy` until authorized.)
3. **Philadelphia & the Revolution** category — in or out?
4. **Content balance:** US-leaning (like the categories above) or push more
   world history (China, Islamic Golden Age, Africa, Mesoamerica get their own
   categories vs. living inside era categories)?
