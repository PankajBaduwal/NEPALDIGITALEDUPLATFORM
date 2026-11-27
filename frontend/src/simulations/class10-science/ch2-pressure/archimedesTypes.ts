/**
 * archimedesTypes.ts
 * Type definitions, material catalogs, and quiz presets for Archimedes' Principle Simulation
 * Class 10 Science & Technology • Chapter 2: Pressure (चाप)
 * Nepal Curriculum Development Centre (CDC) Alignment
 */

export type ArchimedesMode =
  | 'eureka_experiment'  // Classic Eureka Overflow Can & Spring Balance Experiment (विस्थापन क्यान प्रयोग)
  | 'density_lab'        // Controllable Weights & Density Exploration (तौल र घनत्व नियन्त्रण)
  | 'floatation_laws'    // Law of Floatation & Hydrometer (प्लवनको नियम)
  | 'see_solver'         // SEE Numerical Problem Solver (SEE गणितीय समाधान)
  | 'concept_quiz';      // Interactive SEE Concept Quiz (प्रश्नोत्तरी)

export interface SolidMaterial {
  id: string;
  nameEn: string;
  nameNe: string;
  densityKgM3: number;
  color: string;
  texture: 'stone' | 'metal' | 'wood' | 'gold' | 'shiny';
  icon: string;
  defaultVolumeCm3: number;
}

export const SOLID_MATERIALS: SolidMaterial[] = [
  { id: 'stone', nameEn: 'River Stone', nameNe: 'ढुङ्गा', densityKgM3: 2500, color: '#64748b', texture: 'stone', icon: '🪨', defaultVolumeCm3: 200 },
  { id: 'iron', nameEn: 'Iron Block', nameNe: 'फलामको टुक्रा', densityKgM3: 7800, color: '#475569', texture: 'metal', icon: '🔩', defaultVolumeCm3: 150 },
  { id: 'aluminum', nameEn: 'Aluminum Cylinder', nameNe: 'आल्मुनियम', densityKgM3: 2700, color: '#94a3b8', texture: 'shiny', icon: '🥫', defaultVolumeCm3: 220 },
  { id: 'copper', nameEn: 'Copper Block', nameNe: 'तामाको टुक्रा', densityKgM3: 8900, color: '#b45309', texture: 'shiny', icon: '🪙', defaultVolumeCm3: 140 },
  { id: 'gold', nameEn: 'Pure Gold Ingot', nameNe: 'सुनको टुक्रा', densityKgM3: 19300, color: '#eab308', texture: 'gold', icon: '👑', defaultVolumeCm3: 100 },
  { id: 'wood', nameEn: 'Pine Wood Block', nameNe: 'काठको टुक्रा', densityKgM3: 650, color: '#a16207', texture: 'wood', icon: '🪵', defaultVolumeCm3: 300 },
  { id: 'cork', nameEn: 'Light Cork', nameNe: 'कर्क (हल्का काठ)', densityKgM3: 240, color: '#d97706', texture: 'wood', icon: '🍾', defaultVolumeCm3: 350 },
  { id: 'custom', nameEn: 'Custom Object', nameNe: 'इच्छानुसार वस्तु', densityKgM3: 3000, color: '#8b5cf6', texture: 'shiny', icon: '🧪', defaultVolumeCm3: 200 },
];

export interface LiquidMedium {
  id: string;
  nameEn: string;
  nameNe: string;
  densityKgM3: number;
  color: string;
  fluidGradient: [string, string, string];
  viscosity: number;
}

