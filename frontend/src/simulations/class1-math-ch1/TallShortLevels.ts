/**
 * TallShortLevels.ts
 * Data structures & Level configurations for Tall and Short Adventure (अग्लो र होचो साहसिक यात्रा)
 * Grade 1 Mathematics • Chapter 1: आकारप्रकार र स्थान (Shapes & Position)
 * Focus: Comparing vertical heights from a common ground plane (Y = 0).
 */

export interface HeightItem {
  id: string;
  nameEn: string;
  nameNe: string;
  heightMeters: number; // strictly vertical height
  category: 'trees' | 'houses' | 'people' | 'flagpoles';
  icon: string;
  isWide?: boolean;
}

// ── MODE 1: TALL OR SHORT? (अग्लो कि होचो?) ─────────────────────────
export interface Mode1HeightPair {
  id: string;
  questionType: 'FIND_TALL' | 'FIND_SHORT';
  questionEn: string;
  questionNe: string;
  itemA: HeightItem;
  itemB: HeightItem;
  correctChoice: 'A' | 'B';
  explanationEn: string;
  explanationNe: string;
}

export const MODE_1_HEIGHT_PAIRS: Mode1HeightPair[] = [
  {
    id: 'm1_hp1',
    questionType: 'FIND_TALL',
    questionEn: 'Which tree reaches higher into the sky? (अग्लो रूख)',
    questionNe: 'कुन रूख आकाशतर्फ माथिसम्म पुगेको छ? (अग्लो रूख)',
    itemA: { id: 'tree_pine_tall', nameEn: 'Tall Pine Tree', nameNe: 'सल्लाको रूख', heightMeters: 4.8, category: 'trees', icon: '🌲' },
    itemB: { id: 'tree_fruit_short', nameEn: 'Short Fruit Tree', nameNe: 'सुन्तलाको रूख', heightMeters: 2.5, category: 'trees', icon: '🌳' },
    correctChoice: 'A',
    explanationEn: 'The Himalayan pine tree reaches 4.8m high from the ground!',
    explanationNe: 'सबास! सल्लाको रूख जमिनबाट धेरै माथिसम्म अग्लो छ!',
  },
  {
    id: 'm1_hp2',
    questionType: 'FIND_SHORT',
    questionEn: 'Which village house is SHORTER in vertical height? (होचो घर)',
    questionNe: 'कुन घर उचाइमा होचो छ? (होचो घर)',
    itemA: { id: 'house_tall_2storey', nameEn: 'Tall 2-Storey House', nameNe: 'दुईतले घर', heightMeters: 4.6, category: 'houses', icon: '🏠' },
    itemB: { id: 'house_short_1storey', nameEn: 'Short 1-Storey Cottage', nameNe: 'एकतले घर', heightMeters: 2.4, category: 'houses', icon: '🏡' },
    correctChoice: 'B',
    explanationEn: 'The single-storey cottage has a lower vertical height from the ground.',
    explanationNe: 'सबास! एकतले घर जमिनबाट कम उचाइ भएको होचो छ।',
  },
  {
    id: 'm1_hp3',
    questionType: 'FIND_TALL',
    questionEn: 'Standing upright on the same ground: who is TALLER? (अग्लो)',
    questionNe: 'एउटै जमिनमा उभिँदा: को अग्लो हुनुहुन्छ? (अग्लो)',
    itemA: { id: 'person_tall_adult', nameEn: 'Adult Father / Teacher', nameNe: 'अग्लो बुबा', heightMeters: 3.2, category: 'people', icon: '👨' },
    itemB: { id: 'person_short_child', nameEn: 'Grade 1 Child', nameNe: 'सानो बाबु', heightMeters: 1.6, category: 'people', icon: '👦' },
    correctChoice: 'A',
    explanationEn: 'The adult father stands taller from feet to top of head!',
    explanationNe: 'धेरै राम्रो! बुबाको उचाइ बाबुभन्दा बढी (अग्लो) छ!',
  },
  {
    id: 'm1_hp4',
    questionType: 'FIND_SHORT',
    questionEn: 'Which flagpole is SHORTER? (होचो झण्डाको पोल)',
    questionNe: 'कुन झण्डाको पोल होचो छ? (होचो पोल)',
    itemA: { id: 'flagpole_tall', nameEn: 'Tall School Flagpole', nameNe: 'अग्लो झण्डाको पोल', heightMeters: 4.8, category: 'flagpoles', icon: '🚩' },
    itemB: { id: 'flagpole_short', nameEn: 'Short Garden Flagpole', nameNe: 'होचो झण्डाको पोल', heightMeters: 2.0, category: 'flagpoles', icon: '🚩' },
    correctChoice: 'B',
    explanationEn: 'The garden flagpole reaches lower in vertical height.',
    explanationNe: 'उत्कृष्ट! बगैँचाको झण्डाको पोल उचाइमा कम (होचो) छ।',
  },
  {
    id: 'm1_hp5',
    questionType: 'FIND_TALL',
    // KEY PEDAGOGICAL CASE: Tall Thin Tree vs Short Wide House!
    questionEn: 'Compare HEIGHT (उचाइ): Which object is TALLER? (अग्लो)',
    questionNe: 'उचाइ तुलना गर्नुहोस्: कुन वस्तु अग्लो छ? (अग्लो)',
    itemA: { id: 'tree_pine_tall', nameEn: 'Tall Thin Pine Tree', nameNe: 'पातलो अग्लो सल्ला', heightMeters: 4.8, category: 'trees', icon: '🌲' },
    itemB: { id: 'house_wide_short_hut', nameEn: 'Wide Short Village Hut', nameNe: 'चौडा तर होचो घर', heightMeters: 2.0, category: 'houses', icon: '🛖', isWide: true },
    correctChoice: 'A',
    explanationEn: 'Even though the house is wider and bigger, the pine tree reaches much HIGHER!',
    explanationNe: 'घर चौडा र ठूलो भए पनि, सल्लाको रूख उचाइमा धेरै अग्लो छ!',
  },
  {
    id: 'm1_hp6',
    questionType: 'FIND_SHORT',
    questionEn: 'Which plant is SHORTER in height? (होचो बोट)',
    questionNe: 'कुन बोट उचाइमा होचो छ? (होचो बोट)',
    itemA: { id: 'tree_fruit_short', nameEn: 'Fruit Tree', nameNe: 'फलको रूख', heightMeters: 2.5, category: 'trees', icon: '🌳' },
    itemB: { id: 'plant_bush_short', nameEn: 'Marigold Flower Bush', nameNe: 'सयपत्री फूलको बोट', heightMeters: 1.3, category: 'trees', icon: '🌻' },
    correctChoice: 'B',
    explanationEn: 'The flower bush is close to the ground: it is short!',
    explanationNe: 'सबास! फूलको बोट जमिन नजिकै होचो छ!',
  },
];

