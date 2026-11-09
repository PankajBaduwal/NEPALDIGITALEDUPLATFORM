/**
 * BigSmallLevels.ts
 * Data structures & Level configurations for Big and Small World (ठूलो र सानो संसार)
 * Grade 1 Mathematics • Chapter 1: आकारप्रकार र स्थान
 * CDC Nepal Curriculum Aligned
 */

export interface ComparisonItem {
  id: string;
  nameEn: string;
  nameNe: string;
  sizeRank: number; // 1 (smallest) to 5 (biggest)
  scaleFactor: number;
  category: 'animals' | 'fruits' | 'traditional' | 'toys';
  icon: string;
}

// ── MODE 1: BIG OR SMALL? (ठूलो कि सानो?) ─────────────────────────
export interface Mode1Pair {
  id: string;
  questionType: 'FIND_BIG' | 'FIND_SMALL';
  questionEn: string;
  questionNe: string;
  itemA: ComparisonItem;
  itemB: ComparisonItem;
  correctChoice: 'A' | 'B';
  explanationEn: string;
  explanationNe: string;
}

export const MODE_1_PAIRS: Mode1Pair[] = [
  {
    id: 'm1_p1',
    questionType: 'FIND_BIG',
    questionEn: 'Which animal is BIG? (ठूलो)',
    questionNe: 'कुन जनावर ठूलो छ? (ठूलो)',
    itemA: { id: 'elephant', nameEn: 'Elephant', nameNe: 'हात्ती', sizeRank: 5, scaleFactor: 1.0, category: 'animals', icon: '🐘' },
    itemB: { id: 'mouse', nameEn: 'Mouse', nameNe: 'मुसो', sizeRank: 1, scaleFactor: 1.0, category: 'animals', icon: '🐭' },
    correctChoice: 'A',
    explanationEn: 'The elephant is huge with a big body, ears, and trunk!',
    explanationNe: 'सबास! हात्तीको शरीर धेरै ठूलो हुन्छ!',
  },
  {
    id: 'm1_p2',
    questionType: 'FIND_SMALL',
    questionEn: 'Which play ball is SMALL? (सानो)',
    questionNe: 'कुन बल सानो छ? (सानो)',
    itemA: { id: 'ball_big', nameEn: 'Large Basketball', nameNe: 'ठूलो बास्केटबल', sizeRank: 4, scaleFactor: 1.0, category: 'toys', icon: '🏀' },
    itemB: { id: 'ball_small', nameEn: 'Small Marble / Table Tennis Ball', nameNe: 'सानो गुच्चा/बल', sizeRank: 1, scaleFactor: 1.0, category: 'toys', icon: '🎾' },
    correctChoice: 'B',
    explanationEn: 'The small ball fits easily in a child’s palm.',
    explanationNe: 'धेरै राम्रो! सानो बल हातको हत्केलामा अटाउँछ।',
  },
  {
    id: 'm1_p3',
    questionType: 'FIND_BIG',
    questionEn: 'Which traditional clay pot (माटोको भाँडो) is BIGGER? (ठूलो)',
    questionNe: 'कुन माटोको भाँडो ठूलो छ? (ठूलो)',
    itemA: { id: 'clay_pot_large', nameEn: 'Large Storage Pot (घैँटो)', nameNe: 'ठूलो घैँटो', sizeRank: 4, scaleFactor: 1.0, category: 'traditional', icon: '🏺' },
    itemB: { id: 'clay_pot_small', nameEn: 'Small Clay Cup (सानो भाँडो)', nameNe: 'सानो भाँडो', sizeRank: 1, scaleFactor: 1.0, category: 'traditional', icon: '🍶' },
    correctChoice: 'A',
    explanationEn: 'The large clay pot can store lots of grain and water.',
    explanationNe: 'उत्कृष्ट! ठूलो घैँटोमा धेरै अन्न वा पानी राख्न सकिन्छ।',
  },
  {
    id: 'm1_p4',
    questionType: 'FIND_SMALL',
    questionEn: 'Which delicious fruit is SMALL? (सानो)',
    questionNe: 'कुन फल सानो छ? (सानो)',
    itemA: { id: 'watermelon', nameEn: 'Watermelon (खर्बुजा)', nameNe: 'ठूलो खर्बुजा', sizeRank: 5, scaleFactor: 1.0, category: 'fruits', icon: '🍉' },
    itemB: { id: 'strawberry', nameEn: 'Strawberry (स्ट्रबेरी)', nameNe: 'सानो स्ट्रबेरी', sizeRank: 1, scaleFactor: 1.0, category: 'fruits', icon: '🍓' },
    correctChoice: 'B',
    explanationEn: 'The strawberry is tiny compared to the big round watermelon!',
    explanationNe: 'सबास! स्ट्रबेरी ठूलो खर्बुजा भन्दा धेरै सानो हुन्छ!',
  },
  {
    id: 'm1_p5',
    questionType: 'FIND_BIG',
    questionEn: 'Which farm animal is BIGGER? (ठूलो)',
    questionNe: 'कुन घरपालुवा जनावर ठूलो छ? (ठूलो)',
    itemA: { id: 'cow', nameEn: 'Cow (गाई)', nameNe: 'गाई', sizeRank: 4, scaleFactor: 1.0, category: 'animals', icon: '🐄' },
    itemB: { id: 'goat', nameEn: 'Goat (बाख्रा)', nameNe: 'बाख्रा', sizeRank: 2, scaleFactor: 1.0, category: 'animals', icon: '🐐' },
    correctChoice: 'A',
    explanationEn: 'The cow is much larger and taller than the goat.',
    explanationNe: 'धेरै राम्रो! गाई बाख्राभन्दा आकारमा ठूलो हुन्छ।',
  },
  {
    id: 'm1_p6',
    questionType: 'FIND_SMALL',
    questionEn: 'Which woven bamboo basket (डोको) is SMALLER? (सानो)',
    questionNe: 'कुन बाँसको टोकरी सानो छ? (सानो)',
    itemA: { id: 'basket_large', nameEn: 'Large Harvest Doko (ठूलो डोको)', nameNe: 'ठूलो डोको', sizeRank: 4, scaleFactor: 1.0, category: 'traditional', icon: '🧺' },
    itemB: { id: 'basket_small', nameEn: 'Small Hand Basket (सानो टोकरी)', nameNe: 'सानो टोकरी', sizeRank: 2, scaleFactor: 1.0, category: 'traditional', icon: '🧺' },
    correctChoice: 'B',
    explanationEn: 'The small basket is light and easy to carry.',
    explanationNe: 'सबास! सानो टोकरी बोक्न सजिलो हुन्छ।',
  },
];

