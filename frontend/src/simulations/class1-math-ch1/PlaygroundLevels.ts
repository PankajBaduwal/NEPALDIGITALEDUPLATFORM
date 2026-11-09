/**
 * PlaygroundLevels.ts
 * Data structures and logic for Class 1 Mathematics Chapter 1 Levels & Assessment
 */

export interface LevelStep {
  id: string;
  instructionEn: string;
  instructionNe: string;
  targetObject: 'cat' | 'dog' | 'ball' | 'bird' | 'waterPot' | 'bag' | 'child' | 'choice';
  targetPosition: 'inside_house' | 'outside_house' | 'inside_basket' | 'outside_basket' | 'above_tree' | 'below_table' | 'above_table' | 'left' | 'right' | 'choice';
  demoAction?: 'door_cat' | 'dog_veranda' | 'bird_tree' | 'ball_table' | 'elephants' | 'pencils' | 'animals_line';
  options?: Array<{
    id: string;
    labelEn: string;
    labelNe: string;
    isCorrect: boolean;
    explanationEn: string;
    explanationNe: string;
  }>;
  hintEn: string;
  hintNe: string;
}

export interface SimulationLevel {
  levelNumber: number;
  titleEn: string;
  titleNe: string;
  conceptEn: string;
  conceptNe: string;
  descriptionEn: string;
  descriptionNe: string;
  steps: LevelStep[];
}

// ── SPATIAL TASKS FOR MODE 1, 2, AND 4 ─────────────────────────────
export interface SpatialPlaygroundTask {
  id: string;
  mode: 1 | 2 | 4;
  titleEn: string;
  titleNe: string;
  instructionEn: string;
  instructionNe: string;
  targetObject: 'cat' | 'dog' | 'bird' | 'rabbit' | 'butterfly' | 'ball' | 'teddy' | 'toyCar' | 'waterPot' | 'bag';
  targetPosition: 'inside_house' | 'outside_house' | 'inside_basket' | 'outside_basket' | 'inside_box' | 'outside_box' | 'above_tree' | 'below_tree' | 'above_flower' | 'below_flower' | 'above_table' | 'below_table';
  targetZoneKey: 'house' | 'basket' | 'box' | 'table_above' | 'table_below' | 'tree' | 'flower';
  hint1En: string;
  hint1Ne: string;
  hint2En: string;
  hint2Ne: string;
  successMessageEn: string;
  successMessageNe: string;
}

export const MODE_1_INSIDE_OUTSIDE_TASKS: SpatialPlaygroundTask[] = [
  {
    id: 'm1_t1',
    mode: 1,
    titleEn: 'Cat Inside the House',
    titleNe: 'बिरालो घरभित्र',
    instructionEn: 'Put the gentle cat INSIDE the village house! (भित्र)',
    instructionNe: 'बिरालोलाई घरभित्र राख्नुहोस्! (भित्र)',
    targetObject: 'cat',
    targetPosition: 'inside_house',
    targetZoneKey: 'house',
    hint1En: 'The house has an open door. Drag or tap to place the cat inside the room.',
    hint1Ne: 'घरको ढोका खुल्ला छ। बिरालोलाई कोठाभित्र लैजानुहोस्।',
    hint2En: 'Move the cat past the doorway into the warm room.',
    hint2Ne: 'बिरालोलाई ढोकाबाट भित्र कोठाको गलैँचामा राख्नुहोस्।',
    successMessageEn: 'Wonderful! The cat is resting safely inside the house (भित्र)!',
    successMessageNe: 'सबास! बिरालो सुरक्षित रूपमा घरभित्र (भित्र) बस्यो!',
  },
  {
    id: 'm1_t2',
    mode: 1,
    titleEn: 'Dog Outside on the Veranda',
    titleNe: 'कुकुर पिँढीमा बाहिर',
    instructionEn: 'Put the friendly dog OUTSIDE on the veranda! (बाहिर)',
    instructionNe: 'कुकुरलाई घरबाहिर पिँढीमा राख्नुहोस्! (बाहिर)',
    targetObject: 'dog',
    targetPosition: 'outside_house',
    targetZoneKey: 'house',
    hint1En: 'Outside means in the garden or on the front veranda, not in the room.',
    hint1Ne: 'बाहिर भनेको कोठाभित्र होइन, पिँढी वा हरियो बगैँचामा हो।',
    hint2En: 'Place the dog outside the front doorway.',
    hint2Ne: 'कुकुरलाई घरको ढोकाअगाडिको पिँढीमा राख्नुहोस्।',
    successMessageEn: 'Great job! The faithful dog is sitting outside on the veranda (बाहिर)!',
    successMessageNe: 'धेरै राम्रो! कुकुर घरबाहिर पिँढीमा (बाहिर) बसेको छ!',
  },
  {
    id: 'm1_t3',
    mode: 1,
    titleEn: 'Ball Inside the Basket',
    titleNe: 'बल टोकरीभित्र',
    instructionEn: 'Put the red play ball INSIDE the woven bamboo basket (डोको)! (भित्र)',
    instructionNe: 'रातो बललाई बाँसको टोकरीभित्र राख्नुहोस्! (भित्र)',
    targetObject: 'ball',
    targetPosition: 'inside_basket',
    targetZoneKey: 'basket',
    hint1En: 'Drag the red ball into the opening of the round bamboo basket.',
    hint1Ne: 'रातो बललाई बाँसको टोकरीको मुखभित्र हाल्नुहोस्।',
    hint2En: 'The basket sits in the garden. Drop the ball right inside.',
    hint2Ne: 'टोकरी बगैँचामा छ। बललाई टोकरीको भित्र खसाल्नुहोस्।',
    successMessageEn: 'Excellent! The ball is stored inside the basket (भित्र)!',
    successMessageNe: 'उत्कृष्ट! बल बाँसको टोकरीभित्र (भित्र) राखियो!',
  },
  {
    id: 'm1_t4',
    mode: 1,
    titleEn: 'Teddy Bear Inside the Toy Box',
    titleNe: 'गुडिया बाकसभित्र',
    instructionEn: 'Put the cuddly teddy bear INSIDE the wooden toy box! (भित्र)',
    instructionNe: 'गुडियालाई काठको खेलौना बाकसभित्र राख्नुहोस्! (भित्र)',
    targetObject: 'teddy',
    targetPosition: 'inside_box',
    targetZoneKey: 'box',
    hint1En: 'The wooden toy box has a hinged lid. Place the teddy bear into the box.',
    hint1Ne: 'काठको बाकसको ढक्कन खुल्छ। गुडियालाई बाकसभित्र हाल्नुहोस्।',
    hint2En: 'Move the teddy over the wooden box and drop it inside.',
    hint2Ne: 'गुडियालाई बाकसको भित्री भागमा राख्नुहोस्।',
    successMessageEn: 'Well done! The teddy bear is neatly packed inside the toy box (भित्र)!',
    successMessageNe: 'सबास! गुडिया बाकसभित्र (भित्र) सुरक्षित भयो!',
  },
  {
    id: 'm1_t5',
    mode: 1,
    titleEn: 'Toy Car Outside on the Path',
    titleNe: 'खेलौना गाडी बाहिर बाटोमा',
    instructionEn: 'Put the little toy car OUTSIDE on the grassy path! (बाहिर)',
    instructionNe: 'खेलौना गाडीलाई बाकसबाहिर घाँसमा राख्नुहोस्! (बाहिर)',
    targetObject: 'toyCar',
    targetPosition: 'outside_box',
    targetZoneKey: 'box',
    hint1En: 'Take the car out of any container and place it outside on the lawn.',
    hint1Ne: 'गाडीलाई कुनै बाकसमा नराखी बाहिर हरियो घाँसमा राख्नुहोस्।',
    hint2En: 'Outside means open ground in the sunny playground.',
    hint2Ne: 'बाहिर भनेको खुला जमिनमा हो।',
    successMessageEn: 'Super! The toy car is zooming outside on the lawn (बाहिर)!',
    successMessageNe: 'अति राम्रो! गाडी बाहिर घाँसमा (बाहिर) गुड्न तयार छ!',
  },
];

