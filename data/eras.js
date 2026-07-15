'use strict';
/* Historia — era definitions. Every event/figure/story hangs off one of these.
 * Each era has its own color identity used across the timeline bands, era
 * pages, chips and story covers. Years: negative = BCE. */
window.H_ERAS = [
  {
    k: 'ancient', label: 'Ancient World', emoji: '🏛️', from: -3100, to: 500,
    color: '#d4a24c',
    intro: 'Five thousand years ago humans invented writing, cities, money and empire — then spent three millennia perfecting all four. Pyramids rise, Athens votes, Rome conquers everything it can see, and the foundations of law, philosophy and engineering are poured.',
  },
  {
    k: 'medieval', label: 'Middle Ages', emoji: '🏰', from: 500, to: 1400,
    color: '#9d7bdb',
    intro: 'Rome falls and the world reorganizes: Islam rises in a single lifetime, Vikings raid and trade from Baghdad to Newfoundland, the Mongols build the largest land empire ever, and a plague kills a third of Europe. Not dark — just on fire.',
  },
  {
    k: 'renaissance', label: 'Renaissance & Discovery', emoji: '⛵', from: 1400, to: 1600,
    color: '#4f9dd6',
    intro: 'Printing presses, caravels and oil paint. Europe rediscovers the classics, breaks Christianity in half, and stumbles into two continents it didn’t know existed — with world-changing and devastating consequences.',
  },
  {
    k: 'earlymodern', label: 'Early Modern', emoji: '👑', from: 1600, to: 1765,
    color: '#4cb28a',
    intro: 'Science becomes a method, not a hobby. Newton writes the operating manual for the universe, empires plant flags and colonies across the globe, and coffee-house arguments start turning into revolutions.',
  },
  {
    k: 'revolutions', label: 'Age of Revolutions', emoji: '🗽', from: 1765, to: 1850,
    color: '#e0684b',
    intro: 'The age when ordinary people fired the monarchy. America declares independence in Philadelphia, France guillotines its king, Haiti frees itself, and the idea that governments answer to the governed goes global.',
  },
  {
    k: 'industrial', label: 'Industrial Age', emoji: '⚙️', from: 1850, to: 1914,
    color: '#b0a13f',
    intro: 'Steam, steel and speed. Railroads staple continents together, Darwin and Edison rewrite what’s possible, America tears itself apart and stitches itself back together, and the telephone is born in Philadelphia.',
  },
  {
    k: 'worldwars', label: 'World Wars', emoji: '⚔️', from: 1914, to: 1945,
    color: '#c94f5c',
    intro: 'Thirty-one years that broke the old world twice. Two global wars, a pandemic, a depression — and out of the wreckage, the modern world order, the atom split, and a warning humanity is still processing.',
  },
  {
    k: 'coldwar', label: 'Cold War & Space Age', emoji: '🚀', from: 1945, to: 1991,
    color: '#46b8c9',
    intro: 'Two superpowers, zero direct wars, one very close call over Cuba. The competition goes everywhere — Berlin, orbit, the Moon — while empires dissolve, walls rise and fall, and the civil rights movement remakes America.',
  },
  {
    k: 'modern', label: 'Information Age', emoji: '💻', from: 1991, to: 2030,
    color: '#7aa7f0',
    intro: 'The web connects everyone, the genome is read, a phone becomes a supercomputer, and history starts happening faster than anyone can write it down. You are here.',
  },
];

window.H_ERA_BY_KEY = Object.fromEntries(window.H_ERAS.map((e) => [e.k, e]));
window.H_ERA_OF_YEAR = (y) => window.H_ERAS.find((e) => y >= e.from && y < e.to) || window.H_ERAS[window.H_ERAS.length - 1];