// ── MODE 2: BIGGEST AND SMALLEST (सबैभन्दा ठूलो र सबैभन्दा सानो) ─
export interface Mode2Set {
  id: string;
  targetGoal: 'BIGGEST' | 'SMALLEST';
  questionEn: string;
  questionNe: string;
  items: [ComparisonItem, ComparisonItem, ComparisonItem];
  correctIndex: 0 | 1 | 2;
  explanationEn: string;
  explanationNe: string;
}

export const MODE_2_SETS: Mode2Set[] = [
  {
    id: 'm2_s1',
    targetGoal: 'BIGGEST',
    questionEn: 'Which animal is the BIGGEST of all three? (सबैभन्दा ठूलो)',
    questionNe: 'यी तीनमध्ये कुन जनावर सबैभन्दा ठूलो छ? (सबैभन्दा ठूलो)',
    items: [
      { id: 'cow', nameEn: 'Cow', nameNe: 'गाई', sizeRank: 4, scaleFactor: 1.0, category: 'animals', icon: '🐄' },
      { id: 'elephant', nameEn: 'Elephant', nameNe: 'हात्ती', sizeRank: 5, scaleFactor: 1.0, category: 'animals', icon: '🐘' },
      { id: 'mouse', nameEn: 'Mouse', nameNe: 'मुसो', sizeRank: 1, scaleFactor: 1.0, category: 'animals', icon: '🐭' },
    ],
    correctIndex: 1,
    explanationEn: 'The elephant is the biggest animal among all three!',
    explanationNe: 'सबास! यी तीनमध्ये हात्ती सबैभन्दा ठूलो छ!',
  },
  {
    id: 'm2_s2',
    targetGoal: 'SMALLEST',
    questionEn: 'Which animal is the SMALLEST of all three? (सबैभन्दा सानो)',
    questionNe: 'यी तीनमध्ये कुन जनावर सबैभन्दा सानो छ? (सबैभन्दा सानो)',
    items: [
      { id: 'cow', nameEn: 'Cow', nameNe: 'गाई', sizeRank: 4, scaleFactor: 1.0, category: 'animals', icon: '🐄' },
      { id: 'elephant', nameEn: 'Elephant', nameNe: 'हात्ती', sizeRank: 5, scaleFactor: 1.0, category: 'animals', icon: '🐘' },
      { id: 'mouse', nameEn: 'Mouse', nameNe: 'मुसो', sizeRank: 1, scaleFactor: 1.0, category: 'animals', icon: '🐭' },
    ],
    correctIndex: 2,
    explanationEn: 'The tiny mouse is the smallest of all three!',
    explanationNe: 'उत्कृष्ट! सानो मुसो यीमध्ये सबैभन्दा सानो छ!',
  },
  {
    id: 'm2_s3',
    targetGoal: 'BIGGEST',
    questionEn: 'Which fruit is the BIGGEST? (सबैभन्दा ठूलो)',
    questionNe: 'कुन फल सबैभन्दा ठूलो छ? (सबैभन्दा ठूलो)',
    items: [
      { id: 'strawberry', nameEn: 'Strawberry', nameNe: 'स्ट्रबेरी', sizeRank: 1, scaleFactor: 1.0, category: 'fruits', icon: '🍓' },
      { id: 'apple', nameEn: 'Apple', nameNe: 'स्याउ', sizeRank: 2, scaleFactor: 1.0, category: 'fruits', icon: '🍎' },
      { id: 'watermelon', nameEn: 'Watermelon', nameNe: 'खर्बुजा', sizeRank: 5, scaleFactor: 1.0, category: 'fruits', icon: '🍉' },
    ],
    correctIndex: 2,
    explanationEn: 'The watermelon takes the most space: it is the biggest fruit!',
    explanationNe: 'धेरै राम्रो! खर्बुजा यी सबैभन्दा ठूलो फल हो!',
  },
  {
    id: 'm2_s4',
    targetGoal: 'SMALLEST',
    questionEn: 'Which play ball is the SMALLEST? (सबैभन्दा सानो)',
    questionNe: 'कुन बल सबैभन्दा सानो छ? (सबैभन्दा सानो)',
    items: [
      { id: 'ball_big', nameEn: 'Big Basketball', nameNe: 'ठूलो बास्केटबल', sizeRank: 4, scaleFactor: 1.0, category: 'toys', icon: '🏀' },
      { id: 'ball_medium', nameEn: 'Medium Tennis Ball', nameNe: 'मध्यम बल', sizeRank: 2, scaleFactor: 1.0, category: 'toys', icon: '🎾' },
      { id: 'ball_small', nameEn: 'Tiny Marble', nameNe: 'सानो गुच्चा', sizeRank: 1, scaleFactor: 1.0, category: 'toys', icon: '⚪' },
    ],
    correctIndex: 2,
    explanationEn: 'The tiny marble is the smallest ball of the three!',
    explanationNe: 'सबास! सानो गुच्चा यी तीनमध्ये सबैभन्दा सानो छ!',
  },
  {
    id: 'm2_s5',
    targetGoal: 'BIGGEST',
    questionEn: 'Which clay pot is the BIGGEST? (सबैभन्दा ठूलो)',
    questionNe: 'कुन माटोको घैँटो सबैभन्दा ठूलो छ? (सबैभन्दा ठूलो)',
    items: [
      { id: 'clay_pot_medium', nameEn: 'Medium Clay Pot', nameNe: 'मध्यम घैँटो', sizeRank: 3, scaleFactor: 1.0, category: 'traditional', icon: '🏺' },
      { id: 'clay_pot_large', nameEn: 'Large Clay Pot', nameNe: 'ठूलो घैँटो', sizeRank: 5, scaleFactor: 1.0, category: 'traditional', icon: '🏺' },
      { id: 'clay_pot_small', nameEn: 'Small Clay Pot', nameNe: 'सानो घैँटो', sizeRank: 1, scaleFactor: 1.0, category: 'traditional', icon: '🏺' },
    ],
    correctIndex: 1,
    explanationEn: 'The large clay pot is the biggest pot!',
    explanationNe: 'उत्कृष्ट! ठूलो घैँटो सबैभन्दा ठूलो छ!',
  },
];

