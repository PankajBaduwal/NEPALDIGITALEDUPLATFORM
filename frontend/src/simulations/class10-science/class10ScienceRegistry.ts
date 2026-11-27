/**
 * class10ScienceRegistry.ts
 * Master Simulation Metadata Registry for Grade 10 Science & Technology (विज्ञान तथा प्रविधि - कक्षा १०)
 * Government of Nepal Curriculum Development Centre (CDC) Alignment
 */

export interface Grade10ScienceChapter {
  number: number;
  title: string;
  titleNepali: string;
}

export const GRADE_10_SCIENCE_CHAPTERS: Grade10ScienceChapter[] = [
  { number: 1, title: 'Force and Gravitation', titleNepali: 'बल र गुरुत्वाकर्षण' },
  { number: 2, title: 'Pressure', titleNepali: 'चाप' },
  { number: 3, title: 'Energy', titleNepali: 'शक्ति' },
  { number: 4, title: 'Heat', titleNepali: 'ताप' },
  { number: 5, title: 'Light', titleNepali: 'प्रकाश' },
  { number: 6, title: 'Current Electricity and Magnetism', titleNepali: 'विद्युत र चुम्बकत्व' },
  { number: 7, title: 'Classification of Elements', titleNepali: 'तत्वहरूको वर्गीकरण' },
  { number: 8, title: 'Chemical Reaction', titleNepali: 'रासायनिक प्रतिक्रिया' },
  { number: 9, title: 'Acid, Base and Salt', titleNepali: 'अम्ल, क्षार र लवण' },
  { number: 10, title: 'Some Gases', titleNepali: 'केही ग्यासहरू' },
  { number: 11, title: 'Metals', titleNepali: 'धातुहरू' },
  { number: 12, title: 'Hydrocarbon and Its Compounds', titleNepali: 'हाइड्रोकार्बन र यसका यौगिकहरू' },
  { number: 13, title: 'Materials Used in Daily Life', titleNepali: 'दैनिक जीवनमा प्रयोग हुने वस्तुहरू' },
  { number: 14, title: 'Invertebrates', titleNepali: 'ढाड नभएका जीवहरू' },
  { number: 15, title: 'Human Nervous and Glandular System', titleNepali: 'मानव स्नायु र ग्रन्थी प्रणाली' },
  { number: 16, title: 'Blood Circulatory System', titleNepali: 'मानव शरीरमा रक्तसञ्चार प्रणाली' },
  { number: 17, title: 'Chromosome and Sex Determination', titleNepali: 'क्रोमोजोम र लिङ्ग निर्धारण' },
  { number: 18, title: 'Reproduction', titleNepali: 'प्रजनन' },
  { number: 19, title: 'Heredity', titleNepali: 'वंशाणुक्रम' },
  { number: 20, title: 'Environmental Management', titleNepali: 'वातावरणीय व्यवस्थापन' },
  { number: 21, title: 'Geological History of Earth', titleNepali: 'पृथ्वीको भूतात्विक इतिहास' },
  { number: 22, title: 'Atmosphere and Climate Change', titleNepali: 'वायुमण्डल र जलवायु परिवर्तन' },
  { number: 23, title: 'The Universe', titleNepali: 'ब्रह्माण्ड' },
];

export interface Grade10SimulationEntry {
  id: string;
  code: string;
  title: string;
  titleNepali: string;
  gradeLevels: number[];
  subjectCode: string;
  subjectName: string;
  chapterNumber: number;
  chapterTitle: string;
  chapterTitleNepali: string;
  simulationType: '3D_WEBGL' | '2D_CANVAS' | 'HTML5_SIM';
  componentKey: string;
  runtimeUrl: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimatedMinutes: number;
  description: string;
  descriptionNepali: string;
  tags: string[];
}