export const MODE_2_ABOVE_BELOW_TASKS: SpatialPlaygroundTask[] = [
  {
    id: 'm2_t1',
    mode: 2,
    titleEn: 'Bird Above the Pine Tree',
    titleNe: 'चरा रूखमाथि',
    instructionEn: 'Fly the blue mountain bird ABOVE the tall pine tree! (माथि)',
    instructionNe: 'नीलो चरालाई अग्लो सल्लाको रूखमाथि उडाउनुहोस्! (माथि)',
    targetObject: 'bird',
    targetPosition: 'above_tree',
    targetZoneKey: 'tree',
    hint1En: 'Above means higher in altitude. Move the bird up near the tree canopy.',
    hint1Ne: 'माथि भनेको उचाइमा हो। चरालाई रूखको माथिल्लो हाँगातिर लैजानुहोस्।',
    hint2En: 'Perch the bird on top of the green pine tree.',
    hint2Ne: 'चरालाई रूखको टुप्पोमा माथि राख्नुहोस्।',
    successMessageEn: 'Wonderful! The blue bird is singing high above the tree (माथि)!',
    successMessageNe: 'सबास! नीलो चरा रूखको माथि (माथि) सुरिलो गाउँदै छ!',
  },
  {
    id: 'm2_t2',
    mode: 2,
    titleEn: 'Rabbit Below the Tree',
    titleNe: 'खरायो रूखमुनि तल',
    instructionEn: 'Put the white rabbit on the ground BELOW the tree! (तल)',
    instructionNe: 'सेतो खरायोलाई रूखको छहारीमुनि तल राख्नुहोस्! (तल)',
    targetObject: 'rabbit',
    targetPosition: 'below_tree',
    targetZoneKey: 'tree',
    hint1En: 'Below means under the green branches on the cool grass.',
    hint1Ne: 'तल भनेको जमिनमा छहारीमुनि हो। खरायोलाई रूखको फेदमा राख्नुहोस्।',
    hint2En: 'The rabbit rests beneath the tall branches on the ground.',
    hint2Ne: 'खरायो रूखमुनि घाँसमा बस्छ।',
    successMessageEn: 'Perfect! The rabbit is resting coolly below the tree branches (तल)!',
    successMessageNe: 'धेरै राम्रो! खरायो रूखमुनि तल (तल) आनन्दले बस्यो!',
  },
  {
    id: 'm2_t3',
    mode: 2,
    titleEn: 'Water Pitcher Above the Table',
    titleNe: 'गाग्री टेबलमाथि',
    instructionEn: 'Place the brass water pitcher (गाग्री) ABOVE on the wooden table! (माथि)',
    instructionNe: 'पित्तलको गाग्रीलाई काठको टेबलमाथि राख्नुहोस्! (माथि)',
    targetObject: 'waterPot',
    targetPosition: 'above_table',
    targetZoneKey: 'table_above',
    hint1En: 'Above the table means sitting upon the flat wooden tabletop.',
    hint1Ne: 'टेबलमाथि भनेको टेबलको माथिल्लो काठको सतहमा हो।',
    hint2En: 'Rest the pot right on top of the study table.',
    hint2Ne: 'गाग्रीलाई टेबलको माथि राख्नुहोस्।',
    successMessageEn: 'Splendid! The traditional pitcher is proudly placed above the table (माथि)!',
    successMessageNe: 'उत्कृष्ट! गाग्री टेबलमाथि (माथि) सुरक्षित छ!',
  },
  {
    id: 'm2_t4',
    mode: 2,
    titleEn: 'School Bag Below the Table',
    titleNe: 'झोला टेबलमुनि तल',
    instructionEn: 'Put the blue school bag BELOW the study table! (तल)',
    instructionNe: 'नीलो स्कुल झोलालाई टेबलमुनि तल राख्नुहोस्! (तल)',
    targetObject: 'bag',
    targetPosition: 'below_table',
    targetZoneKey: 'table_below',
    hint1En: 'Below means under the wooden table surface on the ground.',
    hint1Ne: 'तल भनेको टेबलको काठमुनि जमिनको भागमा हो।',
    hint2En: 'Slide the backpack underneath the four table legs.',
    hint2Ne: 'झोलालाई टेबलको मुनि जमिनमा राख्नुहोस्।',
    successMessageEn: 'Great! The school bag is neatly stored below the table (तल)!',
    successMessageNe: 'सबास! स्कुल झोला टेबलमुनि तल (तल) राखियो!',
  },
  {
    id: 'm2_t5',
    mode: 2,
    titleEn: 'Butterfly Above the Flower',
    titleNe: 'पुतली फूलमाथि',
    instructionEn: 'Fly the bright butterfly ABOVE the yellow sunflower! (माथि)',
    instructionNe: 'रङ्गीबिरङ्गी पुतलीलाई पहेँलो फूलमाथि उडाउनुहोस्! (माथि)',
    targetObject: 'butterfly',
    targetPosition: 'above_flower',
    targetZoneKey: 'flower',
    hint1En: 'Above the flower means hovering over its golden petals.',
    hint1Ne: 'फूलमाथि भनेको फूलको पहेँलो पत्रदलभन्दा माथि हावामा हो।',
    hint2En: 'Fly the butterfly right above the blooming flower in the garden.',
    hint2Ne: 'पुतलीलाई बगैँचाको ठूलो फूलमाथि उडाउनुहोस्।',
    successMessageEn: 'Magical! The colorful butterfly is dancing above the sunflower (माथि)!',
    successMessageNe: 'अति सुन्दर! पुतली पहेँलो फूलमाथि (माथि) उड्दै छ!',
  },
];

