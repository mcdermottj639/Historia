# Historia — The Great Backfill (agent brief)

This is a standing work order for filling Historia with massive, high-quality
history content — 5,000 years, done incrementally in shippable waves. It is
written to be executed by a Claude session (optionally fanning out to
subagents), over a day or more, in any number of sittings.

## Read first, always

1. `CLAUDE.md` — the working contract (constraints, files, versioning ritual,
   ship-to-main rule, testing reality). Non-negotiable.
2. `PLAN.md` — vision + roadmap.
3. `data/events.js`, `data/figures.js`, `data/stories.js` — the CURRENT
   content. Never duplicate an existing id, event, figure or story.

## The goal (end state)

| Dataset | Now | Target | Notes |
|---|---|---|---|
| `H_EVENTS` | ~141 | **600+** | the backbone — every other feature feeds on it |
| `H_FIGURES` | ~28 | **120+** | fuels gallery + future Who Am I? |
| `H_STORIES` | 3 | **12+** | the soul — quality over count, 8–10 slides each |

Coverage rule: **the whole planet, all 5,000 years.** Owner wants a US-leaning
mix, but "leaning" ≠ "only": every wave must include non-Western content
(Asia, Africa, the Americas before 1492, Oceania, the Islamic world). No era
left thin. Philadelphia/Revolution deep cuts are extra-welcome.

## How to work: waves

Do NOT dump everything in one commit. Work in **waves of ~40–60 events
(+10–15 figures, +0–2 stories)**. Each wave:

1. Pick a slice (recommended order below).
2. Author the content (subagents fine — one per era/region slice; the main
   session merges, dedups and quality-checks everything itself).
3. Append to the data files (see schemas + style below).
4. Run the FULL release ritual from CLAUDE.md: bump `APP_VERSION` + every
   `?v=N` in index.html + `CACHE` in sw.js, `node --check` all touched files,
   **Playwright screenshot verify** (serve with `python3 -m http.server`;
   Chromium at `/opt/pw-browsers/chromium`; shoot Timeline, Learn, Games at
   390×844 in BOTH themes), commit, push `main` (ship-to-main is authorized)
   and keep the session branch in sync.
5. One wave = one version = one commit. If a wave breaks something, the owner
   can pinpoint it from the version badge.

Recommended wave order (balanced, each independently shippable):
- Wave 1: Ancient world depth — Mesopotamia, Egypt, Nubia/Kush, Persia, India
  (Maurya/Gupta), China (Zhou→Han), early Americas (Olmec, Maya, Chavín).
- Wave 2: Rome/Greece deep cuts + Middle Ages worldwide (Byzantium, Islamic
  Golden Age, Tang/Song China, Ghana/Mali/Songhai, Khmer, Japan, Vikings).
- Wave 3: 1400–1800 — Renaissance, Reformation, Ottomans, Mughals, Ming/Qing,
  the Columbian exchange (honestly — conquest AND consequence), Atlantic
  slave trade, scientific revolution, Enlightenment.
- Wave 4: US History dense pass — colonial → Revolution (Philly!) → early
  republic → Civil War → Reconstruction → Gilded Age, plus Latin American
  independence and 19th-century world (Meiji, Raj, scramble for Africa).
- Wave 5: 1900–1945 dense pass; Wave 6: Cold War/civil rights/decolonization;
  Wave 7: 1970s→today; Wave 8+: figures top-up, stories, gap-fill by region.

## Event schema + STYLE (this is the product — match it exactly)

```js
{ id: 'uniqueslug', y: -490, approx: 1, region: 'europe',
  title: 'Battle of Marathon',
  blurb: 'One vivid sentence in storyteller voice — a fact with a pulse.',
  wiki: 'Battle of Marathon', fig: ['figureid'] }
```

- `y`: integer year, **negative = BCE**. `approx: 1` for any circa date —
  honesty is brand. Era is DERIVED from `y`; never stored.
- `region`: one of `europe asia africa mideast americas oceania global`.
- `blurb`: ONE sentence, vivid, specific, human — read the existing 141 and
  match the voice ("Plague ships dock in Sicily; within five years a third to
  half of Europe is dead…"). Never textbook-flat. Never invented details.
- `wiki`: EXACT English Wikipedia article title (drives images + read-more).
  Verify the title exists — a typo silently kills the image.
- **Fact-check every date.** Where sources disagree, use the scholarly
  consensus + `approx`. Where legend ≠ record, the blurb may say so — that's
  a feature.
- Dedup: no near-duplicates of existing events (check ids AND year+topic).

## Figure schema

```js
{ id: 'slug', name: 'Name', born: -100, died: -44, era: 'ancient',
  region: 'europe', tag: 'One line: why they matter',
  facts: ['Two short "huh!" facts…', '…that a bar-trivia fan would repeat.'],
  wiki: 'Exact Article Title' }
```
`died: null` = alive. Balance: scientists, artists, rulers, rebels, builders —
and not 90% men from Europe; history's bench is deeper than that.

## Story schema (only if the wave includes one)

8–10 slides, `{k?, t, body}` — kicker/title/2–3 sentence body, cinematic,
present tense, cliff-hanger pacing; 3-question quiz `{q, a, w:[3]}` answerable
FROM the slides; `events`/`figures` link ids. Flag legends explicitly
(see "Et tu, Brute" in the Ides story). Candidates list is in PLAN.md.

## Guardrails

- **No new runtime data sources, no API keys, no build step, no frameworks.**
  Bundled hand-authored data only (Wikipedia/Wikimedia APIs are already wired
  for images/On-This-Day; nothing else goes in the client).
- **Performance check at scale**: the Grand Timeline renders every event.
  After each wave, open the Timeline in the Playwright pass and confirm it
  still scrolls/zooms cleanly and cluster pills stay sane at all 4 zoom
  levels. If markers get cramped, tune `LEVELS[].gap` in timeline.js — don't
  redesign it mid-backfill.
- **localStorage safety**: content lives in JS files, not localStorage — no
  storage concerns from the backfill itself.
- Keep `CLAUDE.md`'s "Current version" line and PLAN.md's shipped-log updated
  **in the same commit** as each wave.
- No model identifiers in anything pushed.
- Sandbox network is blocked — Wikipedia/OpenTDB calls can't be live-tested;
  never let a wave depend on them.

## Definition of done (whole backfill)

- 600+ events, 120+ figures, 12+ stories, every era and region represented.
- Every wave shipped as its own version, all checks green, timeline smooth.
- Final wave: update PLAN.md roadmap (backfill → done) and propose the next
  frontier (map view coordinates were deliberately NOT part of this brief).