export const LIQUID_MEDIA: LiquidMedium[] = [
  { id: 'fresh_water', nameEn: 'Pure Fresh Water', nameNe: 'शुद्ध पानी', densityKgM3: 1000, color: '#0284c7', fluidGradient: ['#38bdf8', '#0284c7', '#0369a1'], viscosity: 1.0 },
  { id: 'salt_water', nameEn: 'Dense Salt Water (Brine)', nameNe: 'नुनिलो पानी (समुद्री पानी)', densityKgM3: 1150, color: '#0d9488', fluidGradient: ['#2dd4bf', '#0d9488', '#115e59'], viscosity: 1.2 },
  { id: 'glycerin', nameEn: 'Glycerin', nameNe: 'ग्लिसरिन', densityKgM3: 1260, color: '#eab308', fluidGradient: ['#fef08a', '#eab308', '#ca8a04'], viscosity: 3.5 },
  { id: 'kerosene', nameEn: 'Kerosene Oil', nameNe: 'मट्टितेल', densityKgM3: 800, color: '#f97316', fluidGradient: ['#fdba74', '#f97316', '#c2410c'], viscosity: 0.9 },
  { id: 'custom_liquid', nameEn: 'Custom Liquid', nameNe: 'इच्छानुसार तरल', densityKgM3: 1000, color: '#6366f1', fluidGradient: ['#a5b4fc', '#6366f1', '#4338ca'], viscosity: 1.0 },
];

export interface ArchimedesQuizQuestion {
  id: number;
  questionEn: string;
  questionNe: string;
  optionsEn: string[];
  optionsNe: string[];
  correctIndex: number;
  explanationEn: string;
  explanationNe: string;
}

