/**
 * pascalTypes.ts
 * Type definitions, quiz questions, and presets for Pascal's Law Simulation (पास्कलको नियम)
 * Grade 10 Science & Technology • Chapter 2: Pressure (चाप)
 * Curriculum Development Centre (CDC), Nepal
 */

export type PascalMode =
  | 'flask'            // Pascal's Multi-Piston Spherical Vessel (पास्कलको बहु-पिस्टन भाँडो)
  | 'hydraulic_lift'   // Hydraulic Lift & Press (हाइड्रोलिक लिफ्ट र प्रेस)
  | 'hydraulic_brakes' // Hydraulic Brake System (हाइड्रोलिक ब्रेक प्रणाली)
  | 'numerical_lab'    // SEE Numerical Problem Solver (गणितीय प्रयोगशाला)
  | 'challenge_quiz';  // Interactive Quiz (अभ्यास र प्रश्नोत्तरी)

export interface PistonVesselPort {
  id: string;
  nameEn: string;
  nameNe: string;
  angleDeg: number;       // Angle radiating from flask center (0 = right, 90 = bottom, 180 = left, 270 = top)
  areaCm2: number;        // Cross-sectional area in cm^2
  displacementPx: number; // Current displacement of piston outward
  isInput: boolean;       // True for effort piston P1
  color: string;
  faceExpression: 'effort' | 'excited' | 'neutral' | 'popped';
}

export interface LiftLoadOption {
  id: string;
  nameEn: string;
  nameNe: string;
  massKg: number;
  icon: string;
  color: string;
}

export const LIFT_LOAD_PRESETS: LiftLoadOption[] = [
  { id: 'compact_car', nameEn: 'Compact Car', nameNe: 'सानो कार', massKg: 1000, icon: '🚗', color: '#3b82f6' },
  { id: 'suv', nameEn: 'SUV Vehicle', nameNe: 'एसयूभी गाडी', massKg: 1800, icon: '🚙', color: '#10b981' },
  { id: 'delivery_truck', nameEn: 'Mini Truck', nameNe: 'मिनी ट्रक', massKg: 3000, icon: '🚚', color: '#f59e0b' },
  { id: 'heavy_machinery', nameEn: 'Steel Machinery', nameNe: 'स्टील मेसिनरी', massKg: 5000, icon: '⚙️', color: '#64748b' },
];

export interface BrakeState {
  pedalDepressionPct: number; // 0 to 100%
  wheelRpm: number;           // Current wheel rotation speed
  masterPistonMm: number;     // Movement of master cylinder piston
  slavePistonMm: number;      // Movement of slave cylinder pistons
  brakeFluidPressureKpa: number;
  brakeShoeContact: boolean;
  padWearPct: number;
  rotorTempC: number;
}

export interface SeeExamProblem {
  id: string;
  titleEn: string;
  titleNe: string;
  examTag: string;
  given: {
    f1?: number; // N
    a1?: number; // cm2 or m2
    f2?: number; // N
    a2?: number; // cm2 or m2
    d1?: number; // cm
    d2?: number; // cm
    massLoadKg?: number;
    r1?: number; // cm
    r2?: number; // cm
  };
  unknownParam: 'f2' | 'f1' | 'a2' | 'd2';
  solutionStepsEn: string[];
  solutionStepsNe: string[];
  finalAnswerFormatted: string;
}