// ── MODE 3: ARRANGE BY SIZE (आकारअनुसार मिलाउनुहोस्) ────────────
export interface Mode3OrderingTask {
  id: string;
  orderDirection: 'SMALLEST_TO_BIGGEST' | 'BIGGEST_TO_SMALLEST';
  instructionEn: string;
  instructionNe: string;
  items: [ComparisonItem, ComparisonItem, ComparisonItem];
  // Target order represented by IDs
  expectedOrder: [string, string, string];
  successMessageEn: string;
  successMessageNe: string;
}

export const MODE_3_TASKS: Mode3OrderingTask[] = [
  {
    id: 'm3_t1',
    orderDirection: 'SMALLEST_TO_BIGGEST',
    instructionEn: 'Arrange the three balls from SMALLEST to BIGGEST! (सानोदेखि ठूलो)',
    instructionNe: 'तीनवटा बलहरूलाई सानोदेखि ठूलो क्रममा मिलाउनुहोस्! (सानो → मध्यम → ठूलो)',
    items: [
      { id: 'ball_big', nameEn: 'Big Basketball', nameNe: 'ठूलो बल', sizeRank: 4, scaleFactor: 1.0, category: 'toys', icon: '🏀' },
      { id: 'ball_small', nameEn: 'Small Marble', nameNe: 'सानो बल', sizeRank: 1, scaleFactor: 1.0, category: 'toys', icon: '⚪' },
      { id: 'ball_medium', nameEn: 'Medium Tennis Ball', nameNe: 'मध्यम बल', sizeRank: 2, scaleFactor: 1.0, category: 'toys', icon: '🎾' },
    ],
    expectedOrder: ['ball_small', 'ball_medium', 'ball_big'],
    successMessageEn: 'Perfect! Smallest → Medium → Biggest! (सानो → मध्यम → ठूलो)',
    successMessageNe: 'सबास! सानो → मध्यम → ठूलो क्रम मिलेको छ!',
  },
  {
    id: 'm3_t2',
    orderDirection: 'BIGGEST_TO_SMALLEST',
    instructionEn: 'Arrange the clay pots from BIGGEST to SMALLEST! (ठूलोदेखि सानो)',
    instructionNe: 'माटोका भाँडाहरूलाई ठूलोदेखि सानो क्रममा मिलाउनुहोस्! (ठूलो → मध्यम → सानो)',
    items: [
      { id: 'clay_pot_small', nameEn: 'Small Pot', nameNe: 'सानो भाँडो', sizeRank: 1, scaleFactor: 1.0, category: 'traditional', icon: '🍶' },
      { id: 'clay_pot_large', nameEn: 'Large Pot', nameNe: 'ठूलो घैँटो', sizeRank: 5, scaleFactor: 1.0, category: 'traditional', icon: '🏺' },
      { id: 'clay_pot_medium', nameEn: 'Medium Pot', nameNe: 'मध्यम भाँडो', sizeRank: 3, scaleFactor: 1.0, category: 'traditional', icon: '🏺' },
    ],
    expectedOrder: ['clay_pot_large', 'clay_pot_medium', 'clay_pot_small'],
    successMessageEn: 'Well done! Biggest → Medium → Smallest! (ठूलो → मध्यम → सानो)',
    successMessageNe: 'धेरै राम्रो! ठूलो → मध्यम → सानो क्रम मिलेको छ!',
  },
  {
    id: 'm3_t3',
    orderDirection: 'SMALLEST_TO_BIGGEST',
    instructionEn: 'Arrange the animals from SMALLEST to BIGGEST! (सानोदेखि ठूलो)',
    instructionNe: 'जनावरहरूलाई सानोदेखि ठूलो क्रममा मिलाउनुहोस्! (मुसो → बाख्रा → हात्ती)',
    items: [
      { id: 'elephant', nameEn: 'Elephant', nameNe: 'हात्ती', sizeRank: 5, scaleFactor: 1.0, category: 'animals', icon: '🐘' },
      { id: 'mouse', nameEn: 'Mouse', nameNe: 'मुसो', sizeRank: 1, scaleFactor: 1.0, category: 'animals', icon: '🐭' },
      { id: 'goat', nameEn: 'Goat', nameNe: 'बाख्रा', sizeRank: 2, scaleFactor: 1.0, category: 'animals', icon: '🐐' },
    ],
    expectedOrder: ['mouse', 'goat', 'elephant'],
    successMessageEn: 'Excellent! Mouse → Goat → Elephant!',
    successMessageNe: 'उत्कृष्ट! मुसो (सानो) → बाख्रा (मध्यम) → हात्ती (ठूलो)!',
  },
  {
    id: 'm3_t4',
    orderDirection: 'SMALLEST_TO_BIGGEST',
    instructionEn: 'Arrange the fruits from SMALLEST to BIGGEST! (सानोदेखि ठूलो)',
    instructionNe: 'फलफूलहरूलाई सानोदेखि ठूलो क्रममा मिलाउनुहोस्! (स्ट्रबेरी → स्याउ → खर्बुजा)',
    items: [
      { id: 'apple', nameEn: 'Apple', nameNe: 'स्याउ', sizeRank: 2, scaleFactor: 1.0, category: 'fruits', icon: '🍎' },
      { id: 'watermelon', nameEn: 'Watermelon', nameNe: 'खर्बुजा', sizeRank: 5, scaleFactor: 1.0, category: 'fruits', icon: '🍉' },
      { id: 'strawberry', nameEn: 'Strawberry', nameNe: 'स्ट्रबेरी', sizeRank: 1, scaleFactor: 1.0, category: 'fruits', icon: '🍓' },
    ],
    expectedOrder: ['strawberry', 'apple', 'watermelon'],
    successMessageEn: 'Superb! Strawberry → Apple → Watermelon!',
    successMessageNe: 'सबास! स्ट्रबेरी → स्याउ → खर्बुजा!',
  },
];