export const ARCHIMEDES_QUIZ: ArchimedesQuizQuestion[] = [
  {
    id: 1,
    questionEn: "What does Archimedes' Principle state regarding the upthrust acting on a submerged body?",
    questionNe: "आर्किमिडिजको सिद्धान्त अनुसार तरलमा डुबेको वस्तुमा लाग्ने उर्ध्वचाप (Upthrust) केसँग बराबर हुन्छ?",
    optionsEn: [
      "Equal to the total volume of the entire fluid in the container",
      "Equal to the weight of the fluid displaced by the submerged part of the body",
      "Equal to the true weight of the object in vacuum",
      "Equal to the surface area of the submerged body",
    ],
    optionsNe: [
      "भाँडोमा रहेको तरल पदार्थको कुल आयतनसँग",
      "वस्तुले विस्थापित गरेको तरल पदार्थको तौलसँग",
      "शुन्यमा वस्तुको वास्तविक तौलसँग",
      "वस्तुको सतहको कुल क्षेत्रफलसँग",
    ],
    correctIndex: 1,
    explanationEn: "Archimedes' Principle states: Upthrust (U) = Weight of fluid displaced = V_displaced × ρ_fluid × g.",
    explanationNe: "आर्किमिडिजको सिद्धान्त: उर्ध्वचाप (U) = विस्थापित तरल पदार्थको तौल = V_विस्थापित × ρ_तरल × g हुन्छ।",
  },
  {
    id: 2,
    questionEn: "An object weighs 5 N in air. When completely immersed in water, it displaces 2 N of water. What is its apparent weight in water?",
    questionNe: "एउटा वस्तुको हावामा तौल ५ N छ। यसलाई पानीमा पूर्ण डुबाउँदा २ N पानी विस्थापित गर्छ भने पानीमा यसको तौल (Apparent Weight) कति हुन्छ?",
    optionsEn: [
      "7 N (5 N + 2 N)",
      "3 N (5 N - 2 N)",
      "2 N (equal to displaced water)",
      "0 N (weightless)",
    ],
    optionsNe: [
      "७ N (५ N + २ N)",
      "३ N (५ N - २ N)",
      "२ N (विस्थापित पानी बराबर)",
      "० N (तौलविहीन)",
    ],
    correctIndex: 1,
    explanationEn: "Apparent weight in water = Weight in air - Upthrust = 5 N - 2 N = 3 N.",
    explanationNe: "पानीमा तौल = हावामा तौल - उर्ध्वचाप = ५ N - २ N = ३ N हुन्छ।",
  },
  {
    id: 3,
    questionEn: "Why is it easier to lift a heavy stone inside water than in air?",
    questionNe: "गह्रौँ ढुङ्गालाई हावामा भन्दा पानी भित्र उचाल्न किन सजिलो हुन्छ?",
    optionsEn: [
      "Because water decreases the actual mass of the stone",
      "Because water exerts an upward buoyant force (upthrust) supporting the stone",
      "Because gravity ceases to act beneath the water surface",
      "Because the stone becomes softer inside water",
    ],
    optionsNe: [
      "किनकि पानीले ढुङ्गाको पिण्ड घटाउँछ",
      "किनकि पानीले ढुङ्गामा माथितिर उर्ध्वचाप (Upthrust) लगाउँछ",
      "किनकि पानीभित्र गुरुत्वाकर्षण बल लाग्दैन",
      "किनकि पानीभित्र ढुङ्गा नरम हुन्छ",
    ],
    correctIndex: 1,
    explanationEn: "Water exerts an upward buoyant force (upthrust) equal to the weight of water displaced, reducing the downward tension on hands: W_apparent = W_air - U.",
    explanationNe: "पानीले माथितिर उर्ध्वचाप दिने हुनाले पानी भित्र वस्तुको तौल घट्छ (Apparent Weight = W - U), त्यसैले उचाल्न सजिलो हुन्छ।",
  },
  {
    id: 4,
    questionEn: "Under which condition will an object float partially submerged on the surface of a liquid (Law of Floatation)?",
    questionNe: "प्लवनको नियम अनुसार कुनै वस्तु कुन अवस्थामा तरलको सतहमा आंशिक रूपले डुबेर उत्रिन्छ?",
    optionsEn: [
      "When the density of the object is less than the density of the liquid (ρ_body < ρ_liquid)",
      "When the density of the object is greater than the liquid (ρ_body > ρ_liquid)",
      "When the object has zero volume",
      "When gravity is greater than upthrust",
    ],
    optionsNe: [
      "जब वस्तुको घनत्व तरलको घनत्वभन्दा कम हुन्छ (ρ_वस्तु < ρ_तरल)",
      "जब वस्तुको घनत्व तरलको घनत्वभन्दा बढी हुन्छ (ρ_वस्तु > ρ_तरल)",
      "जब वस्तुको आयतन शून्य हुन्छ",
      "जब गुरुत्वबल उर्ध्वचापभन्दा बढी हुन्छ",
    ],
    correctIndex: 0,
    explanationEn: "When density of the object is less than the liquid (ρ_body < ρ_liquid), it floats partially submerged such that Weight of body = Upthrust (W = U).",
    explanationNe: "वस्तुको घनत्व तरलको भन्दा कम हुँदा वस्तु आंशिक डुबेर उत्रिन्छ ताकि वस्तुको कुल तौल विस्थापित तरलको तौलसँग बराबर हुन्छ।",
  },
  {
    id: 5,
    questionEn: "An iron nail sinks in water, but a huge ship made of iron floats effortlessly. What is the scientific reason?",
    questionNe: "फलामको सानो काँटी पानीमा डुब्छ तर फलामबाटै बनेको विशाल पानीजहाज पानीमा तैरिन्छ, यसको वैज्ञानिक कारण के हो?",
    optionsEn: [
      "A ship has engine power that pushes it upward",
      "A ship is hollow inside, giving it a huge average volume so it displaces water equal to its vast weight",
      "Salt in ocean water destroys the weight of iron",
      "The ship is covered with waterproof paint",
    ],
    optionsNe: [
      "जहाजमा शक्तिशाली इन्जिन भएकोले माथि धकेल्छ",
      "जहाज भित्र खोक्रो हुन्छ, जसले गर्दा यसको औसत घनत्व कम भई आफ्नो कुल तौल बराबर पानी विस्थापित गर्न सक्छ",
      "समुद्रको नुनले फलामको तौल नष्ट गर्छ",
      "जहाजमा पानी नछिर्ने रङ लगाएको हुन्छ",
    ],
    correctIndex: 1,
    explanationEn: "A hollow ship encloses a massive volume of air, making its average density much lower than water. Hence, it displaces a weight of water equal to its entire weight before submerging.",
    explanationNe: "जहाज भित्र ठूलो खाली भाग (हावा) हुने भएकाले यसको औसत घनत्व पानीभन्दा कम हुन्छ र यसले आफ्नो तौल बराबरको पानी सजिलै विस्थापित गर्न सक्छ।",
  },
];