export const SEE_EXAM_PROBLEMS: SeeExamProblem[] = [
  {
    id: 'see_2079_q1',
    titleEn: 'Hydraulic Lift Output Force (SEE 2079 Model)',
    titleNe: 'हाइड्रोलिक लिफ्टको निस्कने बल (SEE २०७९)',
    examTag: 'SEE 2079 Compulsory Science',
    given: { f1: 50, a1: 10, a2: 250 },
    unknownParam: 'f2',
    solutionStepsEn: [
      'According to Pascal\'s Law, pressure is transmitted equally throughout the fluid: P₁ = P₂',
      'Formula: F₁ / A₁ = F₂ / A₂',
      'Rearranging for F₂: F₂ = (F₁ × A₂) / A₁',
      'Substitute values: F₂ = (50 N × 250 cm²) / 10 cm²',
      'F₂ = 1250 N (The output force is multiplied by 25 times!)',
    ],
    solutionStepsNe: [
      'पास्कलको नियम अनुसार तरलमा चाप सबैतिर बराबर प्रसारण हुन्छ: P₁ = P₂',
      'सूत्र: F₁ / A₁ = F₂ / A₂',
      'F₂ को लागि रूपान्तरण गर्दा: F₂ = (F₁ × A₂) / A₁',
      'मान प्रतिस्थापन गर्दा: F₂ = (५० N × २५० cm²) / १० cm²',
      'F₂ = १२५० N (निस्कने बल २५ गुणाले बढ्यो!)',
    ],
    finalAnswerFormatted: 'F₂ = 1,250 N',
  },
  {
    id: 'see_2080_car',
    titleEn: 'Lifting 1500 kg Car (SEE 2080)',
    titleNe: '१५०० kg कार उचाल्न आवश्यक बल (SEE २०८०)',
    examTag: 'SEE 2080 Science Board',
    given: { a1: 20, a2: 500, massLoadKg: 1500 },
    unknownParam: 'f1',
    solutionStepsEn: [
      'Weight of car F₂ = m × g = 1500 kg × 9.8 m/s² = 14,700 N',
      'By Pascal\'s Law: F₁ / A₁ = F₂ / A₂',
      'F₁ = (F₂ × A₁) / A₂',
      'F₁ = (14,700 N × 20 cm²) / 500 cm²',
      'F₁ = 588 N (A modest force of 588 N easily lifts a 1500 kg car!)',
    ],
    solutionStepsNe: [
      'कारको तौल F₂ = m × g = १५०० kg × ९.८ m/s² = १४,७०० N',
      'पास्कलको नियम अनुसार: F₁ / A₁ = F₂ / A₂',
      'F₁ = (F₂ × A₁) / A₂',
      'F₁ = (१४,७०० N × २० cm²) / ५०० cm²',
      'F₁ = ५८८ N (केवल ५८८ N बल लगाएर १५०० kg को कार उचाल्न सकिन्छ!)',
    ],
    finalAnswerFormatted: 'F₁ = 588 N',
  },
  {
    id: 'see_piston_distance',
    titleEn: 'Piston Stroke & Displacement (Work Conservation)',
    titleNe: 'पिस्टनको स्थानान्तरण र कार्यको संरक्षण',
    examTag: 'CDC Model Question',
    given: { a1: 15, a2: 300, d1: 20 },
    unknownParam: 'd2',
    solutionStepsEn: [
      'Water is incompressible, so Volume displaced at Piston 1 = Volume gained at Piston 2: V₁ = V₂',
      'Formula: A₁ × d₁ = A₂ × d₂',
      'd₂ = (A₁ × d₁) / A₂',
      'd₂ = (15 cm² × 20 cm) / 300 cm²',
      'd₂ = 1.0 cm (Small piston moves 20 cm downward; large piston rises 1 cm upward)',
      'Energy is conserved: W₁ = F₁ × d₁ = F₂ × d₂',
    ],
    solutionStepsNe: [
      'पानी असंपीड्य भएकोले पिस्टन १ मा विस्थापित आयतन = पिस्टन २ मा उठेको आयतन: V₁ = V₂',
      'सूत्र: A₁ × d₁ = A₂ × d₂',
      'd₂ = (A₁ × d₁) / A₂',
      'd₂ = (१५ cm² × २० cm) / ३०० cm²',
      'd₂ = १.० cm (सानो पिस्टन २० cm तल जाँदा ठूलो पिस्टन १ cm माथि उठ्छ)',
      'ऊर्जाको संरक्षण: W₁ = F₁ × d₁ = F₂ × d₂',
    ],
    finalAnswerFormatted: 'd₂ = 1.0 cm',
  },
];

export interface QuizQuestion {
  id: number;
  questionEn: string;
  questionNe: string;
  optionsEn: string[];
  optionsNe: string[];
  correctIndex: number;
  explanationEn: string;
  explanationNe: string;
}