export const MODE_4_FOLLOW_INSTRUCTION_TASKS: SpatialPlaygroundTask[] = [
  ...MODE_1_INSIDE_OUTSIDE_TASKS.slice(0, 4),
  ...MODE_2_ABOVE_BELOW_TASKS.slice(0, 4),
];

export const DISCOVERY_OBJECT_ITEMS = [
  { id: 'cat', nameEn: 'Cat', nameNe: 'बिरालो', icon: '🐱', category: 'animal' },
  { id: 'dog', nameEn: 'Dog', nameNe: 'कुकुर', icon: '🐶', category: 'animal' },
  { id: 'bird', nameEn: 'Bird', nameNe: 'चरा', icon: '🐦', category: 'animal' },
  { id: 'rabbit', nameEn: 'Rabbit', nameNe: 'खरायो', icon: '🐰', category: 'animal' },
  { id: 'butterfly', nameEn: 'Butterfly', nameNe: 'पुतली', icon: '🦋', category: 'animal' },
  { id: 'ball', nameEn: 'Ball', nameNe: 'बल', icon: '⚽', category: 'object' },
  { id: 'teddy', nameEn: 'Teddy Bear', nameNe: 'गुडिया', icon: '🧸', category: 'object' },
  { id: 'toyCar', nameEn: 'Toy Car', nameNe: 'गाडी', icon: '🚗', category: 'object' },
  { id: 'waterPot', nameEn: 'Water Pot', nameNe: 'गाग्री', icon: '🏺', category: 'object' },
  { id: 'bag', nameEn: 'School Bag', nameNe: 'झोला', icon: '🎒', category: 'object' },
];

