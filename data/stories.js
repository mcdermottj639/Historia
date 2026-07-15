'use strict';
/* Historia — Story Mode data. Each story is a cinematic, tap-through narrative
 * (Instagram-stories format: full screen, progress bars, tap right to advance)
 * ending with a 3-question retention quiz. Facts are hand-checked; where the
 * sources disagree or legend crept in, the slide says so — that's part of the fun.
 *
 * Shape: { id, era, emoji, title, kicker, minutes, slides:[{k?, t, body}],
 *          quiz:[{q, a, w:[3]}], events:[eventIds], figures:[figureIds] } */
window.H_STORIES = [
  {
    id: 'apollo11',
    era: 'coldwar',
    emoji: '🌙',
    title: 'The Longest Three Minutes',
    kicker: 'Apollo 11 · July 20, 1969',
    minutes: 4,
    slides: [
      { k: 'July 20, 1969', t: 'Two men, 240,000 miles from home', body: 'Neil Armstrong and Buzz Aldrin are falling toward the Moon in a spacecraft with walls thin enough to dent with a finger. Michael Collins waits alone in orbit above them. Six hundred million people are listening live.' },
      { k: '6 miles up', t: 'The computer starts screaming', body: 'A yellow alarm lights up: PROGRAM ALARM 1202. Neither astronaut knows what it means. Neither does most of Mission Control. If it’s serious, the landing is over — abort, fly home, try again never.' },
      { k: 'Houston', t: 'A 26-year-old makes the call', body: 'Guidance officer Steve Bales — with engineer Jack Garman’s handwritten cheat sheet of alarm codes — recognizes it: the computer is overloaded but still flying fine. It’s shedding low-priority work like a pro. Bales calls it: “GO.”' },
      { k: 'Descent', t: 'The landing site is a boulder field', body: 'Armstrong looks out the window and doesn’t like what the computer has picked: a crater rimmed with car-sized rocks. He takes manual control and skims the Eagle across the lunar surface, hunting for a clear spot, burning precious fuel.' },
      { k: 'CAPCOM', t: '“60 seconds”', body: 'That’s Mission Control’s polite way of saying: land in one minute or abort. Aldrin quietly reads out altitude numbers. Armstrong says nothing. His heart rate hits 150. The Eagle floats over the rocks like a stone skipping in slow motion.' },
      { k: 'CAPCOM', t: '“30 seconds”', body: 'The last fuel call. Dust kicked up by the engine is blinding the view now. Then Aldrin sees the shadow of a landing probe touch grey powder and a blue light labeled LUNAR CONTACT blinks on. Engine stop.' },
      { k: '4:17 p.m. Houston time', t: '“The Eagle has landed”', body: '“Houston, Tranquility Base here. The Eagle has landed.” In Houston, CAPCOM Charlie Duke stumbles over his own relief: “Roger, Twan— Tranquility, we copy you on the ground. You got a bunch of guys about to turn blue. We’re breathing again.”' },
      { k: 'Six hours later', t: 'One small step', body: 'Armstrong backs down the ladder and steps off the footpad. “That’s one small step for man… one giant leap for mankind.” He always insisted he said “for A man” — the radio ate the word. History kept the version it heard.' },
      { k: 'Overhead', t: 'The loneliest human ever', body: 'Every time Michael Collins passes behind the Moon, he loses all radio contact — cut off from Earth AND his crewmates. NASA’s log calls it the deepest solitude any human has experienced. Collins later said he felt not fear, but “awareness, anticipation, satisfaction.”' },
      { k: 'Epilogue', t: 'Bales gets the medal', body: 'When the crew received the Presidential Medal of Freedom, so did Steve Bales — the young engineer who said GO — accepting on behalf of all of Mission Control’s twenty-somethings. Average age in that room during the landing: about 28.' },
    ],
    quiz: [
      { q: 'What did the mysterious 1202 alarm actually mean?', a: 'The computer was overloaded but still flying fine', w: ['The fuel tanks were leaking', 'The radar had failed completely', 'The cabin was losing pressure'] },
      { q: 'Why did Armstrong take manual control during the descent?', a: 'The target area was strewn with boulders', w: ['The computer had shut down', 'Aldrin was incapacitated', 'Houston ordered an abort'] },
      { q: 'What was the last fuel callout from Houston before touchdown?', a: '30 seconds', w: ['10 seconds', '2 minutes', '5 seconds'] },
    ],
    events: ['apollo11', 'sputnik', 'gagarin'],
    figures: ['armstrong'],
  },
  {
    id: 'ides',
    era: 'ancient',
    emoji: '🗡️',
    title: 'Beware the Ides of March',
    kicker: 'Rome · March 15, 44 BCE',
    minutes: 4,
    slides: [
      { k: 'Rome, 44 BCE', t: 'The man who ran out of worlds', body: 'Julius Caesar has beaten everyone: Gaul, Pompey, the Senate’s armies. A month ago Rome named him dictator perpetuo — dictator for life. For a republic built on hating kings, “for life” sounds a lot like a crown.' },
      { k: 'The warning', t: '“Beware the Ides of March”', body: 'A soothsayer named Spurinna has warned Caesar that danger will come no later than the Ides — March 15. That morning, Caesar’s wife Calpurnia wakes from nightmares of his murder and begs him to stay home. He almost does.' },
      { k: 'The betrayal', t: 'The friend who came to fetch him', body: 'Enter Decimus Brutus — not the famous Brutus, but a trusted general Caesar named in his will. He’s also a conspirator, and he’s been sent because Caesar trusts him. Mocking the omens, he talks Caesar into coming. Shakespeare gave the role to the wrong Brutus; the historians remember Decimus.' },
      { k: 'The venue', t: 'Not the Senate House', body: 'The Senate isn’t meeting in the Forum today — their chamber is under repair. They convene in the Theatre of Pompey, in a hall beneath a statue of Pompey the Great: the rival Caesar defeated and whose murder he wept over. Rome does not lack for irony.' },
      { k: 'The trap', t: 'A petition closes in', body: 'Sixty-plus senators are in on it. Tillius Cimber approaches with a petition and grabs Caesar’s toga — the signal. Casca strikes first, a glancing blow to the neck. Caesar spins and stabs him with the only weapon he has: a stylus. A pen.' },
      { k: 'The fall', t: 'Twenty-three wounds', body: 'The daggers come from every side. Suetonius records that physicians later judged only ONE of the 23 wounds fatal. Seeing Marcus Brutus among the killers, Caesar — by one ancient account — says in Greek, “Kai su, teknon?” — “You too, child?” “Et tu, Brute” is Shakespeare, seventeen centuries later.' },
      { k: 'The miscalculation', t: 'They forgot to plan the sequel', body: 'The conspirators run through the streets shouting “Liberty!” — and find the city silent, then furious. At the funeral, Antony reads Caesar’s will: his gardens to the public, cash to every citizen. The crowd burns the Forum. The “liberators” flee the city they claimed to save.' },
      { k: 'The comet', t: 'A god, apparently', body: 'That July, a comet blazes over Caesar’s memorial games for seven days. Romans call it the Julian Star — proof, they say, that Caesar has joined the gods. His 18-year-old heir Octavian puts the comet on coins. You cannot buy propaganda like a comet.' },
      { k: 'Epilogue', t: 'They killed the man, and built the throne', body: 'Within 17 years, every leading conspirator is dead — most violently. Octavian outmaneuvers them all and in 27 BCE becomes Augustus, Rome’s first emperor. The Republic the daggers were meant to save is gone. The empire they feared lasts five centuries.' },
    ],
    quiz: [
      { q: 'Where was Caesar actually killed?', a: 'The Theatre of Pompey', w: ['The Senate House in the Forum', 'The Colosseum', 'His villa across the Tiber'] },
      { q: 'Who talked Caesar into attending, despite the omens?', a: 'Decimus Brutus', w: ['Marcus Brutus', 'Mark Antony', 'Cicero'] },
      { q: 'What happened to Rome after the assassination?', a: 'Caesar’s heir Octavian became Augustus, the first emperor', w: ['The Republic was restored for a century', 'Rome was conquered by Carthage', 'The Senate ruled peacefully without a leader'] },
    ],
    events: ['ides', 'rubicon', 'augustus'],
    figures: ['caesar', 'augustus'],
  },
];

window.H_STORY_BY_ID = Object.fromEntries(window.H_STORIES.map((s) => [s.id, s]));