// ── MODE 2: TALLEST AND SHORTEST (सबैभन्दा अग्लो र सबैभन्दा होचो) ─
export interface Mode2HeightSet {
  id: string;
  targetGoal: 'TALLEST' | 'SHORTEST';
  questionEn: string;
  questionNe: string;
  items: [HeightItem, HeightItem, HeightItem];
  correctIndex: 0 | 1 | 2;
  explanationEn: string;
  explanationNe: string;
}

export const MODE_2_HEIGHT_SETS: Mode2HeightSet[] = [
  {
    id: 'm2_hs1',
    targetGoal: 'TALLEST',
    questionEn: 'Which tree is the TALLEST of all three? (सबैभन्दा अग्लो)',
    questionNe: 'यी तीनमध्ये कुन रूख सबैभन्दा अग्लो छ? (सबैभन्दा अग्लो)',
    items: [
      { id: 'tree_fruit_short', nameEn: 'Fruit Tree', nameNe: 'फलको रूख', heightMeters: 2.5, category: 'trees', icon: '🌳' },
      { id: 'tree_pine_tall', nameEn: 'Himalayan Pine Tree', nameNe: 'सल्लाको रूख', heightMeters: 4.8, category: 'trees', icon: '🌲' },
      { id: 'plant_bush_short', nameEn: 'Flower Bush', nameNe: 'फूलको बोट', heightMeters: 1.3, category: 'trees', icon: '🌻' },
    ],
    correctIndex: 1,
    explanationEn: 'The pine tree reaches 4.8m: it is the tallest tree!',
    explanationNe: 'सबास! सल्लाको रूख यी तीनमध्ये सबैभन्दा अग्लो छ!',
  },
  {
    id: 'm2_hs2',
    targetGoal: 'SHORTEST',
    questionEn: 'Which plant is the SHORTEST of all three? (सबैभन्दा होचो)',
    questionNe: 'यी तीनमध्ये कुन बोट सबैभन्दा होचो छ? (सबैभन्दा होचो)',
    items: [
      { id: 'tree_fruit_short', nameEn: 'Fruit Tree', nameNe: 'फलको रूख', heightMeters: 2.5, category: 'trees', icon: '🌳' },
      { id: 'tree_pine_tall', nameEn: 'Pine Tree', nameNe: 'सल्लाको रूख', heightMeters: 4.8, category: 'trees', icon: '🌲' },
      { id: 'plant_bush_short', nameEn: 'Flower Bush', nameNe: 'फूलको बोट', heightMeters: 1.3, category: 'trees', icon: '🌻' },
    ],
    correctIndex: 2,
    explanationEn: 'The marigold flower bush is the shortest plant!',
    explanationNe: 'उत्कृष्ट! सयपत्री फूलको बोट सबैभन्दा होचो छ!',
  },
  {
    id: 'm2_hs3',
    targetGoal: 'TALLEST',
    questionEn: 'Which village building is the TALLEST? (सबैभन्दा अग्लो)',
    questionNe: 'कुन घर सबैभन्दा अग्लो छ? (सबैभन्दा अग्लो)',
    items: [
      { id: 'house_wide_short_hut', nameEn: 'Wide Village Hut', nameNe: 'चौडा घर', heightMeters: 2.0, category: 'houses', icon: '🛖' },
      { id: 'house_tall_2storey', nameEn: '2-Storey House', nameNe: 'दुईतले घर', heightMeters: 4.6, category: 'houses', icon: '🏠' },
      { id: 'house_short_1storey', nameEn: '1-Storey Cottage', nameNe: 'एकतले घर', heightMeters: 2.4, category: 'houses', icon: '🏡' },
    ],
    correctIndex: 1,
    explanationEn: 'The two-storey house reaches highest into the sky!',
    explanationNe: 'धेरै राम्रो! दुईतले घरको उचाइ सबैभन्दा बढी छ!',
  },
  {
    id: 'm2_hs4',
    targetGoal: 'TALLEST',
    questionEn: 'Which flagpole is the TALLEST? (सबैभन्दा अग्लो पोल)',
    questionNe: 'कुन झण्डाको पोल सबैभन्दा अग्लो छ? (सबैभन्दा अग्लो)',
    items: [
      { id: 'flagpole_short', nameEn: 'Short Pole', nameNe: 'होचो पोल', heightMeters: 2.0, category: 'flagpoles', icon: '🚩' },
      { id: 'flagpole_medium', nameEn: 'Medium Pole', nameNe: 'मध्यम पोल', heightMeters: 3.4, category: 'flagpoles', icon: '🚩' },
      { id: 'flagpole_tall', nameEn: 'Tall Pole', nameNe: 'अग्लो पोल', heightMeters: 4.8, category: 'flagpoles', icon: '🚩' },
    ],
    correctIndex: 2,
    explanationEn: 'The 4.8m flagpole flies the flag highest!',
    explanationNe: 'सबास! यो पोलमा झण्डा सबैभन्दा माथि फर्फराउँछ!',
  },
];