export const PLAYGROUND_LEVELS: SimulationLevel[] = [
  // ── LEVEL 1: INSIDE AND OUTSIDE (भित्र र बाहिर) ───────────────

  {
    levelNumber: 1,
    titleEn: 'Inside and Outside',
    titleNe: 'भित्र र बाहिर',
    conceptEn: 'Inside & Outside',
    conceptNe: 'भित्र र बाहिरको अवधारणा',
    descriptionEn: 'Learn whether an object or animal is inside or outside another object.',
    descriptionNe: 'कुनै वस्तु वा जनावर अर्को वस्तुको भित्र छ वा बाहिर छ भनी बुझ्नुहोस्।',
    steps: [
      {
        id: 'L1_S1',
        instructionEn: 'Tap "Watch Demo" to see the cat enter the house and the dog stay outside.',
        instructionNe: '"डेमो हेर्नुहोस्" थिचेर बिरालो घरभित्र पसेको र कुकुर बाहिर बसेको हेर्नुहोस्।',
        targetObject: 'choice',
        targetPosition: 'choice',
        demoAction: 'door_cat',
        hintEn: 'Watch the cat walk through the open door into the house.',
        hintNe: 'खुल्ला ढोकाबाट बिरालो घरभित्र पसेको ध्यान दिएर हेर्नुहोस्।',
      },
      {
        id: 'L1_S2',
        instructionEn: 'Put the cat inside the house! (भित्र)',
        instructionNe: 'बिरालोलाई घरभित्र राख्नुहोस्! (भित्र)',
        targetObject: 'cat',
        targetPosition: 'inside_house',
        hintEn: 'Click or drag the cat into the doorway of the house.',
        hintNe: 'बिरालोलाई थिचेर ढोकाबाट घरभित्र लैजानुहोस्।',
      },
      {
        id: 'L1_S3',
        instructionEn: 'Put the dog outside on the veranda! (बाहिर)',
        instructionNe: 'कुकुरलाई घरबाहिर पिँढीमा राख्नुहोस्! (बाहिर)',
        targetObject: 'dog',
        targetPosition: 'outside_house',
        hintEn: 'Place the dog outside in the garden or veranda.',
        hintNe: 'कुकुरलाई घरबाहिर बगैँचा वा पिँढीमा राख्नुहोस्।',
      },
      {
        id: 'L1_S4',
        instructionEn: 'Put the red ball inside the basket! (भित्र)',
        instructionNe: 'रातो बललाई टोकरीभित्र राख्नुहोस्! (भित्र)',
        targetObject: 'ball',
        targetPosition: 'inside_basket',
        hintEn: 'Move the ball into the woven bamboo basket.',
        hintNe: 'बललाई बाँसको टोकरीभित्र हाल्नुहोस्।',
      },
      {
        id: 'L1_S5',
        instructionEn: 'Put the red ball outside on the grass! (बाहिर)',
        instructionNe: 'रातो बललाई टोकरीबाहिर घाँसमा राख्नुहोस्! (बाहिर)',
        targetObject: 'ball',
        targetPosition: 'outside_basket',
        hintEn: 'Take the ball out of the basket onto the lawn.',
        hintNe: 'बललाई टोकरीबाट बाहिर हरियो घाँसमा राख्नुहोस्।',
      },
      {
        id: 'L1_S6',
        instructionEn: 'Where is the cat right now?',
        instructionNe: 'अहिले बिरालो कहाँ छ?',
        targetObject: 'choice',
        targetPosition: 'choice',
        options: [
          {
            id: 'opt_in',
            labelEn: 'Inside the house (घरभित्र)',
            labelNe: 'घरभित्र',
            isCorrect: true,
            explanationEn: 'Correct! The cat is inside the house.',
            explanationNe: 'सबास! बिरालो घरको भित्र छ।',
          },
          {
            id: 'opt_out',
            labelEn: 'Outside the house (घरबाहिर)',
            labelNe: 'घरबाहिर',
            isCorrect: false,
            explanationEn: 'The cat is protected inside the room, not outside.',
            explanationNe: 'बिरालो कोठाभित्र छ, बाहिर होइन।',
          },
        ],
        hintEn: 'Look at the house: is the cat inside or outside?',
        hintNe: 'घरमा हेर्नुहोस्: बिरालो भित्र छ कि बाहिर?',
      },
    ],
  },

  // ── LEVEL 2: ABOVE AND BELOW (माथि र तल) ─────────────────────
  {
    levelNumber: 2,
    titleEn: 'Above and Below',
    titleNe: 'माथि र तल',
    conceptEn: 'Vertical Placement (Above & Below)',
    conceptNe: 'ठाडो स्थान: माथि र तल',
    descriptionEn: 'Understand vertical position relative to other objects.',
    descriptionNe: 'कुनै वस्तु अर्को वस्तुको माथि छ वा तल छ भनी बुझ्नुहोस्।',
    steps: [
      {
        id: 'L2_S1',
        instructionEn: 'Tap "Watch Demo" to see the bird above the tree and the ball below the table.',
        instructionNe: '"डेमो हेर्नुहोस्" थिचेर चरा रूखमाथि र बल टेबलमुनि तल हेर्नुहोस्।',
        targetObject: 'choice',
        targetPosition: 'choice',
        demoAction: 'bird_tree',
        hintEn: 'Observe the bird perched high above, and the ball resting below.',
        hintNe: 'चरा रूखमाथि बसेको र बल टेबलमुनि तल रहेको हेर्नुहोस्।',
      },
      {
        id: 'L2_S2',
        instructionEn: 'Fly the blue bird above the pine tree! (माथि)',
        instructionNe: 'नीलो चरालाई रूखमाथि उडाउनुहोस्! (माथि)',
        targetObject: 'bird',
        targetPosition: 'above_tree',
        hintEn: 'Send the bird to perch high above the tree branches.',
        hintNe: 'चरालाई रूखको माथिल्लो हाँगामा राख्नुहोस्।',
      },
      {
        id: 'L2_S3',
        instructionEn: 'Put the play ball below the wooden table! (तल)',
        instructionNe: 'बललाई काठको टेबलमुनि तल राख्नुहोस्! (तल)',
        targetObject: 'ball',
        targetPosition: 'below_table',
        hintEn: 'Roll the ball underneath the table.',
        hintNe: 'बललाई टेबलको मुनि भुइँमा राख्नुहोस्।',
      },
      {
        id: 'L2_S4',
        instructionEn: 'Place the brass water pitcher above the table! (माथि)',
        instructionNe: 'पित्तलको गाग्रीलाई टेबलमाथि राख्नुहोस्! (माथि)',
        targetObject: 'waterPot',
        targetPosition: 'above_table',
        hintEn: 'Place the water pot on the top surface of the table.',
        hintNe: 'गाग्रीलाई टेबलको माथिल्लो सतहमा राख्नुहोस्।',
      },
      {
        id: 'L2_S5',
        instructionEn: 'Put the blue school bag below the table! (तल)',
        instructionNe: 'नीलो स्कुल झोलालाई टेबलमुनि तल राख्नुहोस्! (तल)',
        targetObject: 'bag',
        targetPosition: 'below_table',
        hintEn: 'Store the school bag on the ground under the table.',
        hintNe: 'झोलालाई टेबलको मुनि जमिनमा राख्नुहोस्।',
      },
    ],
  },

  // ── LEVEL 3: BIG AND SMALL, TALL AND SHORT (ठूलो र सानो, अग्लो र होचो) ──
  {
    levelNumber: 3,
    titleEn: 'Big and Small, Tall and Short',
    titleNe: 'ठूलो र सानो, अग्लो र होचो',
    conceptEn: 'Overall Size & Vertical Height',
    conceptNe: 'आकार (ठूलो/सानो) र उचाइ (अग्लो/होचो)',
    descriptionEn: 'Learn the key difference between overall size (big/small) and height (tall/short).',
    descriptionNe: 'समग्र आकार (ठूलो र सानो) र उचाइ (अग्लो र होचो) बीचको भिन्नता बुझ्नुहोस्।',
    steps: [
      {
        id: 'L3_S1',
        instructionEn: 'Which elephant is bigger in overall size? (ठूलो)',
        instructionNe: 'कुन हात्ती आकारमा ठूलो छ? (ठूलो)',
        targetObject: 'choice',
        targetPosition: 'choice',
        demoAction: 'elephants',
        options: [
          {
            id: 'opt_big_el',
            labelEn: 'Big Mother Elephant (ठूलो हात्ती)',
            labelNe: 'ठूलो हात्ती',
            isCorrect: true,
            explanationEn: 'Correct! The mother elephant has a much bigger body and size.',
            explanationNe: 'सबास! यो हात्तीको शरीर र आकार ठूलो छ।',
          },
          {
            id: 'opt_small_el',
            labelEn: 'Baby Elephant (सानो हात्ती)',
            labelNe: 'सानो हात्ती',
            isCorrect: false,
            explanationEn: 'The baby elephant is smaller in size.',
            explanationNe: 'छावा हात्ती आकारमा सानो छ।',
          },
        ],
        hintEn: 'Compare their body sizes: big means larger volume.',
        hintNe: 'दुवैको आकार हेर्नुहोस्: धेरै ठाउँ ओगट्ने ठूलो हुन्छ।',
      },
      {
        id: 'L3_S2',
        instructionEn: 'Which object is smaller? (सानो)',
        instructionNe: 'कुन वस्तु सानो छ? (सानो)',
        targetObject: 'choice',
        targetPosition: 'choice',
        options: [
          {
            id: 'opt_small_marble',
            labelEn: 'Small Glass Marble (सानो गुच्चा)',
            labelNe: 'सानो गुच्चा',
            isCorrect: true,
            explanationEn: 'Very good! The marble is much smaller than the football.',
            explanationNe: 'धेरै राम्रो! गुच्चा फुटबल भन्दा धेरै सानो छ।',
          },
          {
            id: 'opt_big_football',
            labelEn: 'Large Football (ठूलो फुटबल)',
            labelNe: 'ठूलो फुटबल',
            isCorrect: false,
            explanationEn: 'The football is big, not small.',
            explanationNe: 'फुटबल ठूलो छ, सानो होइन।',
          },
        ],
        hintEn: 'Select the tiny item.',
        hintNe: 'सानो वस्तु छान्नुहोस्।',
      },
      {
        id: 'L3_S3',
        instructionEn: 'Compare heights: which tree is TALLER? (अग्लो)',
        instructionNe: 'उचाइ तुलना गर्नुहोस्: कुन रूख अग्लो छ? (अग्लो)',
        targetObject: 'choice',
        targetPosition: 'choice',
        options: [
          {
            id: 'opt_tall_pine',
            labelEn: 'Tall Himalayan Pine Tree (अग्लो सल्लाको रूख)',
            labelNe: 'अग्लो सल्लाको रूख',
            isCorrect: true,
            explanationEn: 'Excellent! The pine tree reaches high up into the sky.',
            explanationNe: 'सबास! सल्लाको रूख आकाशतर्फ धेरै माथिसम्म पुगेको छ।',
          },
          {
            id: 'opt_short_bush',
            labelEn: 'Short Marigold Bush (होचो फूलको बोट)',
            labelNe: 'होचो फूलको बोट',
            isCorrect: false,
            explanationEn: 'The flower bush is short and close to the ground.',
            explanationNe: 'फूलको बोट भुइँ नजिकै होचो छ।',
          },
        ],
        hintEn: 'Look at the vertical height reaching towards the sky.',
        hintNe: 'माथि आकाशतर्फ पुगेको उचाइ हेर्नुहोस्।',
      },
      {
        id: 'L3_S4',
        instructionEn: 'Which building is SHORTER in height? (होचो)',
        instructionNe: 'कुन घर उचाइमा होचो छ? (होचो)',
        targetObject: 'choice',
        targetPosition: 'choice',
        options: [
          {
            id: 'opt_short_shed',
            labelEn: 'Short Garden Shed (होचो छाप्रो)',
            labelNe: 'होचो छाप्रो',
            isCorrect: true,
            explanationEn: 'Correct! The small shed has low height (होचो).',
            explanationNe: 'सबास! छाप्रोको उचाइ कम छ, त्यसैले यो होचो छ।',
          },
          {
            id: 'opt_tall_house',
            labelEn: 'Two-Storey Village House (अग्लो दुईतले घर)',
            labelNe: 'अग्लो दुईतले घर',
            isCorrect: false,
            explanationEn: 'The two-storey house is tall, not short.',
            explanationNe: 'दुईतले घर अग्लो छ, होचो होइन।',
          },
        ],
        hintEn: 'Short means having less height from the ground.',
        hintNe: 'जमिनबाट कम उचाइ भएको वस्तु होचो हुन्छ।',
      },
    ],
  },

  // ── LEVEL 4: LONG AND SHORT (लामो र छोटो) ────────────────────
  {
    levelNumber: 4,
    titleEn: 'Long and Short',
    titleNe: 'लामो र छोटो',
    conceptEn: 'Horizontal Length',
    conceptNe: 'तेर्सो लम्बाइ (लामो र छोटो)',
    descriptionEn: 'Compare the lengths of horizontal objects from a common starting line.',
    descriptionNe: 'एउटै सुरुवाती रेखाबाट वस्तुहरूको लम्बाइ तुलना गरेर लामो र छोटो बुझ्नुहोस्।',
    steps: [
      {
        id: 'L4_S1',
        instructionEn: 'Which wooden pencil is LONGER? (लामो)',
        instructionNe: 'कुन सिसाकलम लामो छ? (लामो)',
        targetObject: 'choice',
        targetPosition: 'choice',
        demoAction: 'pencils',
        options: [
          {
            id: 'opt_long_pencil',
            labelEn: 'Long Yellow Pencil (लामो पहेँलो सिसाकलम)',
            labelNe: 'लामो पहेँलो सिसाकलम',
            isCorrect: true,
            explanationEn: 'Great job! The yellow pencil stretches farther in length.',
            explanationNe: 'धेरै राम्रो! पहेँलो सिसाकलमको लम्बाइ बढी छ।',
          },
          {
            id: 'opt_short_pencil',
            labelEn: 'Short Sharpened Pencil (छोटो सिसाकलम)',
            labelNe: 'छोटो सिसाकलम',
            isCorrect: false,
            explanationEn: 'This pencil is short in length.',
            explanationNe: 'यो सिसाकलम लम्बाइमा छोटो छ।',
          },
        ],
        hintEn: 'Look at how far each pencil reaches from left to right.',
        hintNe: 'देब्रेबाट दायाँतर्फ कुन सिसाकलम बढी लम्बिएको छ हेर्नुहोस्।',
      },
      {
        id: 'L4_S2',
        instructionEn: 'Which jute rope is SHORTER? (छोटो)',
        instructionNe: 'कुन डोरी छोटो छ? (छोटो)',
        targetObject: 'choice',
        targetPosition: 'choice',
        options: [
          {
            id: 'opt_short_rope',
            labelEn: 'Short Jump Rope (छोटो डोरी)',
            labelNe: 'छोटो डोरी',
            isCorrect: true,
            explanationEn: 'Correct! This rope has a shorter length.',
            explanationNe: 'सबास! यो डोरी लम्बाइमा छोटो छ।',
          },
          {
            id: 'opt_long_rope',
            labelEn: 'Long Tug-of-War Rope (लामो डोरी)',
            labelNe: 'लामो डोरी',
            isCorrect: false,
            explanationEn: 'This rope extends very far across the ground.',
            explanationNe: 'यो डोरी भुइँमा धेरै परसम्म लम्बिएको छ।',
          },
        ],
        hintEn: 'Select the rope with less length.',
        hintNe: 'कम लम्बाइ भएको डोरी छान्नुहोस्।',
      },
      {
        id: 'L4_S3',
        instructionEn: 'Compare two village roads: which one is longer?',
        instructionNe: 'दुई गाउँले गोरेटो तुलना गर्नुहोस्: कुन बाटो लामो छ?',
        targetObject: 'choice',
        targetPosition: 'choice',
        options: [
          {
            id: 'opt_long_path',
            labelEn: 'Winding Mountain Road (लामो डाँडाको बाटो)',
            labelNe: 'लामो डाँडाको बाटो',
            isCorrect: true,
            explanationEn: 'Correct! The winding path extends all the way through the village.',
            explanationNe: 'सबास! घुमाउरो बाटो गाउँभरि परसम्म लम्बिएको छ।',
          },
          {
            id: 'opt_short_path',
            labelEn: 'Short Garden Courtyard Path (छोटो आँगनको बाटो)',
            labelNe: 'छोटो आँगनको बाटो',
            isCorrect: false,
            explanationEn: 'The courtyard path ends quickly.',
            explanationNe: 'आँगनको बाटो छिट्टै सकिन्छ।',
          },
        ],
        hintEn: 'Follow the road from start to finish.',
        hintNe: 'सुरुदेखि अन्त्यसम्म बाटोको लम्बाइ हेर्नुहोस्।',
      },
    ],
  },

  // ── LEVEL 5: DIRECTION AND DISTANCE (दायाँ, बायाँ, अगाडि, बिच, पछाडि, नजिक, टाढा) ──
  {
    levelNumber: 5,
    titleEn: 'Direction and Distance',
    titleNe: 'दायाँ, बायाँ, अगाडि, बिच, पछाडि, नजिक र टाढा',
    conceptEn: 'Directions & Relative Distance',
    conceptNe: 'दिशा र दूरी',
    descriptionEn: 'Understand Right and Left, Front, Middle and Behind, and Near and Far.',
    descriptionNe: 'दायाँ र बायाँ, अगाडि, बिच र पछाडि, तथा नजिक र टाढाका दिशाहरू र दूरी बुझ्नुहोस्।',
    steps: [
      {
        id: 'L5_S1',
        instructionEn: 'Guide the child to the RIGHT side! (दायाँ)',
        instructionNe: 'बालकलाई दायाँतर्फ लैजानुहोस्! (दायाँ)',
        targetObject: 'child',
        targetPosition: 'right',
        hintEn: 'Move towards the right side of your screen.',
        hintNe: 'पर्दाको दायाँतर्फ बालकलाई लैजानुहोस्।',
      },
      {
        id: 'L5_S2',
        instructionEn: 'Guide the child to the LEFT side! (बायाँ)',
        instructionNe: 'बालकलाई बायाँतर्फ लैजानुहोस्! (बायाँ)',
        targetObject: 'child',
        targetPosition: 'left',
        hintEn: 'Move towards the left side of your screen.',
        hintNe: 'पर्दाको बायाँतर्फ बालकलाई लैजानुहोस्।',
      },
      {
        id: 'L5_S3',
        instructionEn: 'Three animals are standing in a line: Dog, Cat, and Rabbit. Which animal is in the MIDDLE? (बिच)',
        instructionNe: 'तीन जनावरहरू लाइनमा छन्: कुकुर, बिरालो र खरायो। बिचमा कुन जनावर छ? (बिच)',
        targetObject: 'choice',
        targetPosition: 'choice',
        demoAction: 'animals_line',
        options: [
          {
            id: 'opt_cat_mid',
            labelEn: 'Cat (बिरालो)',
            labelNe: 'बिरालो',
            isCorrect: true,
            explanationEn: 'Correct! The cat stands in the middle between the dog and rabbit.',
            explanationNe: 'सबास! कुकुर र खरायोको बिचमा बिरालो छ।',
          },
          {
            id: 'opt_dog_front',
            labelEn: 'Dog in Front (कुकुर)',
            labelNe: 'कुकुर',
            isCorrect: false,
            explanationEn: 'The dog is at the front of the line.',
            explanationNe: 'कुकुर लाइनको अगाडि छ।',
          },
          {
            id: 'opt_rabbit_behind',
            labelEn: 'Rabbit Behind (खरायो)',
            labelNe: 'खरायो',
            isCorrect: false,
            explanationEn: 'The rabbit is behind at the back.',
            explanationNe: 'खरायो लाइनको पछाडि छ।',
          },
        ],
        hintEn: 'Look at the animal between the first and last animal.',
        hintNe: 'पहिलो र अन्तिम जनावरको बिचमा रहेको जनावर हेर्नुहोस्।',
      },
      {
        id: 'L5_S4',
        instructionEn: 'Which animal is BEHIND the others? (पछाडि)',
        instructionNe: 'सबैभन्दा पछाडि कुन जनावर छ? (पछाडि)',
        targetObject: 'choice',
        targetPosition: 'choice',
        options: [
          {
            id: 'opt_rab_behind',
            labelEn: 'White Rabbit (सेतो खरायो)',
            labelNe: 'सेतो खरायो',
            isCorrect: true,
            explanationEn: 'Correct! The rabbit is at the very back (पछाडि).',
            explanationNe: 'सबास! सेतो खरायो सबैभन्दा पछाडि छ।',
          },
          {
            id: 'opt_dog_f',
            labelEn: 'Brown Dog (कुकुर)',
            labelNe: 'कुकुर',
            isCorrect: false,
            explanationEn: 'The dog is standing in front.',
            explanationNe: 'कुकुर अगाडि उभिएको छ।',
          },
        ],
        hintEn: 'Identify the last animal at the back.',
        hintNe: 'लाइनको सबैभन्दा पछाडिको जनावर हेर्नुहोस्।',
      },
      {
        id: 'L5_S5',
        instructionEn: 'Relative distance: which object is NEAR to the child? (नजिक)',
        instructionNe: 'दूरी हेर्नुहोस्: बालकको नजिक कुन वस्तु छ? (नजिक)',
        targetObject: 'choice',
        targetPosition: 'choice',
        options: [
          {
            id: 'opt_near_basket',
            labelEn: 'Flower Basket right by the feet (नजिकैको टोकरी)',
            labelNe: 'नजिकैको टोकरी',
            isCorrect: true,
            explanationEn: 'Excellent! The basket is just beside the child (नजिक).',
            explanationNe: 'धेरै राम्रो! टोकरी बालकको छेवैमा नजिक छ।',
          },
          {
            id: 'opt_far_mountain',
            labelEn: 'Snowy Mountain Peak (टाढाको हिमाल)',
            labelNe: 'टाढाको हिमाल',
            isCorrect: false,
            explanationEn: 'The snowy mountain is very far away in the background (टाढा).',
            explanationNe: 'हिमाल पृष्ठभूमिमा धेरै टाढा छ।',
          },
        ],
        hintEn: 'Near means closest in physical distance.',
        hintNe: 'थोरै दूरीमा रहेको वस्तु नजिक हुन्छ।',
      },
    ],
  },
];

