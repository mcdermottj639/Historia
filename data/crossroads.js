'use strict';
/* Historia — Crossroads scenarios. The flagship game: you become the figure and
 * face the real decisions they faced, beat by beat. Every scene, outcome and
 * consequence is fact-checked; the "road not taken" is counterfactual and the
 * player UI labels it as historians' informed guesswork. Legend is flagged as
 * legend in the text itself (the bed-sack, the asp, "Et tu").
 *
 * Shape: { id, fig (figures.js id), emoji, era, title, kicker, minutes, intro,
 *          beats: [{ k (kicker/date), t (title), scene,
 *                    choices: [{t, real?}, {t}],   // exactly one has real:1
 *                    outcome (what really happened),
 *                    alt (the counterfactual — speculative voice) }],
 *          fate (closing card text) }                                        */
window.H_CROSSROADS = [
  {
    id: 'cx-caesar', fig: 'caesar', emoji: '🎲', era: 'ancient',
    title: 'The Die and the Daggers', kicker: 'Rome · 49–44 BCE', minutes: 6,
    intro: 'You are Gaius Julius Caesar — conqueror of Gaul, idol of your legions, and the Senate’s worst nightmare. Your enemies in Rome have ordered you to give up your army and come home to face them alone. Every choice ahead of you was faced by the real Caesar. Choose — then see what he did, and what it cost.',
    beats: [
      {
        k: 'January 49 BCE · a stream in northern Italy', t: 'The Rubicon',
        scene: 'The law is absolute: a general who leads his army across the little river Rubicon commits treason against Rome. On the far side wait your enemies — Cato’s faction and Pompey’s legions — with a court ready to end your career, and perhaps your life. Beside you stands the Thirteenth Legion, waiting for one word.',
        choices: [
          { t: 'Cross the river under arms — treason it is', real: 1 },
          { t: 'Obey the Senate: disband the legion and go home a citizen' },
        ],
        outcome: 'Caesar crossed, reportedly quoting a Greek playwright: “Let the die be cast.” One small river turned a political quarrel into civil war — for Rome, and eventually for the whole Mediterranean world.',
        alt: 'Stripped of his command and his immunity, Caesar would almost certainly have been prosecuted and driven into exile — a brilliant career ending in a courtroom. Most historians think that is exactly why he crossed.',
      },
      {
        k: 'August 48 BCE · the plain of Pharsalus, Greece', t: 'Half their number',
        scene: 'Your gamble is going badly. Pompey has roughly twice your infantry and seven times your cavalry, your supplies are failing, and your last attack, at Dyrrhachium, ended in retreat. Now Pompey’s army has finally come down from the high ground and formed a line of battle. This may be your only chance — and the fastest way to lose everything.',
        choices: [
          { t: 'Offer battle now and bet everything on your veterans', real: 1 },
          { t: 'Slip away south and keep the war alive another season' },
        ],
        outcome: 'Caesar hid a fourth line of cohorts behind his thin cavalry; when Pompey’s horsemen charged, they shattered against it, and the whole battle collapsed. Pompey fled to Egypt — where a boy-king’s courtiers murdered him on the beach as a welcome gift.',
        alt: 'Retreat was survivable, but a half-starved, outnumbered army rarely wins a long war. Historians suspect delay would only have let Pompey’s numbers finish the job later, on a day of Pompey’s choosing.',
      },
      {
        k: 'October 48 BCE · Alexandria', t: 'The queen in the bed-sack',
        scene: 'Egypt’s courtiers hand you Pompey’s severed head as a gift — you weep at the sight of it. The kingdom is mid-civil-war: the boy-king Ptolemy XIII against his exiled sister Cleopatra, who has just been smuggled through his lines into your quarters, rolled up in bedding, to ask you for a throne. Egypt owes you a fortune. You have about 4,000 men.',
        choices: [
          { t: 'Back Cleopatra and settle Egypt’s war yourself', real: 1 },
          { t: 'Collect the debt, avoid the quicksand, and sail for Rome' },
        ],
        outcome: 'Caesar stayed — and nearly died for it, besieged all winter in the palace quarter while fire spread to the dockside book stores of the great Library. Relief finally came, Ptolemy drowned in the Nile, and Cleopatra took the throne. She would bear Caesar his only known son.',
        alt: 'Sailing off with the money was the sensible option — his own officers thought so — but it would have left Rome’s grain lifeline to a hostile court, and history without the alliance of Caesar and Cleopatra. Caesar rarely took the sensible option.',
      },
      {
        k: '46–44 BCE · Rome', t: 'What to do with your enemies',
        scene: 'You have won everywhere. The last man to rule Rome by the sword, Sulla, posted death lists in the Forum, butchered his enemies — and died peacefully in his bed. Now your own defeated enemies, Brutus and Cassius among them, wait to learn what kind of master you intend to be.',
        choices: [
          { t: 'Pardon them all — clemency is power too', real: 1 },
          { t: 'Post the death lists, as Sulla did' },
        ],
        outcome: 'Caesar pardoned nearly everyone, promoted many, and even made Brutus a praetor. His famous clemency was real — and on the Ides of March it would be standing in a circle around him, holding daggers.',
        alt: 'Terror worked for Sulla — once. Historians doubt it would have saved Caesar: the proscriptions poisoned Rome for a generation, and it was Sulla’s example that taught Romans that a dictator’s rule ends only in blood.',
      },
      {
        k: '15 March 44 BCE · your house, before dawn', t: 'The Ides of March',
        scene: 'The soothsayer Spurinna warned you a month ago: danger, no later than the middle of March. Last night your wife Calpurnia dreamed she cradled your murdered body, and this morning she begs you not to go. But the Senate is waiting — in three days you leave to make war on Parthia — and your friend Decimus has arrived at the door to walk you there personally.',
        choices: [
          { t: 'Go — Caesar does not hide from omens', real: 1 },
          { t: 'Stay home today; the Senate can wait' },
        ],
        outcome: 'He went. At Pompey’s theatre the conspirators — some sixty senators — closed around him: twenty-three wounds. “Et tu, Brute?” is Shakespeare’s line; the ancient sources say he fought back until he saw Brutus, then covered his face with his toga.',
        alt: 'A quieter day — but probably only a delay. The plot was sixty men strong and already leaking, and with Caesar leaving for a years-long war within days, historians think the daggers would simply have found another morning.',
      },
    ],
    fate: 'Caesar died at 55, one month before his Parthian war. The Republic his killers meant to save died with him: his 18-year-old heir Octavian took his name, hunted the assassins, and became Rome’s first emperor. The month of July still carries Caesar’s name.',
  },

  {
    id: 'cx-cleopatra', fig: 'cleopatra', emoji: '🐍', era: 'ancient',
    title: 'The Last Pharaoh', kicker: 'Egypt · 48–30 BCE', minutes: 6,
    intro: 'You are Cleopatra VII — twenty-one years old, exiled by your little brother’s courtiers, and the last hope of a Greek dynasty that has ruled Egypt for 250 years. Rome swallows kingdoms like yours whole. Every choice ahead was faced by the real Cleopatra. Choose — then see what she did.',
    beats: [
      {
        k: '48 BCE · outside Alexandria', t: 'The smuggler’s cargo',
        scene: 'Your brother’s army holds the frontier, and his courtiers have just murdered a Roman general to please a bigger one: Julius Caesar has landed at Alexandria with 4,000 men and moved into your palace. Whoever wins Caesar wins Egypt — but between you and him stand your brother’s lines, watching every road for a runaway queen.',
        choices: [
          { t: 'Have yourself smuggled through the lines, hidden in bedding', real: 1 },
          { t: 'Stay with your mercenary army and fight your brother in the field' },
        ],
        outcome: 'Plutarch says she slipped into the harbor at dusk and was carried to Caesar rolled inside a bedding sack — the rolled-up carpet is a later embellishment. It worked. Caesar was reportedly won over by the sheer nerve of it, and by morning her war was his.',
        alt: 'Her hired army against Alexandria’s, with no Roman muscle? Historians like her odds far less than she needed them — and a victorious Ptolemy would have handed Rome a perfect excuse to annex Egypt outright.',
      },
      {
        k: '41 BCE · Tarsus', t: 'The summons',
        scene: 'Caesar is dead, and Rome’s East belongs to Mark Antony, who has summoned you to Tarsus to answer charges of aiding his enemies. You did aid them — a little, under duress. Arrive as a defendant and you may keep your head. But Egypt does not need a pardoned queen; it needs Rome’s strongman as a partner.',
        choices: [
          { t: 'Sail in as a goddess — golden barge, purple sails — and make him wait', real: 1 },
          { t: 'Send envoys with apologies and stay safely in Egypt' },
        ],
        outcome: 'She came up the river Cydnus on a barge with a gilded stern and silver oars, dressed as the goddess of love herself — then declined Antony’s dinner invitation and made him come to hers. The charges were never mentioned again; Antony followed her home to Alexandria for the winter.',
        alt: 'Antony needed Egypt’s wealth either way, but a queen pleading by letter looks like a vassal, not a partner. The historians’ guess: a colder bargain, a shorter alliance — and no dynasty between them.',
      },
      {
        k: '34 BCE · Alexandria', t: 'All the eggs, one Roman',
        scene: 'Antony has covered you in territory and given you three children — and now, on a silver stage before the city, he wants to proclaim your son by Caesar the true heir of Rome’s greatest name, and to parcel out Rome’s East among your children. It would bind Egypt to Antony completely. It would also hand his rival Octavian a propaganda gift.',
        choices: [
          { t: 'Take the stage — the Donations of Alexandria', real: 1 },
          { t: 'Refuse the ceremony and keep a door open to Octavian' },
        ],
        outcome: 'The Donations made her children monarchs on paper — and made her Rome’s perfect villain. Octavian declared his war not on Antony but on Cleopatra: a foreign queen bewitching a good Roman was exactly the story Rome wanted to believe.',
        alt: 'Hedging might have bought time, but Octavian needed Egypt’s treasury and an enemy who wasn’t Roman. Most historians think the collision was coming for her whichever way she turned.',
      },
      {
        k: 'September 31 BCE · the Gulf of Actium', t: 'The burning fleet',
        scene: 'The war has come, and it is going wrong: Octavian’s admiral has bottled your combined fleet inside a Greek gulf, disease and desertion are eating the army, and Antony’s generals want to abandon the ships — your ships — and retreat overland. The treasury of Egypt is aboard your flagship. The wind turns seaward every afternoon.',
        choices: [
          { t: 'Break out by sea with the war chest and run for Egypt', real: 1 },
          { t: 'Burn the fleet and march the army out overland' },
        ],
        outcome: 'When the battle lines opened, her squadron crowded sail and ran for Egypt with the gold — and Antony abandoned his own flagship to follow her. The fleet they left behind surrendered, then the army. It saved the treasury, lost the war, and made “she fled first” her epitaph in Roman histories.',
        alt: 'The overland retreat was the generals’ advice: lose the ships, save the legions, fight on in Asia. Historians note it keeps Antony an army and the war alive — but leaves Egypt’s queen, and Egypt’s gold, hostage to a land campaign she could not control.',
      },
      {
        k: 'August 30 BCE · your mausoleum, Alexandria', t: 'The basket of figs',
        scene: 'Antony is dead in your arms. Octavian holds your city and your children — and you. He is exquisitely polite, and you know precisely what his politeness is for: you have watched a captive queen walked in chains through Rome before. It was your own sister. Now quiet word arrives that you sail for Rome within three days.',
        choices: [
          { t: 'Cheat him of his triumph', real: 1 },
          { t: 'Endure the triumph and bargain for your children’s lives' },
        ],
        outcome: 'She was found dead on a golden couch in full royal regalia, her two handmaidens dying beside her. The asp hidden in a basket of figs is the legend — Plutarch himself doubted it and suspected a hidden poison. Octavian, denied his prize, allowed her a queen’s burial beside Antony.',
        alt: 'Her sister Arsinoe was paraded in golden chains and drew such pity from the Roman crowd that she was spared — then executed anyway a few years later. Cleopatra had clearly done that arithmetic. Her son Caesarion was killed regardless: “too many Caesars.”',
      },
    ],
    fate: 'She was thirty-nine, and the last pharaoh — Egypt became the personal estate of Roman emperors for the next six centuries. Rome wrote her into history as a seductress; two thousand years later, historians are still correcting the record of one of the sharpest political minds Rome ever faced.',
  },

  {
    id: 'cx-washington', fig: 'washington', emoji: '🦅', era: 'revolutions',
    title: 'Victory or Death', kicker: 'America · 1776–1781', minutes: 6,
    intro: 'You are George Washington — a Virginia planter commanding an army of farmers against the greatest military power on Earth. The Declaration is three months old, and you are losing this war badly. Every choice ahead was faced by the real Washington. Choose — then see what he did.',
    beats: [
      {
        k: 'November 1776 · the Hudson', t: 'The fort that flatters you',
        scene: 'The British have thrown you off Long Island and out of Manhattan. One post remains: Fort Washington, high above the Hudson with 2,800 men inside — and your name on the gate. General Greene swears it can hold and choke British shipping. Your own eyes tell you this war is now about keeping the army alive, not keeping forts.',
        choices: [
          { t: 'Trust Greene — let the garrison hold the fort', real: 1 },
          { t: 'Overrule him and evacuate the 2,800 across the river' },
        ],
        outcome: 'Washington deferred to Greene against his own instinct — and watched from across the Hudson as the fort fell in a single afternoon. Nearly 3,000 men marched into captivity so brutal that most did not survive it. He never forgot the lesson: being talked out of his own judgment had cost him a tenth of his army.',
        alt: 'Evacuation was the right call, and Washington half-knew it — he had all but written the order. If you chose it, you out-generaled the real Washington on his worst day of the war.',
      },
      {
        k: 'December 25, 1776 · the Delaware River', t: 'Victory or death',
        scene: 'The army is dissolving in the snow — a few thousand men left, and most enlistments expire in six days. Congress has already fled Philadelphia. Across an ice-choked river sit the Hessians at Trenton: professional soldiers, warm at their winter fires, certain no one campaigns in this weather. The watchword for the operation, if you dare order it, is already chosen: “Victory or Death.”',
        choices: [
          { t: 'Cross tonight, in the storm, and hit Trenton at dawn', real: 1 },
          { t: 'Go into winter quarters and rebuild in the spring' },
        ],
        outcome: 'They crossed through a nor’easter, marched nine icy miles, and took nearly nine hundred Hessians at dawn without a single American killed in the fighting. Days later, Washington personally begged his veterans to stay six weeks past their enlistments — and enough of them did. The Revolution had a pulse again.',
        alt: 'There was no spring army to rebuild: the enlistments simply ended on December 31. Historians are unusually blunt about this one — winter quarters likely means the Continental Army quietly ceases to exist, and the Revolution with it.',
      },
      {
        k: 'January 2, 1777 · Assunpink Creek, Trenton', t: 'The old fox',
        scene: 'Cornwallis has marched south with thousands of regulars and pinned you against the Delaware — the river at your back, his dead piled at the bridge your cannon held three times this evening. “We’ve got the old fox safe now,” he tells his officers. “We’ll bag him in the morning.” Your campfires are burning high. Morning is five hours away.',
        choices: [
          { t: 'Leave the fires burning and slip around his flank in the dark', real: 1 },
          { t: 'Hold the creek line and fight him at dawn' },
        ],
        outcome: 'Muffled wheels, whispered orders, a rear guard feeding the fires — by dawn the army had vanished, and Cornwallis heard cannon fire from Princeton, miles behind him, where Washington was mauling his rearguard. Within days the British gave up most of New Jersey.',
        alt: 'The creek had held for one evening — but Cornwallis planned a full morning assault at the fords, with overwhelming numbers and a river cutting off retreat. Historians rate it among the war’s likeliest catastrophes: no escape, no army, and perhaps no Washington.',
      },
      {
        k: 'Winter 1777 · Morristown', t: 'The invisible enemy',
        scene: 'Smallpox is killing more of your men than the British are — it wrecked the army that invaded Canada — and dread of it scares recruits away. There is a way out, and it is terrifying: variolation, deliberately infecting every soldier with a mild dose. Perhaps one man in a hundred will die of it, and whole regiments will be helpless for weeks while they recover. Congress has forbidden the practice in the army. If the British attack mid-treatment, the war is over.',
        choices: [
          { t: 'Inoculate the entire army — secretly, and in waves', real: 1 },
          { t: 'Forbid it: quarantine the sick and pray the pox passes' },
        ],
        outcome: 'He ordered it done in secret and in stages, so part of the army was always fit to fight. Smallpox all but disappeared from the ranks — of every disease that stalked the war, this was the one Washington beat outright, and historians rank the order among his greatest decisions.',
        alt: 'Quarantine had already failed — the pox had done as much as the British to destroy the American army outside Quebec. Most historians think an uninoculated army loses to the virus long before it loses to Cornwallis.',
      },
      {
        k: 'August 1781 · outside New York', t: 'The letter from the admiral',
        scene: 'For two years you have planned one battle above all: retaking New York, the city that humiliated you. Now a letter changes everything. Admiral de Grasse’s French fleet is sailing not for New York but for the Chesapeake — and can stay only until mid-October — while Cornwallis fortifies a Virginia tobacco port called Yorktown, 450 miles away. Rochambeau, your French counterpart, has been politely urging Virginia all along.',
        choices: [
          { t: 'Let go of New York — race the army south and trap Cornwallis', real: 1 },
          { t: 'The fleet can support you here: strike New York at last' },
        ],
        outcome: 'He gave up the plan he loved, faked preparations against New York — decoy camps, boats, bread ovens — and marched 450 miles in secrecy. The French fleet turned the Royal Navy away at sea; Cornwallis, sealed off, surrendered some 8,000 men on October 19. When the news reached London, the prime minister took it “like a ball in the breast”: “Oh God, it is all over.”',
        alt: 'New York was the most fortified position in North America, and de Grasse himself had refused to risk his big ships at its harbor bar. Historians see a bloody repulse — with the French fleet’s brief window, and perhaps the alliance’s patience, wasted for it.',
      },
    ],
    fate: 'Two years later Washington did the most shocking thing of all: he won, and then gave the army back. King George III reportedly said that if Washington surrendered power he would be the greatest man in the world. He surrendered it twice — once as general, once as president.',
  },
];

window.H_XR_BY_ID = Object.fromEntries(window.H_CROSSROADS.map((s) => [s.id, s]));