// ── MODE 3: ARRANGE BY HEIGHT (उचाइअनुसार मिलाउनुहोस्) ───────────
export interface Mode3HeightTask {
  id: string;
  orderDirection: 'SHORTEST_TO_TALLEST' | 'TALLEST_TO_SHORTEST';
  instructionEn: string;
  instructionNe: string;
  items: [HeightItem, HeightItem, HeightItem];
  expectedOrder: [string, string, string];
  successMessageEn: string;
  successMessageNe: string;
}

export const MODE_3_HEIGHT_TASKS: Mode3HeightTask[] = [
  {
    id: 'm3_ht1',
    orderDirection: 'SHORTEST_TO_TALLEST',
    instructionEn: 'Arrange the trees from SHORTEST to TALLEST! (होचोदेखि अग्लो)',
    instructionNe: 'रूखहरूलाई होचोदेखि अग्लो क्रममा मिलाउनुहोस्! (होचो → मध्यम → अग्लो)',
    items: [
      { id: 'tree_pine_tall', nameEn: 'Tall Pine Tree', nameNe: 'सल्लाको रूख', heightMeters: 4.8, category: 'trees', icon: '🌲' },
      { id: 'plant_bush_short', nameEn: 'Flower Bush', nameNe: 'फूलको बोट', heightMeters: 1.3, category: 'trees', icon: '🌻' },
      { id: 'tree_fruit_short', nameEn: 'Fruit Tree', nameNe: 'फलको रूख', heightMeters: 2.5, category: 'trees', icon: '🌳' },
    ],
    expectedOrder: ['plant_bush_short', 'tree_fruit_short', 'tree_pine_tall'],
    successMessageEn: 'Perfect! Shortest (1.3m) → Medium (2.5m) → Tallest (4.8m)!',
    successMessageNe: 'सबास! फूलको बोट (होचो) → फलको रूख (मध्यम) → सल्लाको रूख (अग्लो)!',
  },
  {
    id: 'm3_ht2',
    orderDirection: 'TALLEST_TO_SHORTEST',
    instructionEn: 'Arrange the flagpoles from TALLEST to SHORTEST! (अग्लोदेखि होचो)',
    instructionNe: 'झण्डाका पोलहरूलाई अग्लोदेखि होचो क्रममा मिलाउनुहोस्! (अग्लो → मध्यम → होचो)',
    items: [
      { id: 'flagpole_short', nameEn: 'Short Pole', nameNe: 'होचो पोल', heightMeters: 2.0, category: 'flagpoles', icon: '🚩' },
      { id: 'flagpole_tall', nameEn: 'Tall Pole', nameNe: 'अग्लो पोल', heightMeters: 4.8, category: 'flagpoles', icon: '🚩' },
      { id: 'flagpole_medium', nameEn: 'Medium Pole', nameNe: 'मध्यम पोल', heightMeters: 3.4, category: 'flagpoles', icon: '🚩' },
    ],
    expectedOrder: ['flagpole_tall', 'flagpole_medium', 'flagpole_short'],
    successMessageEn: 'Well done! Tallest → Medium → Shortest! (अग्लो → मध्यम → होचो)',
    successMessageNe: 'धेरै राम्रो! अग्लो → मध्यम → होचो क्रम मिलेको छ!',
  },
  {
    id: 'm3_ht3',
    orderDirection: 'SHORTEST_TO_TALLEST',
    instructionEn: 'Arrange the village buildings from SHORTEST to TALLEST! (होचोदेखि अग्लो)',
    instructionNe: 'घरहरूलाई होचोदेखि अग्लो क्रममा मिलाउनुहोस्! (होचो → मध्यम → अग्लो)',
    items: [
      { id: 'house_tall_2storey', nameEn: '2-Storey House', nameNe: 'दुईतले घर', heightMeters: 4.6, category: 'houses', icon: '🏠' },
      { id: 'house_wide_short_hut', nameEn: 'Wide Village Hut', nameNe: 'चौडा छाप्रो', heightMeters: 2.0, category: 'houses', icon: '🛖' },
      { id: 'house_short_1storey', nameEn: '1-Storey Cottage', nameNe: 'एकतले घर', heightMeters: 2.4, category: 'houses', icon: '🏡' },
    ],
    expectedOrder: ['house_wide_short_hut', 'house_short_1storey', 'house_tall_2storey'],
    successMessageEn: 'Excellent! Wide Hut (2.0m) → 1-Storey (2.4m) → 2-Storey (4.6m)!',
    successMessageNe: 'उत्कृष्ट! चौडा छाप्रो (होचो) → एकतले (मध्यम) → दुईतले (अग्लो)!',
  },
];

