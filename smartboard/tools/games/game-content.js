'use strict';

// ═══════════════════════════════════════════════════════════
// SMART BOARD GAMES — SAMPLE CONTENT
// Demonstration content only. It is NOT official curriculum content and makes no syllabus claim.
// Replace or extend any list below with teacher-created content; the games read this structure
// and contain no content of their own. (Extension point: a teacher editor can write the same shape.)
// ═══════════════════════════════════════════════════════════
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GameContent = api;
})(typeof self !== 'undefined' ? self : this, function () {
  const LABEL = 'Sample content — replace with your own questions';

  /** Games shown in the hub. Categories match the hub filters. */
  const catalog = [
    { id: 'trivia', name: 'Trivia Board', icon: '🏆', category: 'Quiz', desc: 'Teams pick a category and points, reveal the answer and score.' },
    { id: 'memory', name: 'Memory Match', icon: '🃏', category: 'Memory', desc: 'Flip two cards at a time and match each term with its meaning.' },
    { id: 'pictionary', name: 'Draw & Guess', icon: '🎨', category: 'Drawing', desc: 'One player draws a secret word against the clock; the class guesses.' },
    { id: 'hangman', name: 'Word Guess', icon: '🔤', category: 'Quiz', desc: 'Guess the hidden word letter by letter before the energy runs out.' },
    { id: 'sorting', name: 'Category Sort', icon: '🗂️', category: 'Sorting', desc: 'Drag each card into the right group, then check your answers.' },
    { id: 'sequence', name: 'Sequence Builder', icon: '🔢', category: 'Sequence', desc: 'Put the steps of a process or timeline into the right order.' },
    { id: 'spot', name: 'Spot the Difference', icon: '🔍', category: 'Observation', desc: 'Find every difference between two pictures.' },
    { id: 'race', name: 'Board Race', icon: '🏁', category: 'Team Competition', desc: '2–4 teams race side by side — keypad, choices or scratch pad.' },
    { id: 'boardgame', name: 'Quiz Path', icon: '🎲', category: 'Board Game', desc: 'Teams roll the dice, race along the path and answer question spaces.' },
    { id: 'circle', name: 'Circle Challenge', icon: '⭕', category: 'Drawing', desc: 'Just draw one circle — your accuracy % appears inside it.' }
  ];

  const trivia = {
    categories: [
      { name: 'Maths', questions: [
        { value: 100, q: 'What is 7 × 8?', a: '56' },
        { value: 200, q: 'What is the square root of 144?', a: '12' },
        { value: 300, q: 'What do the interior angles of a triangle add up to?', a: '180°' },
        { value: 400, q: 'What is 15% of 200?', a: '30' },
        { value: 500, q: 'What is the next prime number after 29?', a: '31' }
      ] },
      { name: 'Science', questions: [
        { value: 100, q: 'Which gas do plants take in for photosynthesis?', a: 'Carbon dioxide (CO₂)' },
        { value: 200, q: 'What substance has the formula H₂O?', a: 'Water' },
        { value: 300, q: 'Which planet is closest to the Sun?', a: 'Mercury' },
        { value: 400, q: 'What is the SI unit of force?', a: 'The newton (N)' },
        { value: 500, q: 'Roughly how fast does light travel in a vacuum?', a: 'About 3 × 10⁸ metres per second' }
      ] },
      { name: 'Computers', questions: [
        { value: 100, q: 'How many bits are in one byte?', a: '8' },
        { value: 200, q: 'What does CPU stand for?', a: 'Central Processing Unit' },
        { value: 300, q: 'What is the binary number 1010 in decimal?', a: '10' },
        { value: 400, q: 'Which data structure is "last in, first out"?', a: 'A stack' },
        { value: 500, q: 'Hexadecimal numbers use which base?', a: 'Base 16' }
      ] },
      { name: 'World', questions: [
        { value: 100, q: 'Which is the largest ocean on Earth?', a: 'The Pacific Ocean' },
        { value: 200, q: 'On which continent is Nepal?', a: 'Asia' },
        { value: 300, q: 'What is the highest mountain above sea level?', a: 'Mount Everest' },
        { value: 400, q: 'Which is the largest planet in our solar system?', a: 'Jupiter' },
        { value: 500, q: 'How many minutes are there in a full day?', a: '1,440' }
      ] }
    ]
  };

  /** Term / meaning pairs for Memory Match. */
  const memory = [
    { a: 'Photosynthesis', b: 'How plants make food using light' },
    { a: 'Evaporation', b: 'A liquid changing into a gas' },
    { a: 'Perimeter', b: 'The distance around a shape' },
    { a: 'Prime number', b: 'Has exactly two factors' },
    { a: 'Atom', b: 'Smallest unit of an element' },
    { a: 'Mammal', b: 'Feeds its young with milk' },
    { a: 'Fraction', b: 'A part of a whole' },
    { a: 'Gravity', b: 'Force that pulls masses together' },
    { a: 'Algorithm', b: 'Step-by-step instructions' },
    { a: 'Vertex', b: 'A corner where edges meet' },
    { a: 'H₂O', b: 'Water' },
    { a: 'Right angle', b: 'Exactly 90°' }
  ];

  const hangman = [
    { word: 'ATOM', hint: 'The building block of all matter' },
    { word: 'GRAVITY', hint: 'Keeps your feet on the ground' },
    { word: 'FRACTION', hint: 'One half is one of these' },
    { word: 'TRIANGLE', hint: 'A shape with three sides' },
    { word: 'ALGORITHM', hint: 'A set of steps to solve a problem' },
    { word: 'VOLCANO', hint: 'A mountain that can erupt' },
    { word: 'MAGNET', hint: 'Attracts iron' },
    { word: 'HYPOTENUSE', hint: 'Longest side of a right-angled triangle' },
    { word: 'EQUATION', hint: 'Has an equals sign' },
    { word: 'MOLECULE', hint: 'Two or more atoms joined together' },
    { word: 'KEYBOARD', hint: 'You type on it' },
    { word: 'SOLAR SYSTEM', hint: 'The Sun and everything that orbits it' }
  ];

  const pictionary = [
    'Sun', 'Rocket', 'Volcano', 'Microscope', 'Triangle', 'Rainbow', 'Magnet', 'Butterfly', 'Light bulb', 'Mountain',
    'Clock', 'Bridge', 'Tree', 'Fish', 'Computer', 'Umbrella', 'Planet', 'Battery', 'Thermometer', 'Compass'
  ];

  /** Word Guess sample categories (hint = clue shown when the class asks for it). */
  const wordCategories = [
    { id: 'science', name: '🔬 Science', words: [
      { word: 'ATOM', hint: 'The building block of all matter' }, { word: 'GRAVITY', hint: 'Keeps your feet on the ground' },
      { word: 'MOLECULE', hint: 'Two or more atoms joined together' }, { word: 'MAGNET', hint: 'Attracts iron' },
      { word: 'EVAPORATION', hint: 'A liquid turning into a gas' }, { word: 'PHOTOSYNTHESIS', hint: 'How plants make food using light' },
      { word: 'VOLCANO', hint: 'A mountain that can erupt' }, { word: 'OXYGEN', hint: 'The gas we need to breathe' }
    ] },
    { id: 'maths', name: '📐 Maths', words: [
      { word: 'FRACTION', hint: 'One half is one of these' }, { word: 'TRIANGLE', hint: 'A shape with three sides' },
      { word: 'HYPOTENUSE', hint: 'Longest side of a right-angled triangle' }, { word: 'EQUATION', hint: 'Has an equals sign' },
      { word: 'PERIMETER', hint: 'The distance around a shape' }, { word: 'DIAMETER', hint: 'Straight across a circle through the centre' },
      { word: 'PARALLEL', hint: 'Lines that never meet' }, { word: 'DENOMINATOR', hint: 'The bottom number of a fraction' }
    ] },
    { id: 'computers', name: '💻 Computers', words: [
      { word: 'ALGORITHM', hint: 'A set of steps to solve a problem' }, { word: 'KEYBOARD', hint: 'You type on it' },
      { word: 'PROCESSOR', hint: 'The brain of a computer' }, { word: 'NETWORK', hint: 'Computers connected together' },
      { word: 'VARIABLE', hint: 'A named box that stores a value' }, { word: 'BINARY', hint: 'Numbers made of 0s and 1s' },
      { word: 'SOFTWARE', hint: 'Programs that run on a computer' }, { word: 'INTERNET', hint: 'The worldwide network' }
    ] },
    { id: 'world', name: '🌍 World', words: [
      { word: 'CONTINENT', hint: 'Asia is one of these' }, { word: 'SOLAR SYSTEM', hint: 'The Sun and everything that orbits it' },
      { word: 'EQUATOR', hint: 'An imaginary line around the middle of the Earth' }, { word: 'KATHMANDU', hint: 'The capital city of Nepal' },
      { word: 'MOUNT EVEREST', hint: 'The highest mountain above sea level' }, { word: 'PACIFIC OCEAN', hint: 'The largest ocean' },
      { word: 'ATMOSPHERE', hint: 'The layer of air around the Earth' }, { word: 'MONSOON', hint: 'A rainy season wind' }
    ] }
  ];

  /** Draw & Guess sample categories (hint = optional clue the teacher can show). */
  const drawCategories = [
    { id: 'science', name: '🔬 Science', words: [
      { word: 'Microscope', hint: 'Makes tiny things look big' }, { word: 'Volcano', hint: 'A mountain that erupts' }, { word: 'Magnet', hint: 'Attracts iron' },
      { word: 'Rainbow', hint: 'Seven colours after rain' }, { word: 'Thermometer', hint: 'Measures temperature' }, { word: 'Battery', hint: 'Stores electricity' },
      { word: 'Planet', hint: 'Orbits a star' }, { word: 'Light bulb', hint: 'Glows when switched on' }, { word: 'Skeleton', hint: 'All the bones of the body' }, { word: 'Lightning', hint: 'A flash in a storm' }
    ] },
    { id: 'maths', name: '📐 Maths', words: [
      { word: 'Triangle', hint: 'Three sides' }, { word: 'Circle', hint: 'Perfectly round' }, { word: 'Clock', hint: 'Tells the time' }, { word: 'Ruler', hint: 'Measures length' },
      { word: 'Pie chart', hint: 'A circle cut into slices' }, { word: 'Cube', hint: 'Six square faces' }, { word: 'Protractor', hint: 'Measures angles' }, { word: 'Calculator', hint: 'Does sums for you' }
    ] },
    { id: 'animals', name: '🐾 Animals', words: [
      { word: 'Butterfly', hint: 'Was once a caterpillar' }, { word: 'Elephant', hint: 'Has a trunk' }, { word: 'Fish', hint: 'Breathes with gills' }, { word: 'Snake', hint: 'No legs' },
      { word: 'Owl', hint: 'Awake at night' }, { word: 'Giraffe', hint: 'Very long neck' }, { word: 'Penguin', hint: 'A bird that cannot fly' }, { word: 'Spider', hint: 'Eight legs' }
    ] },
    { id: 'objects', name: '🎒 Everyday things', words: [
      { word: 'Umbrella', hint: 'Keeps you dry' }, { word: 'Bicycle', hint: 'Two wheels and pedals' }, { word: 'Computer', hint: 'Has a keyboard' }, { word: 'Bridge', hint: 'Crosses a river' },
      { word: 'Compass', hint: 'Points north' }, { word: 'Rocket', hint: 'Flies to space' }, { word: 'Mountain', hint: 'Very high land' }, { word: 'Tree', hint: 'Has leaves and roots' }, { word: 'Sun', hint: 'Our nearest star' }
    ] }
  ];

  const sorting = [
    { id: 'matter', title: 'States of matter', categories: [{ id: 'solid', name: 'Solid' }, { id: 'liquid', name: 'Liquid' }, { id: 'gas', name: 'Gas' }],
      items: [
        { id: 'm1', text: 'Ice', cat: 'solid' }, { id: 'm2', text: 'Stone', cat: 'solid' }, { id: 'm3', text: 'Wood', cat: 'solid' },
        { id: 'm4', text: 'Water', cat: 'liquid' }, { id: 'm5', text: 'Milk', cat: 'liquid' }, { id: 'm6', text: 'Cooking oil', cat: 'liquid' },
        { id: 'm7', text: 'Steam', cat: 'gas' }, { id: 'm8', text: 'Oxygen', cat: 'gas' }, { id: 'm9', text: 'Helium', cat: 'gas' }
      ] },
    { id: 'primes', title: 'Prime or composite?', categories: [{ id: 'prime', name: 'Prime' }, { id: 'composite', name: 'Composite' }],
      items: [
        { id: 'n1', text: '2', cat: 'prime' }, { id: 'n2', text: '7', cat: 'prime' }, { id: 'n3', text: '11', cat: 'prime' }, { id: 'n4', text: '13', cat: 'prime' },
        { id: 'n5', text: '4', cat: 'composite' }, { id: 'n6', text: '9', cat: 'composite' }, { id: 'n7', text: '15', cat: 'composite' }, { id: 'n8', text: '21', cat: 'composite' }
      ] },
    { id: 'animals', title: 'Animal groups', categories: [{ id: 'mammal', name: 'Mammal' }, { id: 'bird', name: 'Bird' }, { id: 'fish', name: 'Fish' }],
      items: [
        { id: 'a1', text: 'Dog', cat: 'mammal' }, { id: 'a2', text: 'Whale', cat: 'mammal' }, { id: 'a3', text: 'Bat', cat: 'mammal' },
        { id: 'a4', text: 'Eagle', cat: 'bird' }, { id: 'a5', text: 'Penguin', cat: 'bird' }, { id: 'a6', text: 'Parrot', cat: 'bird' },
        { id: 'a7', text: 'Shark', cat: 'fish' }, { id: 'a8', text: 'Salmon', cat: 'fish' }, { id: 'a9', text: 'Goldfish', cat: 'fish' }
      ] }
  ];

  sorting.push(
    { id: 'living', title: 'Living or non-living?', categories: [{ id: 'living', name: 'Living' }, { id: 'nonliving', name: 'Non-living' }],
      items: [
        { id: 'l1', text: 'Tree', cat: 'living' }, { id: 'l2', text: 'Mushroom', cat: 'living' }, { id: 'l3', text: 'Bird', cat: 'living' }, { id: 'l4', text: 'Bacteria', cat: 'living' },
        { id: 'l5', text: 'Rock', cat: 'nonliving' }, { id: 'l6', text: 'Water', cat: 'nonliving' }, { id: 'l7', text: 'Bicycle', cat: 'nonliving' }, { id: 'l8', text: 'Cloud', cat: 'nonliving' }
      ] },
    { id: 'energy', title: 'Energy sources', categories: [{ id: 'renew', name: 'Renewable' }, { id: 'nonrenew', name: 'Non-renewable' }],
      items: [
        { id: 'e1', text: 'Solar', cat: 'renew' }, { id: 'e2', text: 'Wind', cat: 'renew' }, { id: 'e3', text: 'Hydropower', cat: 'renew' }, { id: 'e4', text: 'Geothermal', cat: 'renew' },
        { id: 'e5', text: 'Coal', cat: 'nonrenew' }, { id: 'e6', text: 'Petrol', cat: 'nonrenew' }, { id: 'e7', text: 'Natural gas', cat: 'nonrenew' }, { id: 'e8', text: 'Diesel', cat: 'nonrenew' }
      ] }
  );

  /** Steps in the correct order. Cards with the same `same` key have identical labels and are interchangeable. */
  const sequences = [
    { id: 'water', title: 'The water cycle', steps: [
      { id: 'w1', text: 'Evaporation — the Sun heats water into vapour' },
      { id: 'w2', text: 'Condensation — vapour cools into clouds' },
      { id: 'w3', text: 'Precipitation — rain or snow falls' },
      { id: 'w4', text: 'Collection — water gathers in rivers and seas' }
    ] },
    { id: 'method', title: 'Doing an experiment', steps: [
      { id: 'e1', text: 'Ask a question' }, { id: 'e2', text: 'Find out what is already known' }, { id: 'e3', text: 'Make a prediction (hypothesis)' },
      { id: 'e4', text: 'Do the experiment' }, { id: 'e5', text: 'Record and analyse the results' }, { id: 'e6', text: 'Write a conclusion' }
    ] },
    { id: 'triangle', title: 'Constructing a triangle', steps: [
      { id: 't1', text: 'Mark three points that are not in a line' },
      { id: 't2', text: 'Draw a side with a ruler', same: 'side' },
      { id: 't3', text: 'Draw a side with a ruler', same: 'side' },
      { id: 't4', text: 'Draw a side with a ruler', same: 'side' },
      { id: 't5', text: 'Label the corners A, B and C' },
      { id: 't6', text: 'Measure the three angles' }
    ] },
    { id: 'plant', title: 'Life cycle of a flowering plant', steps: [
      { id: 'p1', text: 'Seed' }, { id: 'p2', text: 'Germination' }, { id: 'p3', text: 'Seedling' },
      { id: 'p4', text: 'Adult plant' }, { id: 'p5', text: 'Flowering' }, { id: 'p6', text: 'Fruit with new seeds' }
    ] }
  ];

  /**
   * Spot the difference: original simple vector scenes (400 × 300). `only: 'a' | 'b'` marks an element
   * that appears in one picture. Hotspots are normalised: x = px / 400, y = py / 300, r in image heights.
   */
  const spot = [
    { id: 'park', title: 'In the park', w: 400, h: 300,
      elements: [
        { t: 'rect', x: 0, y: 0, w: 400, h: 200, fill: '#bfe3ff' },
        { t: 'rect', x: 0, y: 200, w: 400, h: 100, fill: '#8fd16a' },
        { t: 'circle', cx: 340, cy: 50, r: 24, fill: '#fcd34d' },
        { t: 'ellipse', cx: 90, cy: 55, rx: 30, ry: 14, fill: '#ffffff', only: 'a' },
        { t: 'ellipse', cx: 115, cy: 47, rx: 22, ry: 14, fill: '#ffffff', only: 'a' },
        { t: 'rect', x: 150, y: 120, w: 110, h: 90, fill: '#fca5a5' },
        { t: 'poly', points: '140,120 205,75 270,120', fill: '#b91c1c' },
        { t: 'rect', x: 165, y: 140, w: 30, h: 26, fill: '#e0f2fe', stroke: '#1e3a8a', sw: 2, only: 'a' },
        { t: 'rect', x: 215, y: 160, w: 28, h: 50, fill: '#7c2d12' },
        { t: 'rect', x: 312, y: 140, w: 16, h: 70, fill: '#92400e' },
        { t: 'circle', cx: 320, cy: 125, r: 38, fill: '#15803d' },
        { t: 'circle', cx: 333, cy: 112, r: 6, fill: '#dc2626', only: 'b' },
        { t: 'circle', cx: 60, cy: 240, r: 8, fill: '#f472b6' },
        { t: 'circle', cx: 95, cy: 250, r: 8, fill: '#f472b6' },
        { t: 'circle', cx: 130, cy: 242, r: 8, fill: '#f472b6', only: 'b' },
        { t: 'path', d: 'M40 100 q10 -10 20 0 q10 -10 20 0', stroke: '#1f2937', sw: 3, fill: 'none', only: 'a' }
      ],
      hotspots: [
        { id: 'cloud', x: 0.25, y: 0.173, r: 0.12, label: 'The cloud is missing' },
        { id: 'window', x: 0.45, y: 0.51, r: 0.09, label: 'The window is missing' },
        { id: 'apple', x: 0.8325, y: 0.373, r: 0.07, label: 'An apple appeared on the tree' },
        { id: 'flower', x: 0.325, y: 0.807, r: 0.075, label: 'There is an extra flower' },
        { id: 'bird', x: 0.15, y: 0.32, r: 0.08, label: 'The bird is missing' }
      ] },
    { id: 'lab', title: 'On the lab bench', w: 400, h: 300,
      elements: [
        { t: 'rect', x: 0, y: 0, w: 400, h: 300, fill: '#eef2ff' },
        { t: 'rect', x: 0, y: 210, w: 400, h: 90, fill: '#a16207' },
        { t: 'circle', cx: 70, cy: 60, r: 28, fill: '#ffffff', stroke: '#334155', sw: 3 },
        { t: 'line', x1: 70, y1: 60, x2: 70, y2: 40, stroke: '#0f172a', sw: 3, only: 'a' },
        { t: 'line', x1: 70, y1: 60, x2: 88, y2: 60, stroke: '#0f172a', sw: 3, only: 'b' },
        { t: 'line', x1: 70, y1: 60, x2: 82, y2: 72, stroke: '#0f172a', sw: 2 },
        { t: 'rect', x: 122, y: 170, w: 46, h: 38, fill: '#60a5fa', only: 'a' },
        { t: 'rect', x: 122, y: 190, w: 46, h: 18, fill: '#60a5fa', only: 'b' },
        { t: 'rect', x: 120, y: 140, w: 50, h: 70, fill: 'none', stroke: '#475569', sw: 3 },
        { t: 'poly', points: '220,210 260,210 248,170 248,140 232,140 232,170', fill: '#bbf7d0', stroke: '#166534', sw: 2 },
        { t: 'rect', x: 290, y: 180, w: 20, h: 30, fill: '#475569' },
        { t: 'ellipse', cx: 300, cy: 168, rx: 7, ry: 12, fill: '#fb923c', only: 'a' },
        { t: 'rect', x: 330, y: 190, w: 62, h: 8, fill: '#78350f' },
        { t: 'rect', x: 338, y: 150, w: 10, h: 44, fill: '#fde68a', stroke: '#92400e', sw: 2 },
        { t: 'rect', x: 356, y: 150, w: 10, h: 44, fill: '#fde68a', stroke: '#92400e', sw: 2 },
        { t: 'rect', x: 374, y: 150, w: 10, h: 44, fill: '#fde68a', stroke: '#92400e', sw: 2, only: 'a' },
        { t: 'rect', x: 170, y: 20, w: 90, h: 70, fill: '#ffffff', stroke: '#94a3b8', sw: 2 },
        { t: 'ellipse', cx: 215, cy: 55, rx: 30, ry: 12, fill: 'none', stroke: '#6366f1', sw: 2 },
        { t: 'circle', cx: 215, cy: 55, r: 6, fill: '#ef4444' },
        { t: 'circle', cx: 245, cy: 55, r: 4, fill: '#1e40af' },
        { t: 'circle', cx: 185, cy: 55, r: 4, fill: '#1e40af', only: 'a' }
      ],
      hotspots: [
        { id: 'clock', x: 0.175, y: 0.2, r: 0.11, label: 'The clock shows a different time' },
        { id: 'beaker', x: 0.3625, y: 0.6, r: 0.11, label: 'Less liquid in the beaker' },
        { id: 'flame', x: 0.75, y: 0.56, r: 0.08, label: 'The burner flame is out' },
        { id: 'tube', x: 0.9475, y: 0.573, r: 0.08, label: 'A test tube is missing' },
        { id: 'electron', x: 0.4625, y: 0.183, r: 0.07, label: 'An electron is missing from the poster' }
      ] }
  ];

  spot.push(
    { id: 'space', title: 'Night sky', w: 400, h: 300,
      elements: [
        { t: 'rect', x: 0, y: 0, w: 400, h: 300, fill: '#0b1026' },
        { t: 'circle', cx: 330, cy: 60, r: 28, fill: '#f1f5f9' }, { t: 'circle', cx: 322, cy: 55, r: 5, fill: '#cbd5e1' }, { t: 'circle', cx: 342, cy: 70, r: 4, fill: '#cbd5e1' },
        { t: 'circle', cx: 40, cy: 40, r: 2, fill: '#fde68a' }, { t: 'circle', cx: 80, cy: 90, r: 2, fill: '#fde68a' }, { t: 'circle', cx: 150, cy: 30, r: 2, fill: '#fde68a' },
        { t: 'circle', cx: 200, cy: 70, r: 2, fill: '#fde68a' }, { t: 'circle', cx: 260, cy: 40, r: 2, fill: '#fde68a' }, { t: 'circle', cx: 120, cy: 140, r: 2, fill: '#fde68a' },
        { t: 'circle', cx: 60, cy: 200, r: 2, fill: '#fde68a' }, { t: 'circle', cx: 370, cy: 160, r: 2, fill: '#fde68a' }, { t: 'circle', cx: 300, cy: 260, r: 2, fill: '#fde68a' },
        { t: 'circle', cx: 180, cy: 200, r: 3, fill: '#fde68a', only: 'a' }, { t: 'circle', cx: 192, cy: 212, r: 3, fill: '#fde68a', only: 'a' }, { t: 'circle', cx: 202, cy: 196, r: 3, fill: '#fde68a', only: 'a' },
        { t: 'circle', cx: 110, cy: 235, r: 30, fill: '#f97316' },
        { t: 'ellipse', cx: 110, cy: 235, rx: 50, ry: 11, fill: 'none', stroke: '#fde68a', sw: 4, only: 'a' },
        { t: 'poly', points: '255,185 270,135 285,185', fill: '#e2e8f0' }, { t: 'rect', x: 255, y: 185, w: 30, h: 38, fill: '#e2e8f0' },
        { t: 'poly', points: '255,205 243,226 255,223', fill: '#ef4444' }, { t: 'poly', points: '285,205 297,226 285,223', fill: '#ef4444' },
        { t: 'circle', cx: 270, cy: 175, r: 7, fill: '#38bdf8', only: 'a' },
        { t: 'poly', points: '260,223 270,248 280,223', fill: '#f59e0b' },
        { t: 'line', x1: 40, y1: 125, x2: 88, y2: 102, stroke: '#93c5fd', sw: 3, only: 'b' }, { t: 'circle', cx: 90, cy: 101, r: 6, fill: '#dbeafe', only: 'b' },
        { t: 'circle', cx: 372, cy: 112, r: 9, fill: '#a5b4fc', only: 'b' }
      ],
      hotspots: [
        { id: 'stars', x: 0.475, y: 0.68, r: 0.08, label: 'Three bright stars are missing' },
        { id: 'ring', x: 0.275, y: 0.783, r: 0.15, label: 'The planet lost its ring' },
        { id: 'window', x: 0.675, y: 0.583, r: 0.07, label: 'The rocket window is missing' },
        { id: 'comet', x: 0.16, y: 0.38, r: 0.1, label: 'A comet appeared' },
        { id: 'moon2', x: 0.93, y: 0.373, r: 0.07, label: 'A second small moon appeared' }
      ] },
    { id: 'classroom', title: 'In the classroom', w: 400, h: 300,
      elements: [
        { t: 'rect', x: 0, y: 0, w: 400, h: 300, fill: '#fef3c7' }, { t: 'rect', x: 0, y: 232, w: 400, h: 68, fill: '#d6a26b' },
        { t: 'rect', x: 40, y: 30, w: 200, h: 110, fill: '#14532d', stroke: '#78350f', sw: 6 },
        { t: 'poly', points: '80,112 120,52 160,112', fill: 'none', stroke: '#f8fafc', sw: 3, only: 'a' },
        { t: 'circle', cx: 120, cy: 84, r: 30, fill: 'none', stroke: '#f8fafc', sw: 3, only: 'b' },
        { t: 'line', x1: 172, y1: 62, x2: 222, y2: 62, stroke: '#f8fafc', sw: 3 }, { t: 'line', x1: 172, y1: 82, x2: 212, y2: 82, stroke: '#f8fafc', sw: 3 },
        { t: 'circle', cx: 320, cy: 60, r: 26, fill: '#ffffff', stroke: '#334155', sw: 3 },
        { t: 'line', x1: 320, y1: 60, x2: 320, y2: 42, stroke: '#0f172a', sw: 3 },
        { t: 'line', x1: 320, y1: 60, x2: 336, y2: 60, stroke: '#0f172a', sw: 3, only: 'a' }, { t: 'line', x1: 320, y1: 60, x2: 305, y2: 71, stroke: '#0f172a', sw: 3, only: 'b' },
        { t: 'rect', x: 280, y: 110, w: 90, h: 70, fill: '#bae6fd', stroke: '#475569', sw: 4 },
        { t: 'line', x1: 325, y1: 110, x2: 325, y2: 180, stroke: '#475569', sw: 4 },
        { t: 'line', x1: 280, y1: 145, x2: 370, y2: 145, stroke: '#475569', sw: 4, only: 'a' },
        { t: 'rect', x: 60, y: 200, w: 140, h: 12, fill: '#92400e' }, { t: 'rect', x: 70, y: 212, w: 8, h: 28, fill: '#92400e' }, { t: 'rect', x: 182, y: 212, w: 8, h: 28, fill: '#92400e' },
        { t: 'rect', x: 80, y: 186, w: 40, h: 14, fill: '#ef4444' },
        { t: 'rect', x: 128, y: 186, w: 32, h: 14, fill: '#3b82f6', only: 'b' },
        { t: 'rect', x: 330, y: 205, w: 30, h: 28, fill: '#b45309' },
        { t: 'circle', cx: 345, cy: 190, r: 17, fill: '#16a34a', only: 'a' }
      ],
      hotspots: [
        { id: 'shape', x: 0.3, y: 0.28, r: 0.14, label: 'The triangle on the board became a circle' },
        { id: 'clock', x: 0.8, y: 0.2, r: 0.1, label: 'The clock shows a different time' },
        { id: 'bar', x: 0.8125, y: 0.483, r: 0.1, label: 'A window bar is missing' },
        { id: 'book', x: 0.36, y: 0.643, r: 0.07, label: 'An extra book is on the desk' },
        { id: 'plant', x: 0.8625, y: 0.637, r: 0.08, label: 'The plant has no leaves' }
      ] },
    { id: 'sea', title: 'Under the sea', w: 400, h: 300,
      elements: [
        { t: 'rect', x: 0, y: 0, w: 400, h: 300, fill: '#0e7490' }, { t: 'rect', x: 0, y: 250, w: 400, h: 50, fill: '#fde68a' },
        { t: 'path', d: 'M40 250 q-10 -30 0 -60 q10 -30 0 -60', stroke: '#16a34a', sw: 7, fill: 'none', only: 'a' },
        { t: 'path', d: 'M40 250 q-10 -30 0 -60', stroke: '#16a34a', sw: 7, fill: 'none', only: 'b' },
        { t: 'path', d: 'M70 250 q8 -25 0 -50', stroke: '#22c55e', sw: 6, fill: 'none' },
        { t: 'ellipse', cx: 140, cy: 110, rx: 40, ry: 22, fill: '#f97316' }, { t: 'poly', points: '100,110 80,92 80,128', fill: '#f97316' },
        { t: 'rect', x: 132, y: 89, w: 8, h: 42, fill: '#ffffff', only: 'a' },
        { t: 'circle', cx: 162, cy: 104, r: 4, fill: '#0f172a' },
        { t: 'ellipse', cx: 300, cy: 170, rx: 30, ry: 16, fill: '#facc15' }, { t: 'poly', points: '330,170 348,156 348,184', fill: '#facc15' }, { t: 'circle', cx: 285, cy: 166, r: 3, fill: '#0f172a' },
        { t: 'circle', cx: 170, cy: 60, r: 6, fill: 'none', stroke: '#e0f2fe', sw: 2 }, { t: 'circle', cx: 180, cy: 40, r: 4, fill: 'none', stroke: '#e0f2fe', sw: 2 }, { t: 'circle', cx: 168, cy: 24, r: 3, fill: 'none', stroke: '#e0f2fe', sw: 2 },
        { t: 'circle', cx: 262, cy: 128, r: 6, fill: 'none', stroke: '#e0f2fe', sw: 2, only: 'b' }, { t: 'circle', cx: 270, cy: 108, r: 4, fill: 'none', stroke: '#e0f2fe', sw: 2, only: 'b' },
        { t: 'poly', points: '220.0,252.0 224.1,262.3 235.2,263.1 226.7,270.2 229.4,280.9 220.0,275.0 210.6,280.9 213.3,270.2 204.8,263.1 215.9,262.3', fill: '#fb7185', only: 'a' },
        { t: 'ellipse', cx: 340, cy: 268, rx: 18, ry: 10, fill: '#dc2626', only: 'b' }, { t: 'circle', cx: 320, cy: 256, r: 6, fill: '#dc2626', only: 'b' }, { t: 'circle', cx: 360, cy: 256, r: 6, fill: '#dc2626', only: 'b' }
      ],
      hotspots: [
        { id: 'stripe', x: 0.34, y: 0.367, r: 0.08, label: 'The orange fish lost its stripe' },
        { id: 'weed', x: 0.1, y: 0.43, r: 0.12, label: 'The seaweed is shorter' },
        { id: 'bubbles', x: 0.665, y: 0.393, r: 0.08, label: 'Extra bubbles appeared' },
        { id: 'starfish', x: 0.55, y: 0.893, r: 0.08, label: 'The starfish is missing' },
        { id: 'crab', x: 0.85, y: 0.873, r: 0.09, label: 'A crab appeared' }
      ] }
  );

  /** Quiz Path board: 30 spaces (0 = start, 29 = finish). */
  const boardGame = {
    def: {
      length: 30,
      specials: { 4: 'question', 9: 'question', 13: 'question', 18: 'question', 22: 'question', 26: 'question', 7: 'boost', 16: 'boost', 11: 'slip', 24: 'slip' },
      boost: 2, slip: 2, bonus: 1
    },
    rules: [
      'Take turns to roll the dice and move forward.',
      '❓ Question space: answer correctly to keep the move and go 1 space further. A wrong answer sends you back to where you started this turn.',
      '⏩ Boost space: jump 2 spaces forward.  ⏪ Slip space: slide 2 spaces back.',
      'If your roll goes past the finish, you stop on the finish — and win!'
    ],
    questions: [
      { q: 'What is 9 × 6?', a: '54' }, { q: 'Name the planet known as the Red Planet.', a: 'Mars' },
      { q: 'How many sides does a hexagon have?', a: '6' }, { q: 'What is the boiling point of water at sea level?', a: '100 °C' },
      { q: 'What is half of 250?', a: '125' }, { q: 'Which organ pumps blood around the body?', a: 'The heart' },
      { q: 'What is 2 to the power of 5?', a: '32' }, { q: 'What do bees make?', a: 'Honey' },
      { q: 'How many degrees are in a right angle?', a: '90' }, { q: 'Which gas do we need to breathe to stay alive?', a: 'Oxygen' },
      { q: 'What is 100 − 37?', a: '63' }, { q: 'What is frozen water called?', a: 'Ice' }
    ]
  };

  /** Quiz Path question sets (sample). choices = wrong options → multiple choice; none → the teacher judges. */
  const quizPathSets = [
    { id: 'general', title: 'General knowledge', questions: boardGame.questions.map((x) => ({ q: x.q, a: x.a })) },
    { id: 'maths', title: 'Quick maths', questions: [
      { q: 'What is 7 × 8?', a: '56', choices: ['54', '48', '64'] },
      { q: 'What is 15 + 27?', a: '42', choices: ['32', '41', '52'] },
      { q: 'What is 81 ÷ 9?', a: '9', choices: ['8', '7', '11'] },
      { q: 'What is 25% of 200?', a: '50', choices: ['25', '40', '100'] },
      { q: 'How many minutes are in 2 hours?', a: '120', choices: ['100', '60', '200'] },
      { q: 'What is the next number: 3, 6, 12, 24, …?', a: '48', choices: ['30', '36', '42'] },
      { q: 'How many centimetres are in 1 metre?', a: '100', choices: ['10', '1000', '60'] },
      { q: 'What is 1000 − 275?', a: '725', choices: ['775', '825', '735'] },
      { q: 'What is the square of 12?', a: '144', choices: ['124', '24', '122'] },
      { q: 'How many sides does a pentagon have?', a: '5', choices: ['6', '4', '8'] },
      { q: 'What is 3/4 written as a decimal?', a: '0.75', choices: ['0.34', '0.25', '7.5'] },
      { q: 'What is the perimeter of a square with sides of 5 cm?', a: '20 cm', choices: ['25 cm', '10 cm', '15 cm'] }
    ] },
    { id: 'science', title: 'Science basics', questions: [
      { q: 'Which planet is closest to the Sun?', a: 'Mercury', choices: ['Venus', 'Mars', 'Earth'] },
      { q: 'What do plants take in from the air to make food?', a: 'Carbon dioxide', choices: ['Oxygen', 'Nitrogen', 'Helium'] },
      { q: 'What is the chemical symbol for water?', a: 'H₂O', choices: ['CO₂', 'O₂', 'NaCl'] },
      { q: 'What force pulls objects towards the Earth?', a: 'Gravity', choices: ['Friction', 'Magnetism', 'Pressure'] },
      { q: 'How many legs does an insect have?', a: '6', choices: ['8', '4', '10'] },
      { q: 'What is the hardest natural substance?', a: 'Diamond', choices: ['Gold', 'Iron', 'Quartz'] },
      { q: 'Which part of the body helps us to breathe?', a: 'The lungs', choices: ['The liver', 'The kidneys', 'The stomach'] },
      { q: 'What is the main source of light for the Earth?', a: 'The Sun', choices: ['The Moon', 'The stars', 'Lightning'] },
      { q: 'At what temperature does water freeze?', a: '0 °C', choices: ['10 °C', '−10 °C', '100 °C'] },
      { q: 'Name a material that is attracted to a magnet.', a: 'Iron (or steel, nickel, cobalt)' },
      { q: 'Name the three states of matter.', a: 'Solid, liquid and gas' },
      { q: 'What do we call animals that eat only plants?', a: 'Herbivores', choices: ['Carnivores', 'Omnivores', 'Predators'] }
    ] }
  ];

  return { LABEL, catalog, trivia, memory, hangman, wordCategories, pictionary, drawCategories, sorting, sequences, spot, boardGame, quizPathSets };
});