export const GRADE_10_SCIENCE_SIMULATIONS: Grade10SimulationEntry[] = [
  // ── CHAPTER 1: FORCE & GRAVITATION ────────────────────────────────────
  {
    id: 'sim-sci-g10-ch1-01',
    code: 'SIM-SCI-G10-CH1-01',
    title: "Newton's Universal Law of Gravitation",
    titleNepali: 'न्युटनको विश्वव्यापी गुरुत्वाकर्षणको नियम',
    gradeLevels: [10],
    subjectCode: 'SCI',
    subjectName: 'Science & Technology',
    chapterNumber: 1,
    chapterTitle: 'Force and Gravitation',
    chapterTitleNepali: 'बल र गुरुत्वाकर्षण',
    simulationType: '2D_CANVAS',
    componentKey: 'class10-sci-ch1-universal-gravitation',
    runtimeUrl: '/sim/universal-gravitation',
    difficulty: 'INTERMEDIATE',
    estimatedMinutes: 20,
    description: "Interactive cartoon demonstration of Newton's Gravitation Law. Adjust masses (m₁, m₂) and distance (d), observe mutual force vectors, inverse-square law, and cartoon strain expressions.",
    descriptionNepali: 'न्युटनको गुरुत्वाकर्षण नियमको अन्तरक्रियात्मक कार्टुन प्रयोगशाला। पिण्ड र दूरी परिवर्तन गरी गुरुत्वाकर्षण बल र विपरीत आकर्षणका सदिशहरूको अध्ययन गर्नुहोस्।',
    tags: ['gravitation', 'Newton law', 'force', 'mass', 'inverse square law', 'class 10 science'],
  },
  {
    id: 'sim-sci-g10-ch1-02',
    code: 'SIM-SCI-G10-CH1-02',
    title: 'Ocean Tides and Lunar Gravitation',
    titleNepali: 'समुद्री ज्वारभाटा र चन्द्रमाको गुरुत्वाकर्षण बल',
    gradeLevels: [10],
    subjectCode: 'SCI',
    subjectName: 'Science & Technology',
    chapterNumber: 1,
    chapterTitle: 'Force and Gravitation',
    chapterTitleNepali: 'बल र गुरुत्वाकर्षण',
    simulationType: '2D_CANVAS',
    componentKey: 'class10-sci-ch1-tides-gravitation',
    runtimeUrl: '/sim/ocean-tides',
    difficulty: 'INTERMEDIATE',
    estimatedMinutes: 25,
    description: "Interactive cartoon demonstration of lunar gravitational pull creating ocean tides. Experience high tide bulging water, Spring/Neap syzygy alignment, tidal differential gravity (F_tide ∝ M/d³), and diurnal cycles.",
    descriptionNepali: 'चन्द्रमाको गुरुत्वाकर्षण बलले समुद्री ज्वारभाटा उत्पन्न गर्ने अन्तरक्रियात्मक कार्टुन प्रयोगशाला। पानीको उच्च ज्वार, बृहत् र लघु ज्वार, ज्वारीय अन्तर बल (F_tide ∝ M/d³) र दैनिक चक्रको प्रयोगात्मक अध्ययन गर्नुहोस्।',
    tags: ['tides', 'gravitation', 'moon pull', 'high tide', 'spring tide', 'neap tide', 'class 10 science', 'differential gravity'],
  },
  {
    id: 'sim-sci-g10-ch1-03',
    code: 'SIM-SCI-G10-CH1-03',
    title: "Coin and Feather Experiment (Boyle's Vacuum Tube)",
    titleNepali: 'गिनी र प्वाँखको प्रयोग (रोबर्ट बोयलको शुन्य नली प्रयोग)',
    gradeLevels: [10],
    subjectCode: 'SCI',
    subjectName: 'Science & Technology',
    chapterNumber: 1,
    chapterTitle: 'Force and Gravitation',
    chapterTitleNepali: 'बल र गुरुत्वाकर्षण',
    simulationType: '2D_CANVAS',
    componentKey: 'class10-sci-ch1-coin-and-feather',
    runtimeUrl: '/sim/coin-and-feather',
    difficulty: 'INTERMEDIATE',
    estimatedMinutes: 20,
    description: "Interactive cartoon demonstration of Robert Boyle's 1660 Coin and Feather experiment. Compare free fall in air (aerodynamic drag opposes feather) vs vacuum (air pumped out: coin and feather fall simultaneously with acceleration a = g).",
    descriptionNepali: 'रोबर्ट बोयलको १६६० को गिनी र प्वाँखको ऐतिहासिक अन्तरक्रियात्मक प्रयोगशाला। हावा भएको नली (हावाको अवरोधले प्वाँख ढिलो खस्ने) र शुन्य नली (हावा पम्प गरी फालिएको: दुवै वस्तु समान प्रवेग a = g ले सँगै खस्ने) को प्रत्यक्ष तुलना र अध्ययन गर्नुहोस्।',
    tags: ['coin and feather', 'boyle experiment', 'vacuum tube', 'free fall', 'acceleration due to gravity', 'air resistance', 'class 10 science', 'see exam'],
  },
  // ── CHAPTER 2: PRESSURE ──────────────────────────────────────────────
  {
    id: 'sim-sci-g10-ch2-01',
    code: 'SIM-SCI-G10-CH2-01',
    title: "Pascal's Law Master Laboratory",
    titleNepali: 'पास्कलको नियम बृहत् अनुसन्धान प्रयोगशाला',
    gradeLevels: [10],
    subjectCode: 'SCI',
    subjectName: 'Science & Technology',
    chapterNumber: 2,
    chapterTitle: 'Pressure',
    chapterTitleNepali: 'चाप',
    simulationType: '2D_CANVAS',
    componentKey: 'class10-sci-ch2-pascals-law',
    runtimeUrl: '/sim/pascals-law',
    difficulty: 'INTERMEDIATE',
    estimatedMinutes: 25,
    description: "Ultra-high-definition interactive simulation demonstrating Pascal's Law: multi-piston spherical flask with omnidirectional equal pressure transmission, hydraulic lift & press with vehicle lifting and work conservation, automotive hydraulic brakes with pedal and clamping pads, SEE exam formula solver, and interactive concept quiz.",
    descriptionNepali: 'पास्कलको नियमको बृहत् अन्तरक्रियात्मक प्रयोगशाला: चार पिस्टन भएको गोलाकार भाँडोमा सबैतिर बराबर चाप प्रसारण, हाइड्रोलिक लिफ्ट र प्रेसमा बल गुणन र कार्यको संरक्षण, सवारी साधनको हाइड्रोलिक ब्रेक, SEE परीक्षाको गणितीय समस्या समाधान र अन्तरक्रियात्मक प्रश्नोत्तरी।',
    tags: ['pressure', "pascal's law", 'hydraulic lift', 'hydraulic press', 'hydraulic brakes', 'force multiplier', 'piston', 'see exam', 'class 10 science'],
  },
  // ── CHAPTER 5: LIGHT ─────────────────────────────────────────────────
  {
    id: 'sim-sci-g10-ch5-01',
    code: 'SIM-SCI-G10-CH5-01',
    title: 'Phenomena of Light Master Laboratory',
    titleNepali: 'प्रकाशका परिघटनाहरूको बृहत् अनुसन्धान प्रयोगशाला',
    gradeLevels: [10],
    subjectCode: 'SCI',
    subjectName: 'Science & Technology',
    chapterNumber: 5,
    chapterTitle: 'Light',
    chapterTitleNepali: 'प्रकाश',
    simulationType: '2D_CANVAS',
    componentKey: 'class10-sci-ch5-phenomena-of-light',
    runtimeUrl: '/sim/phenomena-of-light',
    difficulty: 'INTERMEDIATE',
    estimatedMinutes: 30,
    description: 'All-in-one comprehensive optical laboratory demonstrating 9 phenomena: Reflection, Refraction (meaning, causes, glass slab lateral shift), Dispersion (VIBGYOR), Diffraction, Interference (YDSE), Polarization (Malus Law), Total Internal Reflection (TIR), Photoelectric Effect, and Compton Scattering with slow laser beam tracing.',
    descriptionNepali: 'प्रकाशका ९ मुख्य परिघटनाहरूको बृहत् प्रयोगशाला: परावर्तन, अपवर्तन (अर्थ, कारण, काँचको पाताबाट पार्श्व विस्थापन), वर्ण विच्छेदन (VIBGYOR), विवर्तन, व्यतिकरण, ध्रुवीकरण (मालसको नियम), पूर्ण आन्तरिक परावर्तन, फोटोइलेक्ट्रिक प्रभाव र कम्प्टोन प्रभावको सुस्त लेजर किरण सहितको विस्तृत अनुसन्धान।',
    tags: ['light', 'reflection', 'refraction', 'glass slab', 'lateral displacement', 'dispersion', 'diffraction', 'interference', 'polarization', 'TIR', 'photoelectric', 'compton', 'class 10 science', 'see exam'],
  },
];