// ── MODE 4: HEIGHT DISCOVERY LAB CATALOG ─────────────────────────
export const HEIGHT_CATALOG = {
  trees: [
    { id: 'tree_pine_tall', nameEn: 'Tall Himalayan Pine', nameNe: 'सल्लाको रूख', icon: '🌲', height: 'Tall (अग्लो - 4.8m)' },
    { id: 'tree_fruit_short', nameEn: 'Fruit Tree', nameNe: 'फलको रूख', icon: '🌳', height: 'Medium (मध्यम - 2.5m)' },
    { id: 'plant_bush_short', nameEn: 'Marigold Bush', nameNe: 'सयपत्री बोट', icon: '🌻', height: 'Short (होचो - 1.3m)' },
  ],
  houses: [
    { id: 'house_tall_2storey', nameEn: 'Tall 2-Storey House', nameNe: 'दुईतले घर', icon: '🏠', height: 'Tall (अग्लो - 4.6m)' },
    { id: 'house_short_1storey', nameEn: 'Short 1-Storey House', nameNe: 'एकतले घर', icon: '🏡', height: 'Medium (मध्यम - 2.4m)' },
    { id: 'house_wide_short_hut', nameEn: 'Wide Short Hut (Wide!)', nameNe: 'चौडा तर होचो घर', icon: '🛖', height: 'Short (होचो - 2.0m)' },
  ],
  people: [
    { id: 'person_tall_adult', nameEn: 'Adult Teacher/Father', nameNe: 'अग्लो बुबा', icon: '👨', height: 'Tall (अग्लो - 3.2m)' },
    { id: 'person_short_child', nameEn: 'Grade 1 Child', nameNe: 'होचो बाबु', icon: '👦', height: 'Short (होचो - 1.6m)' },
  ],
  flagpoles: [
    { id: 'flagpole_tall', nameEn: 'Tall Flagpole (Nepal Flag)', nameNe: 'अग्लो झण्डा पोल', icon: '🚩', height: 'Tall (अग्लो - 4.8m)' },
    { id: 'flagpole_medium', nameEn: 'Medium Flagpole', nameNe: 'मध्यम झण्डा पोल', icon: '🚩', height: 'Medium (मध्यम - 3.4m)' },
    { id: 'flagpole_short', nameEn: 'Short Garden Flagpole', nameNe: 'होचो झण्डा पोल', icon: '🚩', height: 'Short (होचो - 2.0m)' },
  ],
};