// ── MODE 4: SIZE DISCOVERY LAB CATALOG ITEMS ────────────────────
export const DISCOVERY_CATALOG = {
  animals: [
    { id: 'elephant', nameEn: 'Elephant', nameNe: 'हात्ती', icon: '🐘', size: 'Big (ठूलो)' },
    { id: 'cow', nameEn: 'Cow', nameNe: 'गाई', icon: '🐄', size: 'Big (ठूलो)' },
    { id: 'goat', nameEn: 'Goat', nameNe: 'बाख्रा', icon: '🐐', size: 'Medium (मध्यम)' },
    { id: 'dog', nameEn: 'Dog', nameNe: 'कुकुर', icon: '🐕', size: 'Medium (मध्यम)' },
    { id: 'cat', nameEn: 'Cat', nameNe: 'बिरालो', icon: '🐈', size: 'Small (सानो)' },
    { id: 'rabbit', nameEn: 'Rabbit', nameNe: 'खरायो', icon: '🐇', size: 'Small (सानो)' },
    { id: 'mouse', nameEn: 'Mouse', nameNe: 'मुसो', icon: '🐭', size: 'Tiny (सानो)' },
    { id: 'bird', nameEn: 'Bird', nameNe: 'चरा', icon: '🐦', size: 'Small (सानो)' },
  ],
  fruits: [
    { id: 'watermelon', nameEn: 'Watermelon', nameNe: 'खर्बुजा', icon: '🍉', size: 'Big (ठूलो)' },
    { id: 'pumpkin', nameEn: 'Pumpkin', nameNe: 'फर्सी', icon: '🎃', size: 'Big (ठूलो)' },
    { id: 'cabbage', nameEn: 'Cabbage', nameNe: 'बन्दाकोबी', icon: '🥬', size: 'Medium (मध्यम)' },
    { id: 'apple', nameEn: 'Apple', nameNe: 'स्याउ', icon: '🍎', size: 'Medium (मध्यम)' },
    { id: 'orange', nameEn: 'Orange', nameNe: 'सुन्तला', icon: '🍊', size: 'Medium (मध्यम)' },
    { id: 'banana', nameEn: 'Banana', nameNe: 'केरा', icon: '🍌', size: 'Medium (मध्यम)' },
    { id: 'grapes', nameEn: 'Grapes', nameNe: 'अङ्गुर', icon: '🍇', size: 'Small (सानो)' },
    { id: 'strawberry', nameEn: 'Strawberry', nameNe: 'स्ट्रबेरी', icon: '🍓', size: 'Tiny (सानो)' },
  ],
  traditional: [
    { id: 'clay_pot_large', nameEn: 'Large Clay Pot (घैँटो)', nameNe: 'ठूलो घैँटो', icon: '🏺', size: 'Big (ठूलो)' },
    { id: 'clay_pot_small', nameEn: 'Small Clay Cup', nameNe: 'सानो भाँडो', icon: '🍶', size: 'Small (सानो)' },
    { id: 'basket_large', nameEn: 'Large Harvest Basket (डोको)', nameNe: 'ठूलो डोको', icon: '🧺', size: 'Big (ठूलो)' },
    { id: 'basket_small', nameEn: 'Small Hand Basket', nameNe: 'सानो टोकरी', icon: '🧺', size: 'Small (सानो)' },
    { id: 'plate_large', nameEn: 'Large Bronze Plate (थाल)', nameNe: 'ठूलो थाल', icon: '🍽️', size: 'Big (ठूलो)' },
    { id: 'plate_small', nameEn: 'Small Plate', nameNe: 'सानो थाल', icon: '🍽️', size: 'Small (सानो)' },
    { id: 'theki_large', nameEn: 'Large Theki (काठको ठेकी)', nameNe: 'ठूलो ठेकी', icon: '🪵', size: 'Big (ठूलो)' },
    { id: 'theki_small', nameEn: 'Small Theki', nameNe: 'सानो ठेकी', icon: '🪵', size: 'Small (सानो)' },
  ],
  toys: [
    { id: 'ball_big', nameEn: 'Basketball', nameNe: 'ठूलो बास्केटबल', icon: '🏀', size: 'Big (ठूलो)' },
    { id: 'ball_small', nameEn: 'Marble / Ping Pong', nameNe: 'सानो बल', icon: '⚪', size: 'Small (सानो)' },
    { id: 'teddy_large', nameEn: 'Giant Teddy Bear', nameNe: 'ठूलो गुडिया', icon: '🧸', size: 'Big (ठूलो)' },
    { id: 'teddy_small', nameEn: 'Small Teddy Bear', nameNe: 'सानो गुडिया', icon: '🧸', size: 'Small (सानो)' },
    { id: 'car_large', nameEn: 'Big Toy Truck', nameNe: 'ठूलो ट्रक', icon: '🚛', size: 'Big (ठूलो)' },
    { id: 'car_small', nameEn: 'Small Toy Car', nameNe: 'सानो गाडी', icon: '🚗', size: 'Small (सानो)' },
    { id: 'blocks_large', nameEn: 'Large Blocks', nameNe: 'ठूलो ब्लक', icon: '🧱', size: 'Big (ठूलो)' },
    { id: 'blocks_small', nameEn: 'Small Blocks', nameNe: 'सानो ब्लक', icon: '🧱', size: 'Small (सानो)' },
  ],
};