export interface ArchimedesProblem {
  id: string;
  titleEn: string;
  titleNe: string;
  examTag: string;
  given: {
    weightAirN: number;
    weightWaterN?: number;
    volumeCm3?: number;
    liquidDensityKgM3?: number;
    bodyDensityKgM3?: number;
  };
  unknown: 'upthrust' | 'apparent_weight' | 'displaced_weight' | 'volume' | 'density';
  stepsEn: string[];
  stepsNe: string[];
  resultFormatted: string;
}

export const ARCHIMEDES_SEE_PROBLEMS: ArchimedesProblem[] = [
  {
    id: 'prob_1_see_stone',
    titleEn: 'Weight of Stone in Air and Water (SEE Model)',
    titleNe: 'ढुङ्गाको हावा र पानीमा तौल (SEE नमुना प्रश्न)',
    examTag: 'SEE Model 2080',
    given: { weightAirN: 5.0, weightWaterN: 3.0 },
    unknown: 'upthrust',
    stepsEn: [
      'Given: Weight of stone in air (W₁) = 5.0 N',
      'Weight of stone in water (W₂) = 3.0 N',
      'By Archimedes\' Principle: Upthrust (U) = Loss in weight of stone',
      'Formula: U = W₁ - W₂',
      'Calculation: U = 5.0 N - 3.0 N = 2.0 N',
      'Weight of displaced water = Upthrust = 2.0 N',
    ],
    stepsNe: [
      'दिइएको: हावामा ढुङ्गाको तौल (W₁) = ५.० N',
      'पानीमा ढुङ्गाको तौल (W₂) = ३.० N',
      'आर्किमिडिजको सिद्धान्त अनुसार: उर्ध्वचाप (U) = ढुङ्गाको तौलमा भएको कमी',
      'सूत्र: U = W₁ - W₂',
      'गणना: U = ५.० N - ३.० N = २.० N',
      'विस्थापित पानीको तौल = उर्ध्वचाप = २.० N',
    ],
    resultFormatted: 'Upthrust U = 2.0 N, Weight of Displaced Water = 2.0 N',
  },
  {
    id: 'prob_2_volume_calc',
    titleEn: 'Volume of Submerged Body from Upthrust',
    titleNe: 'उर्ध्वचापबाट वस्तुको आयतन पत्ता लगाउने विधि',
    examTag: 'SEE Board Question',
    given: { weightAirN: 15.0, weightWaterN: 10.0, liquidDensityKgM3: 1000 },
    unknown: 'volume',
    stepsEn: [
      'Upthrust U = W_air - W_water = 15 N - 10 N = 5 N',
      'Formula: U = V × ρ × g',
      'Volume V = U / (ρ × g)',
      'V = 5 N / (1000 kg/m³ × 9.8 m/s²) = 0.00051 m³ = 510 cm³',
      'Therefore, the volume of the body is 510 cm³.',
    ],
    stepsNe: [
      'उर्ध्वचाप U = W_हावा - W_पानी = १५ N - १० N = ५ N',
      'सूत्र: U = V × ρ × g',
      'आयतन V = U / (ρ × g)',
      'V = ५ N / (१००० kg/m³ × ९.८ m/s²) = ०.०००५१ m³ = ५१० cm³',
      'अतः वस्तुको आयतन ५१० cm³ हुन्छ।',
    ],
    resultFormatted: 'Volume V = 510 cm³',
  },
];