export const PASCAL_SIM_QUIZ: QuizQuestion[] = [
  {
    id: 1,
    questionEn: "What is the primary condition required for Pascal's Law to hold true?",
    questionNe: "पास्कलको नियम लागू हुनका लागि मुख्य आवश्यक अवस्था के हो?",
    optionsEn: [
      "The liquid must be boiling at 100°C",
      "The liquid must be enclosed in a closed vessel and practically incompressible",
      "The vessel must be placed in a perfect vacuum",
      "The liquid must be exposed to open atmospheric air",
    ],
    optionsNe: [
      "तरल पदार्थ १००°C मा उम्लिएको हुनुपर्छ",
      "तरल पदार्थ बन्द भाँडोमा रहेको र असंपीड्य हुनुपर्छ",
      "भाँडोलाई पूर्ण शून्य (vacuum) मा राख्नुपर्छ",
      "तरल पदार्थ खुला हावामा रहेको हुनुपर्छ",
    ],
    correctIndex: 1,
    explanationEn: "Pascal's law strictly applies to an enclosed, confined fluid that cannot be compressed (such as water or hydraulic oil).",
    explanationNe: "पास्कलको नियम बन्द भाँडोमा राखिएको र दबाउन नमिल्ने (असंपीड्य) तरल पदार्थमा मात्र लागू हुन्छ।",
  },
  {
    id: 2,
    questionEn: "In a hydraulic machine, if the area of Piston B is 10 times that of Piston A, what is the output force ratio (F₂ / F₁)?",
    questionNe: "हाइड्रोलिक मेसिनमा यदि पिस्टन B को क्षेत्रफल पिस्टन A को भन्दा १० गुणा बढी छ भने, निस्कने बलको अनुपात कति हुन्छ?",
    optionsEn: [
      "Output force is 10 times greater (F₂ = 10 × F₁)",
      "Output force is 10 times smaller (F₂ = F₁ / 10)",
      "Output force remains exactly equal to F₁",
      "Output force becomes zero",
    ],
    optionsNe: [
      "निस्कने बल १० गुणा बढी हुन्छ (F₂ = १० × F₁)",
      "निस्कने बल १० गुणा कम हुन्छ (F₂ = F₁ / १०)",
      "निस्कने बल F₁ जति नै रहन्छ",
      "निस्कने बल शून्य हुन्छ",
    ],
    correctIndex: 0,
    explanationEn: "Since P₁ = P₂, F₁/A₁ = F₂/A₂. Therefore F₂ = F₁ × (A₂ / A₁) = 10 × F₁. It acts as a force multiplier!",
    explanationNe: "P₁ = P₂ भएकोले, F₁/A₁ = F₂/A₂ हुन्छ। त्यसैले F₂ = F₁ × (A₂ / A₁) = १० × F₁ हुन्छ। यसले बल बढाउने साधन (Force Multiplier) को काम गर्छ।",
  },
  {
    id: 3,
    questionEn: "Does a hydraulic press violate the Principle of Conservation of Energy by multiplying force?",
    questionNe: "के हाइड्रोलिक प्रेसले बल गुणा गर्दा ऊर्जा संरक्षणको सिद्धान्त उल्लङ्घन गर्छ?",
    optionsEn: [
      "Yes, because output force is larger than input force",
      "No, because work input equals work output: the larger force moves a proportionally smaller distance",
      "Yes, because new energy is generated inside the liquid",
      "No, because pressure decreases to compensate",
    ],
    optionsNe: [
      "हो, किनकि बाहिर आउने बल भित्र पठाएको बलभन्दा बढी हुन्छ",
      "गर्दैन, किनकि इनपुट कार्य = आउटपुट कार्य हुन्छ: धेरै बल थोरै दूरी मात्र सर्छ",
      "हो, किनकि तरल भित्र नयाँ ऊर्जा उत्पन्न हुन्छ",
      "गर्दैन, किनकि चाप घटेर बराबर हुन्छ",
    ],
    correctIndex: 1,
    explanationEn: "Work = Force × distance (W = F × d). Because A₁d₁ = A₂d₂, F₁d₁ = F₂d₂. A small effort moves a large distance, while the heavy load moves a very small distance.",
    explanationNe: "कार्य = बल × दूरी हुन्छ। A₁d₁ = A₂d₂ हुने भएकोले F₁d₁ = F₂d₂ हुन्छ। सानो बल लामो दूरी सर्छ भने ठूलो बल थोरै दूरी मात्र सर्छ, जसले गर्दा कार्य बराबर रहन्छ।",
  },
  {
    id: 4,
    questionEn: "Which practical equipment works directly on the principle of Pascal's Law?",
    questionNe: "कुन दैनिक उपकरण पास्कलको नियमको सिद्धान्तमा प्रत्यक्ष आधारित छ?",
    optionsEn: [
      "Hydraulic Brakes of vehicles",
      "Hydraulic Garage Lift & Hydraulic Press",
      "Earthmover / Excavator hydraulic arm",
      "All of the above",
    ],
    optionsNe: [
      "सवारी साधनको हाइड्रोलिक ब्रेक",
      "ग्यारेजको हाइड्रोलिक लिफ्ट र हाइड्रोलिक प्रेस",
      "डोजर वा एक्साभेटरको हाइड्रोलिक हात",
      "माथिका सबै",
    ],
    correctIndex: 3,
    explanationEn: "Hydraulic brakes, garage lifts, hydraulic presses, earthmover excavators, and dentists' chairs all operate on Pascal's Law.",
    explanationNe: "सवारी साधनको हाइड्रोलिक ब्रेक, ग्यारेज लिफ्ट, हाइड्रोलिक प्रेस, डोजर आदिका सबै यन्त्रहरू पास्कलको नियममै आधारित छन्।",
  },
  {
    id: 5,
    questionEn: "What is the direction of the pressure transmitted in an enclosed fluid according to Pascal's Law?",
    questionNe: "पास्कलको नियम अनुसार बन्द भाँडोमा रहेको तरलमा प्रसारण हुने चापको दिशा कस्तो हुन्छ?",
    optionsEn: [
      "Only in the downward direction due to gravity",
      "Equally and perpendicularly in all directions against the vessel walls",
      "Only towards the largest piston",
      "Only in the horizontal direction",
    ],
    optionsNe: [
      "गुरुत्वबलका कारण तलतिर मात्र",
      "सबै दिशामा बराबर र भाँडोको भित्तामा लम्ब रूपले",
      "सबैभन्दा ठूलो पिस्टन भएको दिशामा मात्र",
      "तेर्सो दिशामा मात्र",
    ],
    correctIndex: 1,
    explanationEn: "Pascal's Law states that pressure is transmitted equally and perpendicularly in all directions without any loss.",
    explanationNe: "पास्कलको नियम अनुसार चाप कुनै क्षति बिना तरलको सबै दिशामा लम्ब रूपले बराबर प्रसारण हुन्छ।",
  },
];