// ── FINAL ASSESSMENT QUESTIONS (12 Questions covering Chapter 1) ──
export interface AssessmentQuestion {
  id: string;
  concept: string;
  conceptNe: string;
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

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'Q1',
    concept: 'Inside & Outside',
    conceptNe: 'भित्र र बाहिर',
    questionEn: 'Where should the cat go to take shelter from the rain?',
    questionNe: 'पानी परेको बेला ओत लाग्न बिरालो कहाँ जानुपर्छ?',
    options: [
      {
        id: 'q1_in',
        labelEn: 'Inside the house (घरभित्र)',
        labelNe: 'घरभित्र',
        isCorrect: true,
        explanationEn: 'Correct! Inside the house provides shelter from the rain.',
        explanationNe: 'सबास! पानीबाट बच्न घरभित्र ओत लाग्नुपर्छ।',
      },
      {
        id: 'q1_out',
        labelEn: 'Outside in the open rain (खुला बाहिर)',
        labelNe: 'खुला बाहिर',
        isCorrect: false,
        explanationEn: 'Outside in the rain would make the cat wet.',
        explanationNe: 'बाहिर बस्दा पानीले भिज्छ।',
      },
    ],
  },
  {
    id: 'Q2',
    concept: 'Inside & Outside',
    conceptNe: 'भित्र र बाहिर',
    questionEn: 'Apples collected from the tree are kept ____ the fruit basket.',
    questionNe: 'रूखबाट टिपिएका स्याउहरू टोकरीको ____ राखिन्छ।',
    options: [
      {
        id: 'q2_in',
        labelEn: 'Inside (भित्र)',
        labelNe: 'भित्र',
        isCorrect: true,
        explanationEn: 'Apples are placed inside the basket.',
        explanationNe: 'स्याउहरू सुरक्षित राख्न टोकरीभित्र राखिन्छ।',
      },
      {
        id: 'q2_out',
        labelEn: 'Outside (बाहिर)',
        labelNe: 'बाहिर',
        isCorrect: false,
        explanationEn: 'Apples left outside might roll away or spoil.',
        explanationNe: 'बाहिर राख्दा स्याउ यताउति खस्न सक्छ।',
      },
    ],
  },
  {
    id: 'Q3',
    concept: 'Above & Below',
    conceptNe: 'माथि र तल',
    questionEn: 'A bird is perched on a branch. Where is the bird relative to the tree roots?',
    questionNe: 'रूखको हाँगामा चरा बसेको छ। जराको तुलनामा चरा कहाँ छ?',
    options: [
      {
        id: 'q3_above',
        labelEn: 'Above (माथि)',
        labelNe: 'माथि',
        isCorrect: true,
        explanationEn: 'The bird is high above the tree roots.',
        explanationNe: 'हाँगामा रहेको चरा जरा भन्दा माथि हुन्छ।',
      },
      {
        id: 'q3_below',
        labelEn: 'Below (तल)',
        labelNe: 'तल',
        isCorrect: false,
        explanationEn: 'Roots are below; the bird is above.',
        explanationNe: 'जरा तल जमिनमुनि हुन्छ, चरा माथि हुन्छ।',
      },
    ],
  },
  {
    id: 'Q4',
    concept: 'Above & Below',
    conceptNe: 'माथि र तल',
    questionEn: 'A dropped pencil is resting on the floor. It is ____ the study table.',
    questionNe: 'हातबाट खसेको सिसाकलम भुइँमा छ। त्यो पढ्ने टेबलको ____ छ।',
    options: [
      {
        id: 'q4_below',
        labelEn: 'Below the table (टेबलमुनि तल)',
        labelNe: 'टेबलमुनि तल',
        isCorrect: true,
        explanationEn: 'Correct! The floor under the table is below.',
        explanationNe: 'सबास! भुइँमा रहेको सिसाकलम टेबलको तल हुन्छ।',
      },
      {
        id: 'q4_above',
        labelEn: 'Above the table (टेबलमाथि)',
        labelNe: 'टेबलमाथि',
        isCorrect: false,
        explanationEn: 'The pencil is on the floor, not on top of the table.',
        explanationNe: 'सिसाकलम भुइँमा छ, टेबलमाथि होइन।',
      },
    ],
  },
  {
    id: 'Q5',
    concept: 'Big & Small',
    conceptNe: 'ठूलो र सानो',
    questionEn: 'Between an elephant and a mouse, which one is BIG? (ठूलो)',
    questionNe: 'हात्ती र मुसोमध्ये कुन जनावर ठूलो हुन्छ? (ठूलो)',
    options: [
      {
        id: 'q5_elephant',
        labelEn: 'Elephant (हात्ती)',
        labelNe: 'हात्ती',
        isCorrect: true,
        explanationEn: 'The elephant is very big in size.',
        explanationNe: 'हात्तीको शरीर र आकार धेरै ठूलो हुन्छ।',
      },
      {
        id: 'q5_mouse',
        labelEn: 'Mouse (मुसो)',
        labelNe: 'मुसो',
        isCorrect: false,
        explanationEn: 'The mouse is tiny and small.',
        explanationNe: 'मुसो सानो जनावर हो।',
      },
    ],
  },
  {
    id: 'Q6',
    concept: 'Big & Small',
    conceptNe: 'ठूलो र सानो',
    questionEn: 'Between a pumpkin and a grape, which one is SMALL? (सानो)',
    questionNe: 'फर्सी र अङ्गुरमध्ये कुन फल सानो हुन्छ? (सानो)',
    options: [
      {
        id: 'q6_grape',
        labelEn: 'Grape (अङ्गुर)',
        labelNe: 'अङ्गुर',
        isCorrect: true,
        explanationEn: 'The grape is small and fits in your hand.',
        explanationNe: 'अङ्गुर सानो दाना हुन्छ।',
      },
      {
        id: 'q6_pumpkin',
        labelEn: 'Pumpkin (फर्सी)',
        labelNe: 'फर्सी',
        isCorrect: false,
        explanationEn: 'A pumpkin is heavy and big.',
        explanationNe: 'फर्सी आकारमा ठूलो हुन्छ।',
      },
    ],
  },
  {
    id: 'Q7',
    concept: 'Tall & Short',
    conceptNe: 'अग्लो र होचो',
    questionEn: 'Between a high mountain and a small hill, which one is TALLER? (अग्लो)',
    questionNe: 'हिमाल र सानो ढिस्कोमध्ये कुन अग्लो हुन्छ? (अग्लो)',
    options: [
      {
        id: 'q7_mountain',
        labelEn: 'High Snowy Mountain (अग्लो हिमाल)',
        labelNe: 'अग्लो हिमाल',
        isCorrect: true,
        explanationEn: 'Himalayan peaks are the tallest in the world!',
        explanationNe: 'हिमालको उचाइ धेरै बढी र अग्लो हुन्छ!',
      },
      {
        id: 'q7_hill',
        labelEn: 'Small Hill (होचो ढिस्को)',
        labelNe: 'होचो ढिस्को',
        isCorrect: false,
        explanationEn: 'A small hill has much lower height.',
        explanationNe: 'ढिस्कोको उचाइ कम र होचो हुन्छ।',
      },
    ],
  },
  {
    id: 'Q8',
    concept: 'Tall & Short',
    conceptNe: 'अग्लो र होचो',
    questionEn: 'Between an adult teacher and a Class 1 student, who is SHORTER in height? (होचो)',
    questionNe: 'शिक्षक र कक्षा १ को विद्यार्थीमध्ये उचाइमा को होचो हुन्छ? (होचो)',
    options: [
      {
        id: 'q8_student',
        labelEn: 'Class 1 Student (कक्षा १ को विद्यार्थी)',
        labelNe: 'कक्षा १ को विद्यार्थी',
        isCorrect: true,
        explanationEn: 'Class 1 children have lower height (होचो).',
        explanationNe: 'कक्षा १ का साना बालबालिकाको उचाइ होचो हुन्छ।',
      },
      {
        id: 'q8_teacher',
        labelEn: 'Adult Teacher (अग्लो शिक्षक)',
        labelNe: 'अग्लो शिक्षक',
        isCorrect: false,
        explanationEn: 'Adults are taller in height.',
        explanationNe: 'शिक्षक उचाइमा अग्लो हुनुहुन्छ।',
      },
    ],
  },
  {
    id: 'Q9',
    concept: 'Long & Short',
    conceptNe: 'लामो र छोटो',
    questionEn: 'A ruler of 30 cm is ____ than an eraser of 3 cm.',
    questionNe: '३० सेन्टिमिटरको स्केल ३ सेन्टिमिटरको इरेजर भन्दा ____ हुन्छ।',
    options: [
      {
        id: 'q9_longer',
        labelEn: 'Longer (लामो)',
        labelNe: 'लामो',
        isCorrect: true,
        explanationEn: 'The 30 cm ruler has greater length.',
        explanationNe: '३० से.मी. को स्केल लम्बाइमा लामो हुन्छ।',
      },
      {
        id: 'q9_shorter',
        labelEn: 'Shorter (छोटो)',
        labelNe: 'छोटो',
        isCorrect: false,
        explanationEn: 'The ruler is longer, not shorter.',
        explanationNe: 'स्केल लामो हुन्छ, छोटो होइन।',
      },
    ],
  },
  {
    id: 'Q10',
    concept: 'Direction (Right & Left)',
    conceptNe: 'दायाँ र बायाँ',
    questionEn: 'Which hand do most children in Nepal traditionally use to write and eat rice?',
    questionNe: 'नेपालमा प्रायः बालबालिकाले भात खान र लेख्न कुन हात प्रयोग गर्छन्?',
    options: [
      {
        id: 'q10_right',
        labelEn: 'Right Hand (दायाँ हात)',
        labelNe: 'दायाँ हात',
        isCorrect: true,
        explanationEn: 'Correct! The right hand is the "दायाँ हात".',
        explanationNe: 'सबास! लेख्न र खान प्रायः दायाँ हात प्रयोग गरिन्छ।',
      },
      {
        id: 'q10_left',
        labelEn: 'Left Hand (बायाँ हात)',
        labelNe: 'बायाँ हात',
        isCorrect: false,
        explanationEn: 'The other hand is the left hand (बायाँ हात).',
        explanationNe: 'अर्को हातलाई बायाँ हात भनिन्छ।',
      },
    ],
  },
  {
    id: 'Q11',
    concept: 'Front, Middle & Behind',
    conceptNe: 'अगाडि, बिच र पछाडि',
    questionEn: 'In a morning school assembly line, student B stands between student A (first) and student C (last). Where is student B?',
    questionNe: 'बिहानको प्रार्थना लाइनमा विद्यार्थी B विद्यार्थी A (पहिलो) र विद्यार्थी C (अन्तिम) को बीचमा छ। विद्यार्थी B कहाँ छ?',
    options: [
      {
        id: 'q11_middle',
        labelEn: 'In the Middle (बिचमा)',
        labelNe: 'बिचमा',
        isCorrect: true,
        explanationEn: 'Student B is in the middle (बिचमा).',
        explanationNe: 'सबास! विद्यार्थी B दुई जनाको बिचमा छ।',
      },
      {
        id: 'q11_front',
        labelEn: 'In Front (अगाडि)',
        labelNe: 'अगाडि',
        isCorrect: false,
        explanationEn: 'Student A is in front.',
        explanationNe: 'अगाडि विद्यार्थी A छ।',
      },
    ],
  },
  {
    id: 'Q12',
    concept: 'Near & Far',
    conceptNe: 'नजिक र टाढा',
    questionEn: 'From your classroom window, the blackboard is ____ and the distant mountains are ____.',
    questionNe: 'कक्षाकोठाबाट हेर्दा कालोपाटी ____ हुन्छ र टाढाको हिमाल ____ हुन्छ।',
    options: [
      {
        id: 'q12_near_far',
        labelEn: 'Blackboard is Near (नजिक); Mountains are Far (टाढा)',
        labelNe: 'कालोपाटी नजिक; हिमाल टाढा',
        isCorrect: true,
        explanationEn: 'The board is nearby in the room, while mountains are far away.',
        explanationNe: 'कालोपाटी कोठाभित्रै नजिक हुन्छ, तर हिमाल धेरै टाढा हुन्छ।',
      },
      {
        id: 'q12_far_near',
        labelEn: 'Blackboard is Far; Mountains are Near',
        labelNe: 'कालोपाटी टाढा; हिमाल नजिक',
        isCorrect: false,
        explanationEn: 'Mountains are far across the horizon, not near inside.',
        explanationNe: 'हिमाल क्षितिजपारि टाढा हुन्छ।',
      },
    ],
  },
];