// ── MODE 5: TALL AND SHORT CHALLENGE QUESTIONS ──────────────────
export interface HeightChallengeQuestion {
  id: string;
  type: 'FIND_TALL' | 'FIND_SHORT' | 'HEIGHT_VS_WIDTH' | 'ORDER';
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

export const HEIGHT_CHALLENGE_QUESTIONS: HeightChallengeQuestion[] = [
  {
    id: 'hcq_1',
    type: 'FIND_TALL',
    questionEn: 'Which tree reaches highest towards the sky?',
    questionNe: 'कुन रूख आकाशतर्फ सबैभन्दा माथिसम्म पुगेको छ?',
    options: [
      { id: 'opt_pine', labelEn: 'Himalayan Pine Tree (सल्लाको रूख)', labelNe: 'सल्लाको रूख', isCorrect: true, explanationEn: 'Correct! The pine tree has the highest vertical height.', explanationNe: 'सबास! सल्लाको रूख उचाइमा सबैभन्दा अग्लो छ।' },
      { id: 'opt_bush', labelEn: 'Marigold Bush (सयपत्री बोट)', labelNe: 'सयपत्री बोट', isCorrect: false, explanationEn: 'The flower bush is short and close to the ground.', explanationNe: 'फूलको बोट त जमिन नजिकै होचो छ।' },
    ],
  },
  {
    id: 'hcq_2',
    type: 'FIND_SHORT',
    questionEn: 'Which building is SHORTER in vertical height?',
    questionNe: 'कुन घर ठाडो उचाइमा होचो छ?',
    options: [
      { id: 'opt_cottage', labelEn: 'Single-Storey Cottage (एकतले घर)', labelNe: 'एकतले घर', isCorrect: true, explanationEn: 'Correct! The 1-storey cottage reaches only 2.4m.', explanationNe: 'सबास! एकतले घर उचाइमा होचो छ।' },
      { id: 'opt_tower', labelEn: 'Two-Storey House (दुईतले घर)', labelNe: 'दुईतले घर', isCorrect: false, explanationEn: 'The two-storey house reaches higher up.', explanationNe: 'दुईतले घर धेरै माथिसम्म अग्लो छ।' },
    ],
  },
  {
    id: 'hcq_3',
    type: 'HEIGHT_VS_WIDTH',
    questionEn: 'A wide village house is very broad, and a pine tree is thin. Which one is TALLER?',
    questionNe: 'चौडा घर धेरै फैलिएको छ र सल्लाको रूख पातलो छ। कुन वस्तु अग्लो छ?',
    options: [
      { id: 'opt_tree_tall', labelEn: 'Pine Tree is TALLER (सल्लाको रूख अग्लो छ)', labelNe: 'सल्लाको रूख अग्लो छ', isCorrect: true, explanationEn: 'Excellent! Height means vertical reach from the ground, not width!', explanationNe: 'उत्कृष्ट! उचाइ भनेको जमिनबाट ठाडो पुगेको दूरी हो, चौडाइ होइन!' },
      { id: 'opt_house_wide', labelEn: 'House is TALLER because it is wide', labelNe: 'घर चौडा भएकाले अग्लो छ', isCorrect: false, explanationEn: 'Being wide does not make an object tall.', explanationNe: 'चौडा हुँदैमा वस्तु अग्लो हुँदैन।' },
    ],
  },
  {
    id: 'hcq_4',
    type: 'FIND_TALL',
    questionEn: 'Between a Grade 1 student and a school teacher standing on the same floor, who is TALLER?',
    questionNe: 'एउटै भुइँमा उभिँदा कक्षा १ को विद्यार्थी र शिक्षकमा को अग्लो हुनुहुन्छ?',
    options: [
      { id: 'opt_teacher', labelEn: 'The Teacher is TALLER (शिक्षक अग्लो हुनुहुन्छ)', labelNe: 'शिक्षक अग्लो हुनुहुन्छ', isCorrect: true, explanationEn: 'Correct! Adults stand taller than primary students.', explanationNe: 'सबास! शिक्षक विद्यार्थीभन्दा उचाइमा अग्लो हुनुहुन्छ।' },
      { id: 'opt_student', labelEn: 'The Student is TALLER', labelNe: 'विद्यार्थी अग्लो छ', isCorrect: false, explanationEn: 'The young child is shorter in height.', explanationNe: 'सानो बाबु उचाइमा होचो छ।' },
    ],
  },
  {
    id: 'hcq_5',
    type: 'ORDER',
    questionEn: 'Which is the correct order from SHORTEST to TALLEST?',
    questionNe: 'होचोदेखि अग्लो क्रममा कुन सही छ?',
    options: [
      { id: 'opt_ord_correct', labelEn: 'Flower Bush → Fruit Tree → Pine Tree', labelNe: 'फूलको बोट → फलको रूख → सल्लाको रूख', isCorrect: true, explanationEn: 'Spot on! 1.3m (Short) → 2.5m (Medium) → 4.8m (Tall)!', explanationNe: 'सबास! फूल (होचो) → फलको रूख (मध्यम) → सल्ला (अग्लो) सही क्रम हो।' },
      { id: 'opt_ord_wrong', labelEn: 'Pine Tree → Fruit Tree → Flower Bush', labelNe: 'सल्ला → फलको रूख → फूलको बोट', isCorrect: false, explanationEn: 'That is tallest to shortest!', explanationNe: 'यो त अग्लोदेखि होचो क्रम भयो!' },
    ],
  },
  {
    id: 'hcq_6',
    type: 'FIND_SHORT',
    questionEn: 'Which flagpole flies the flag closest to the ground (SHORTEST)?',
    questionNe: 'कुन पोलमा झण्डा जमिन नजिकै (सबैभन्दा होचो) छ?',
    options: [
      { id: 'opt_short_pole', labelEn: 'Short 2-meter Flagpole (होचो पोल)', labelNe: 'होचो पोल', isCorrect: true, explanationEn: 'Very good! The 2m pole is the shortest flagpole.', explanationNe: 'धेरै राम्रो! २ मिटरको पोल सबैभन्दा होचो छ।' },
      { id: 'opt_tall_pole', labelEn: 'Tall 4.8-meter Flagpole (अग्लो पोल)', labelNe: 'अग्लो पोल', isCorrect: false, explanationEn: 'The 4.8m pole is tall.', explanationNe: '४.८ मिटरको पोल त धेरै अग्लो छ।' },
    ],
  },
  {
    id: 'hcq_7',
    type: 'HEIGHT_VS_WIDTH',
    questionEn: 'When we measure how TALL someone or something is, where do we measure from?',
    questionNe: 'कुनै वस्तु वा व्यक्ति कति अग्लो छ भनी नाप्दा कहाँबाट नापिन्छ?',
    options: [
      { id: 'opt_ground_to_top', labelEn: 'From common ground level to the highest top point', labelNe: 'समान जमिनको सतहबाट माथिल्लो टुप्पोसम्म', isCorrect: true, explanationEn: 'Correct! Vertical height is always measured from a common ground plane up to the peak.', explanationNe: 'सबास! ठाडो उचाइ सधैँ समान जमिनबाट माथिल्लो बिन्दुसम्म नापिन्छ।' },
      { id: 'opt_side_to_side', labelEn: 'From left side to right side', labelNe: 'दायाँबाट बायाँतर्फ', isCorrect: false, explanationEn: 'Side to side is width, not height!', explanationNe: 'दायाँ-बायाँ त चौडाइ हो, उचाइ होइन!' },
    ],
  },
];