// ── MODE 5: BIG AND SMALL CHALLENGE (ठूलो र सानो चुनौती) ────────
export interface ChallengeQuestion {
  id: string;
  type: 'FIND_BIG' | 'FIND_SMALL' | 'COMPARE' | 'PATTERN';
  questionEn: string;
  questionNe: string;
  options: Array<{
    id: string;
    labelEn: string;
    labelNe: string;
    isCorrect: boolean;
    explanationEn: string;
    explanationNe: string;
  }>;
}

export const CHALLENGE_QUESTIONS: ChallengeQuestion[] = [
  {
    id: 'cq_1',
    type: 'FIND_BIG',
    questionEn: 'Which animal is the BIGGEST animal in this forest?',
    questionNe: 'यीमध्ये कुन जनावर सबैभन्दा ठूलो छ?',
    options: [
      { id: 'opt_elephant', labelEn: 'Elephant (हात्ती)', labelNe: 'हात्ती', isCorrect: true, explanationEn: 'Correct! The elephant has the largest body volume.', explanationNe: 'सबास! हात्तीको आकार सबैभन्दा ठूलो हुन्छ।' },
      { id: 'opt_cat', labelEn: 'Cat (बिरालो)', labelNe: 'बिरालो', isCorrect: false, explanationEn: 'The cat is much smaller than an elephant.', explanationNe: 'बिरालो हात्तीभन्दा धेरै सानो हुन्छ।' },
      { id: 'opt_mouse', labelEn: 'Mouse (मुसो)', labelNe: 'मुसो', isCorrect: false, explanationEn: 'The mouse is tiny!', explanationNe: 'मुसो धेरै सानो हुन्छ!' },
    ],
  },
  {
    id: 'cq_2',
    type: 'FIND_SMALL',
    questionEn: 'Which fruit is the SMALLEST in size?',
    questionNe: 'कुन फल आकारमा सबैभन्दा सानो छ?',
    options: [
      { id: 'opt_straw', labelEn: 'Strawberry (स्ट्रबेरी)', labelNe: 'स्ट्रबेरी', isCorrect: true, explanationEn: 'Correct! Strawberry is the smallest berry.', explanationNe: 'सबास! स्ट्रबेरी सबैभन्दा सानो फल हो।' },
      { id: 'opt_melon', labelEn: 'Watermelon (खर्बुजा)', labelNe: 'खर्बुजा', isCorrect: false, explanationEn: 'Watermelon is the largest fruit here.', explanationNe: 'खर्बुजा त सबैभन्दा ठूलो छ।' },
      { id: 'opt_apple', labelEn: 'Apple (स्याउ)', labelNe: 'स्याउ', isCorrect: false, explanationEn: 'An apple is bigger than a strawberry.', explanationNe: 'स्याउ स्ट्रबेरी भन्दा ठूलो हुन्छ।' },
    ],
  },
  {
    id: 'cq_3',
    type: 'COMPARE',
    questionEn: 'Comparing a football and a glass marble: which one is BIGGER?',
    questionNe: 'फुटबल र गुच्चा तुलना गर्दा कुन वस्तु ठूलो छ?',
    options: [
      { id: 'opt_fb', labelEn: 'Football (फुटबल)', labelNe: 'फुटबल', isCorrect: true, explanationEn: 'Great! The football is big in physical size.', explanationNe: 'धेरै राम्रो! फुटबल आकारमा ठूलो हुन्छ।' },
      { id: 'opt_mb', labelEn: 'Marble (गुच्चा)', labelNe: 'गुच्चा', isCorrect: false, explanationEn: 'A marble is small.', explanationNe: 'गुच्चा सानो हुन्छ।' },
    ],
  },
  {
    id: 'cq_4',
    type: 'PATTERN',
    questionEn: 'What comes next in the size pattern? [ Small Ball → Big Ball → Small Ball → ___ ]',
    questionNe: 'आकारको ढाँचामा अर्को के आउँछ? [ सानो बल → ठूलो बल → सानो बल → ___ ]',
    options: [
      { id: 'opt_big', labelEn: 'Big Ball (ठूलो बल)', labelNe: 'ठूलो बल', isCorrect: true, explanationEn: 'Correct! The pattern alternates: Small, Big, Small, Big!', explanationNe: 'सबास! ढाँचा सानो, ठूलो, सानो, ठूलो को क्रममा छ!' },
      { id: 'opt_small', labelEn: 'Small Ball (सानो बल)', labelNe: 'सानो बल', isCorrect: false, explanationEn: 'After small comes big!', explanationNe: 'सानो पछि ठूलो आउँछ!' },
    ],
  },
  {
    id: 'cq_5',
    type: 'FIND_BIG',
    questionEn: 'Which traditional container holds more water because it is BIGGER?',
    questionNe: 'आकार ठूलो भएकाले कुन भाँडोमा धेरै पानी अटाउँछ?',
    options: [
      { id: 'opt_gagri', labelEn: 'Large Clay Gagri (ठूलो घैँटो)', labelNe: 'ठूलो घैँटो', isCorrect: true, explanationEn: 'Very good! Large pots hold large quantities.', explanationNe: 'सबास! ठूलो घैँटोमा धेरै पानी अटाउँछ।' },
      { id: 'opt_cup', labelEn: 'Small Clay Cup (सानो कप)', labelNe: 'सानो कप', isCorrect: false, explanationEn: 'Small cups hold only a little water.', explanationNe: 'सानो कपमा थोरै मात्र पानी अटाउँछ।' },
    ],
  },
  {
    id: 'cq_6',
    type: 'COMPARE',
    questionEn: 'Which is the correct order from SMALLEST to BIGGEST?',
    questionNe: 'सानोदेखि ठूलो क्रममा कुन सही छ?',
    options: [
      { id: 'opt_ord_correct', labelEn: 'Mouse → Dog → Cow (मुसो → कुकुर → गाई)', labelNe: 'मुसो → कुकुर → गाई', isCorrect: true, explanationEn: 'Spot on! Mouse is small, Dog is medium, Cow is big!', explanationNe: 'उत्कृष्ट! मुसो (सानो) → कुकुर (मध्यम) → गाई (ठूलो) सही क्रम हो।' },
      { id: 'opt_ord_wrong', labelEn: 'Cow → Dog → Mouse (गाई → कुकुर → मुसो)', labelNe: 'गाई → कुकुर → मुसो', isCorrect: false, explanationEn: 'That is biggest to smallest!', explanationNe: 'यो त ठूलोदेखि सानो क्रम भयो!' },
    ],
  },
  {
    id: 'cq_7',
    type: 'FIND_SMALL',
    questionEn: 'Between a big truck and a mini toy car, which is SMALLER?',
    questionNe: 'ठूलो ट्रक र सानो खेलौना गाडीमध्ये कुन सानो छ?',
    options: [
      { id: 'opt_toy_car', labelEn: 'Small Toy Car (सानो खेलौना गाडी)', labelNe: 'सानो खेलौना गाडी', isCorrect: true, explanationEn: 'Correct! The toy car is small.', explanationNe: 'सबास! खेलौना गाडी सानो हुन्छ।' },
      { id: 'opt_truck', labelEn: 'Big Truck (ठूलो ट्रक)', labelNe: 'ठूलो ट्रक', isCorrect: false, explanationEn: 'A truck is big!', explanationNe: 'ट्रक त ठूलो हुन्छ!' },
    ],
  },
  {
    id: 'cq_8',
    type: 'PATTERN',
    questionEn: 'Complete the pattern: [ 🐘 Big Elephant → 🐭 Small Mouse → 🐘 Big Elephant → ___ ]',
    questionNe: 'ढाँचा पूरा गर्नुहोस्: [ 🐘 ठूलो हात्ती → 🐭 सानो मुसो → 🐘 ठूलो हात्ती → ___ ]',
    options: [
      { id: 'opt_mouse_pat', labelEn: '🐭 Small Mouse (सानो मुसो)', labelNe: 'सानो मुसो', isCorrect: true, explanationEn: 'Bravo! Big, Small, Big, Small!', explanationNe: 'सबास! ठूलो, सानो, ठूलो, सानो!' },
      { id: 'opt_el_pat', labelEn: '🐘 Big Elephant (ठूलो हात्ती)', labelNe: 'ठूलो हात्ती', isCorrect: false, explanationEn: 'The pattern alternates!', explanationNe: 'पालैपालो ठूलो र सानो आउँछ!' },
    ],
  },
];

