# Historia — Vision & Roadmap

> **Historia** (name confirmed by owner) — history made genuinely fun. Not a
> trivia app with notes attached: a **visual, story-driven, playable** history
> world. Same platform philosophy as Sports-Hub: pure static HTML/CSS/vanilla
> JS, no build step, no backend, no API keys, GitHub Pages, PWA, dark default +
> light editorial theme, mobile-first. See `CLAUDE.md` for the working contract.

Owner decisions (2026-07-15): name **Historia** · **ship-to-main** by default ·
**Philadelphia & the Revolution** category is in · **US-leaning mix** of content.
Owner directive: *"much more than the trivia… as much visuals and fun and
stories as we can. Make it state of the art."* That reframed the product from
trivia-first to **experience-first** — the pillars below.

## The five pillars

1. **🕰️ The Grand Timeline** *(shipped v1)* — all of recorded history on one
   scrubbable, zoomable strip. Era color bands, every event tappable, "+N"
   clusters that dive in, cross-links from everything else in the app.
2. **📖 Story Mode** *(shipped v1, 2 stories)* — cinematic tap-through
   narratives (stories-app grammar: full-screen slides, progress bars) with a
   3-question retention quiz paying Wisdom. The soul of the app: history told
   as drama, legend flagged as legend.
3. **🎮 Games** *(Before/After shipped v1)* — chronology and deduction games
   all driven by the same event/figure datasets: Timeline Sort, Guess the Era,
   Who Am I?, and the full deep-cut Trivia Lab (ported from Sports-Hub's
   engine) with a rotating Daily Challenge.
4. **📚 Learn** *(shipped v1)* — era browser with intros, people and events;
   figures gallery with live Wikipedia portraits; later: explainer cards that
   trivia misses link back to, and an SVG map view (the "where").
5. **📈 Progression** *(shipped v1)* — Wisdom XP, ranks (Apprentice → Keeper
   of Ages), day streaks, per-game bests; later per-era mastery. All
   localStorage, per device.

Plus the **🕰️ Time Machine** on Home *(shipped v1)*: every day the app lands
in a different year (date-seeded, same for everyone), surfacing that year's
events and a featured story — the daily-freshness hook that needs no server.

## Shipped

### v1 — first real increment (2026-07-15)
- App shell: PWA (manifest, icons, offline service worker, auto-update),
  dark "reading room" + light "editorial/museum" themes, ARIA tabs.
- **Grand Timeline**: 141 hand-written events, 9 color-coded eras, 4 zoom
  levels with dot→year→full marker modes, fixed-bucket clustering, era jump
  chips, event bottom-sheets with era/region/figure cross-links + Wikipedia
  deep links.
- **Story Mode**: player + 2 stories ("The Longest Three Minutes" — Apollo 11;
  "Beware the Ides of March" — Caesar), each with quiz + XP.
- **Games**: ⚖️ Before or After with lives, streak scoring, and a year-gap
  difficulty ramp; roadmap tiles for the rest.
- **Learn**: 9 era accordions, 28 figures with tag lines + facts + portrait
  fetching (graceful monogram fallback).
- **Home**: hero stats (Wisdom/streak/stories/best), rank progress bar, Time
  Machine daily landing, featured daily story.
- Verified via local Chromium screenshots (both themes, all tabs, story flow,
  game flow, sheets). Live API calls (portraits) unverifiable from the sandbox
  — verify on device.

### v2 — On This Day, Timeline Sort & more (2026-07-15)
- **📅 On This Day** on Home: Wikimedia Feed API (`selected`), cached per
  day, seeded pick of 5, tap → image/extract sheet. Hides itself offline.
  First live-API integration — needs on-device confirmation (sandbox blocked).
- **⏳ Timeline Sort**: tap 5 events earliest-first; rounds tighten from
  150-year gaps down to 6; +20/pick, +50 perfect bonus, 3 lives, best + XP.
- **Event images** in timeline sheets via generalized Wikipedia thumb fetch.
- **New story**: "The Night the Wall Fell by Accident" (Berlin 1989 —
  Schabowski's note, Bornholmer Straße, Harald Jäger's call).

### v3 — The Great Backfill, Wave 1: Ancient World depth (2026-07-15)
- **+65 events (→ 206) and +22 figures (→ 51)**, all in the Ancient era, which
  jumps from ~24 to 88 events / 27 people. Coverage: Mesopotamia (Uruk,
  cuneiform, Sargon, Enheduanna, Gilgamesh, Assyria, Babylon), Egypt & Nubia/Kush
  (Djoser, Hatshepsut, Akhenaten, Ramesses, Kerma, Piye's Black Pharaohs, Meroë,
  Amanirenas vs Rome), Persia (Cyrus, Darius, Behistun, Persepolis, Zoroaster),
  India (Indus Valley, Vedas, Mahavira, Maurya, Ashoka, Gupta, Aryabhata), China
  (oracle bones, Zhou/Mandate of Heaven, Confucius, Laozi, Sun Tzu, Han, Silk
  Road, paper, Ban Zhao) and the early Americas (Caral, Poverty Point, Olmec,
  Chavín, Monte Albán, Nazca, Maya Long Count), plus Greece/Rome deep cuts
  (Knossos, Mycenae, Homer, Peloponnesian War, Archimedes, Colosseum).
