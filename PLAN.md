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
3. **🎮 Games** *(rebuilt v12)* — story-first, not date-quiz-first: 👑
   Crossroads (become the figure, face their real decisions), the once-a-day
   🗓️ Daily Reckoning, 🎭 Who Am I?, 🔮 What Happened Next?, plus the
   chronology pair (Before/After, Timeline Sort) — all driven by the same
   event/figure datasets. Still to come: the deep-cut Trivia Lab (ported from
   Sports-Hub's engine).
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

### v5 — Grand Timeline rebuilt as scrubber + card deck (2026-07-15)
- The horizontal zoom-and-cluster strip was replaced with a **draggable
  scrubber minimap** (era bands + a dot per event + a playhead) synced to a
  **snap-scrolling deck of big cinematic event cards** — every event a
  full-width tap target, no more "+N" clusters or px/year zoom levels. Shipped
  in parallel with the backfill by a separate session; `Timeline.focusYear(y)`
  keeps the cross-tab deep-link (the `level` argument is gone).

### v6 — The Great Backfill, Wave 3: 1400–1800 depth (2026-07-15)
- **+76 events (→ 355) and +24 figures (→ 96)**. The two thinnest eras fill
  out: Renaissance & Discovery jumps 18→57 events, Early Modern 9→43.
  Coverage: the Renaissance/Reformation/Scientific Revolution (Medici Florence,
  Brunelleschi, Machiavelli, More, Calvin, Bruno, Vesalius, Kepler, Descartes,
  Leeuwenhoek), the gunpowder empires (Ottomans under Suleiman — Mohács, both
  Sieges of Vienna, Lepanto, Sinan; Safavid Shah Abbas & Isfahan; Mughal Babur,
  Akbar, Shah Jahan's Taj Mahal, Aurangzeb; Guru Nanak), Ming & early Qing
  China + Japan/Korea (Hongwu, Zheng He's fleets, the Forbidden City, Sejong's
  Hangul, Nobunaga, Nagashino's guns, Hideyoshi, Yi Sun-sin's turtle ships,
  Sekigahara, the Edo shogunate, sakoku, Kangxi, the 47 Ronin), the age of
  exploration told honestly (Tordesillas, Cabral, the Columbian Exchange & its
  ~90% mortality, the Middle Passage, Kongo's Afonso, Pizarro & Atahualpa,
  Potosí, 1619 Virginia, Las Casas, the Pueblo Revolt, King Philip's War,
  Penn's Philadelphia, Salem) and the Enlightenment (Charles I, Hobbes,
  Versailles, the Glorious Revolution, Locke, Peter & St Petersburg,
  Montesquieu, Voltaire's Candide, Rousseau, Catherine, Adam Smith, Watt's
  engine). New figures include Hurrem, Artemisia Gentileschi, Catherine the
  Great, Émilie du Châtelet, La Malinche and Olaudah Equiano.
- Authored as v5 in parallel with the timeline rebuild; ships as v6 on top of
  it. Verified: the new scrubber/card-deck timeline renders cleanly with 355
  events in both themes; 0 page errors. Wave 3 of the `BACKFILL.md` roadmap.

### v7 — Story Mode slide layout fix (2026-07-15)
- Content slides now vertically center their kicker/title/body instead of
  pinning them to the bottom (which left a dead gap mid-slide); the intro slide
  keeps its title-card split via a new `.story-slide.intro` class. Shipped by a
  separate session in parallel with the backfill.

### v8 — The Great Backfill, Wave 4: 1750–1914 dense pass (2026-07-15)
- **+81 events (→ 436) and +26 figures (→ 122 — the 120-figure goal is met)**.
  Age of Revolutions jumps 21→56 events, Industrial Age 15→61. A dense US
  thread (Revolution deep cuts, the early republic, the antebellum slavery
  crisis, the Civil War, Reconstruction, the Plains Wars, the Gilded Age) is
  balanced by Latin American independence (Bolívar, San Martín, Toussaint,
  Hidalgo, Ayacucho, Ipiranga, Juárez, Brazil's Golden Law), 19th-century Asia
  (Opium Wars, the Taiping, Perry, the Meiji Restoration, the Satsuma rebellion,
  Tsushima, the Sepoy Rebellion, the Raj) and 19th-century Africa + the
  industrial world (Muhammad Ali, Shaka's Zulu, Isandlwana, the Berlin
  Conference, Khartoum, Leopold's Congo, Adwa, the Irish Famine, Marx,
  Nightingale, Pasteur, Mendeleev). New figures span Jefferson, Douglass,
  Sojourner Truth, Sacagawea, Sitting Bull, Ida B. Wells, Bolívar, Rani
  Lakshmibai, Cixi, Menelik II and Florence Nightingale.
- Authored as v7 in parallel with the Story Mode fix; ships as v8 on top.
  Verified: the scrubber/card-deck timeline renders cleanly with 436 events in
  both themes; 0 page errors. Wave 4 of the `BACKFILL.md` roadmap.

### v9 — Grand Timeline reworked as scrubber + event list (2026-07-15)
- The swipeable card deck became a **draggable scrubber minimap feeding a calm
  vertical list** of big full-width event rows, with a translucent window and
  Wider/Closer controls to resize the slice in view. Easier to read and tap
  than the deck. Shipped by a separate session in parallel with the backfill.

### v10 — The Great Backfill, Wave 5: 1900–1945 (2026-07-15)
- **+80 events (→ 516) and +20 figures (→ 142)**. The pivotal 31 years in
  depth: World War I (the Marne, the trenches, Gallipoli, the Armenian
  genocide, Verdun, the Arab Revolt, Sykes–Picot, Balfour, the Romanovs,
  Versailles), the interwar rise of the dictators (Mussolini, Weimar
  hyperinflation, Stalin's Five-Year Plans and Great Purge, the Holodomor,
  Gandhi's Salt March, Mao's Long March, Guernica, Amelia Earhart), World War
  II in Europe (Munich, Dunkirk, Barbarossa, the siege of Leningrad, Bletchley
  Park, El Alamein, the Warsaw Ghetto, the liberation of Paris, Yalta, the
  fall of Berlin), the Pacific war + the Holocaust told with care (Nanjing,
  Kristallnacht, Midway, the Wannsee Conference, Auschwitz, Iwo Jima, the
  liberation of the camps) and the usually-skipped edges — wartime science
  (the 1919 eclipse, Colossus, the Trinity test), the home front (Rosie, the
  Tuskegee Airmen, the Navajo Code Talkers, internment) and the global South
  (colonial armies, the Bengal famine, Quit India). New figures span Lenin,
  Atatürk, Edith Cavell, Stalin, Mussolini, Mao, Turing, Rommel, Zhukov, de
  Gaulle, Anne Frank, Chiune Sugihara, Oppenheimer, Frida Kahlo and Subhas
  Chandra Bose.
- Authored as v9 in parallel with the timeline rework; ships as v10 on top.
  Verified: the scrubber/event-list timeline renders cleanly with 516 events in
  both themes; 0 page errors. Wave 5 of the `BACKFILL.md` roadmap.

### v12 — The Games Hall rebuild (2026-07-16)
- Owner verdict on the games tab: "terrible" — two date-guessers with no
  story. Rebuilt around the owner's own idea as the flagship:
- **👑 Crossroads** (`crossroads.js` + `data/crossroads.js`): become Caesar
  (The Die and the Daggers, 49–44 BCE), Cleopatra (The Last Pharaoh, 48–30
  BCE) or Washington (Victory or Death, 1776–81) and face 5 real decisions
  each, told in the Story Mode overlay grammar. Choose, then see fact-checked
  **History's path** vs a clearly-labeled speculative **road not taken**;
  scored as Historian's Instinct (real choices matched), per-scenario best +
  XP. Legend flagged in-text (the bed-sack, the asp, "Et tu, Brute").
- **🗓️ The Daily Reckoning**: one seeded mystery event per day (same for
  every traveler), 4-clue ladder (era → region → ~year → chronicle quote),
  6 candidates with elimination; state persists per day. Home's Time Machine
  button now launches it.
- **🎭 Who Am I?** (progressive, name-redacted figure clues, 4 suspects,
  portrait reveal) and **🔮 What Happened Next?** (face-up anchor moment,
  3 same-region candidates — two already happened).
- Existing games softened: blurbs on face-down cards (guess from the story,
  not a bare title), one free slip per Timeline Sort round. **Guess the Era
  cut** from the roadmap — it was a third date-guesser. Hub reordered: Daily
  card → Crossroads shelf → quick games. Verified via Chromium screenshots,
  both themes, all six games driven end-to-end.

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
2. **More Crossroads scenarios** toward 8+ (candidates: Lincoln 1861–65,
   Napoleon 1799–1815, Elizabeth I, Mansa Musa, Genghis Khan, Ashoka).
3. **More stories** toward 10+ (candidates: Hannibal's crossing, 1453's
   cannons, the Philly yellow fever, Gettysburg's Pickett's charge, the Cuban
   Missile Crisis hour-by-hour, Shackleton) + richer sheets ("what else
   happened this year", related-story links).
4. **SVG map view**: bundled world map, era-filtered event pins
   (coordinates added to events.js at authoring time — World Historical
   Gazetteer/Wikidata as authoring tools only).
5. **Later**: per-era mastery rings, achievements, figure "collection"
   unlocks. (Guess the Era deliberately cut in v12 — a third date-guesser.)

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