- Gender- and globe-balanced; every circa date carries `approx`. Timeline
  verified smooth at all 4 zoom levels in both themes with the denser dataset.
- First wave of the roadmap in `BACKFILL.md` (target: 600+ events, 120+
  figures, 12+ stories, all 5,000 years).

### v4 — The Great Backfill, Wave 2: Middle Ages worldwide (2026-07-15)
- **+73 events (→ 279) and +21 figures (→ 72)**. Middle Ages jumps from 14 to
  79 events, and every region gets weight: Byzantium & the Islamic Golden Age
  (Hagia Sophia, round-city Baghdad, al-Khwarizmi, Ibn Sina, Saladin, Córdoba,
  Cairo, the 1258 Mongol sack), Tang/Song China + Japan/Korea/Khmer (Grand
  Canal, Wu Zetian, Diamond Sutra, Bi Sheng's type, Murasaki's Genji, Angkor
  Wat, the kamikaze, Jikji), medieval Africa (Aksum & Ezana, Ghana's gold,
  Sundiata's Mali, Lalibela, Great Zimbabwe, Kilwa, Timbuktu's scholars,
  Askia's Songhai, Ibn Battuta), Europe & the Vikings (Justinian's Code,
  Rurik's Rus, Iceland's Althing, Canossa, Domesday, Bologna, El Cid, Gothic
  Saint-Denis, first Parliament, Aquinas, Crécy, Chaucer) and the medieval
  Americas + Pacific (Tikal, Pakal, Maya collapse, Cahokia, Mesa Verde, Chan
  Chan, the Aztec Triple Alliance, Pachacuti & Machu Picchu) — with Oceania
  finally a real presence (Polynesian voyaging, Tuʻi Tonga, Hawaiʻi's
  ahupuaʻa, Māori Aotearoa, Rapa Nui's moai).
- Verified: timeline smooth at all 4 zoom levels in both themes with 279
  events; 0 page errors. Wave 2 of the `BACKFILL.md` roadmap.

## Next increments (small, shippable, in rough order)

> **The Great Backfill is now the active track** (see `BACKFILL.md`): Waves 2–8
> ship as their own versions (v4, v5, …), growing the dataset era by era toward
> 600+ events / 120+ figures / 12+ stories. The feature ideas below are queued
> behind (or interleaved with) the backfill and will take later version numbers.

1. **Trivia Lab port**: Sports-Hub engine, history categories (Ancient,
   US History, Presidents, World Wars, Explorers, Inventions, Civil Rights,
   **Philadelphia & the Revolution**), ~120 hand-written deep-cut questions,
   seeded Daily Challenge folded into the day-streak, OpenTDB 23/22/20 blend
   (CC BY-SA attribution), misses linking to Learn content.
2. **v4 — Guess the Era + Who Am I?** (event blurbs with names stripped;
   progressive figure clues) + Daily Challenge rotation across game types.
3. **v5 — more stories** toward 10+ (candidates: Hannibal's crossing, 1453's
   cannons, the Philly yellow fever, Gettysburg's Pickett's charge, the Cuban
   Missile Crisis hour-by-hour, Shackleton) + richer sheets ("what else
   happened this year", related-story links).
4. **v6 — SVG map view**: bundled world map, era-filtered event pins
   (coordinates added to events.js at authoring time — World Historical
   Gazetteer/Wikidata as authoring tools only).
5. **Later**: per-era mastery rings, achievements, figure "collection"
   unlocks, bank growth (events → 300+, figures → 60+).

## Data sources (verdicts)

| Source | Verdict |
|---|---|
| Wikipedia REST summaries | ✅ runtime (portraits/images/extracts; CORS `*`, keyless) |
| Wikimedia "On This Day" feed | ✅ runtime (daily events; CORS `*`, keyless) |
| OpenTDB (History 23, Geography 22, Mythology 20) | ✅ runtime (proven in Sports-Hub prod; rate-limited; CC BY-SA credit) |
| RapidAPI history APIs, API Ninjas | ❌ runtime — need API keys; a key in static JS is public. Authoring reference only. (Owner asked 2026-07-15.) |
| World Historical Gazetteer, Wikidata SPARQL | ⚠️ authoring-time only (geocoding, candidate lists to hand-curate) |
| Scraping Britannica/History.com, social feeds | ❌ no CORS / ToS — needs a server; not doing |
| Cross-device sync | ❌ needs a backend; progress stays per-device |

**Content strategy:** the hand-authored bundled datasets are the backbone
(quality + offline); live APIs are garnish (daily freshness, images, bonus
trivia volume).
