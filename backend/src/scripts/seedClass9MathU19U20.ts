import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nepal_edu_ecosystem';

const SimulationSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    titleNepali: String,
    description: { type: String, required: true },
    descriptionNepali: String,
    subjectCode: { type: String, required: true },
    subjectName: { type: String, required: true },
    gradeLevels: [{ type: Number, required: true }],
    chapterNumber: Number,
    chapterName: String,
    chapterNameNepali: String,
    simulationType: {
      type: String,
      enum: ['HTML5_CANVAS', 'PHASER', 'REACT_CANVAS', 'WEB_GL'],
      default: 'REACT_CANVAS',
    },
    componentKey: String,
    runtimeUrl: String,
    difficulty: {
      type: String,
      enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
      default: 'INTERMEDIATE',
    },
    estimatedDurationMinutes: { type: Number, default: 15 },
    learningObjectives: [String],
    learningObjectivesNepali: [String],
    isPublished: { type: Boolean, default: true },
    currentVersion: { type: String, default: '1.0.0' },
    tags: [String],
  },
  { timestamps: true }
);

const Simulation = mongoose.models.Simulation || mongoose.model('Simulation', SimulationSchema);

const CLASS9_U19_U20_SIMS = [
  // ── UNIT 19: PROBABILITY (सम्भाव्यता) ────────────────────────────────────
  {
    code: 'SIM-MATH-G9-U19-01',
    key: 'class9-math-u19-probability-experiment-lab',
    chapterNumber: 19,
    chapterName: 'Probability',
    chapterNameNepali: 'सम्भाव्यता',
    title: 'Probability Experiment Laboratory',
    titleNepali: 'सम्भाव्यता प्रयोग प्रयोगशाला',
    description: 'Explore sample spaces, outcomes, and theoretical probability P(E) = n(E)/n(S) through virtual coin toss, dice roll, and colored spinner experiments.',
    descriptionNepali: 'सिक्का उछाल, पासा दगुराइ र रङ्गीन स्पिनर चक्र मार्फत सम्भाव्य नतिजा (Sample Space), अनुकूल घटना र सैद्धान्तिक सम्भाव्यता (P(E) = n(E)/n(S)) को प्रत्यक्ष प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Define sample space S and total number of possible outcomes n(S) for coins, dice, and spinners',
      'Identify favourable outcomes n(E) for specific events such as even, odd, and prime numbers',
      'Calculate theoretical probability using the standard formula P(E) = n(E) / n(S)',
    ],
    learningObjectivesNepali: [
      'सिक्का, पासा र चक्रका सम्भाव्य नतिजाको समूह (Sample Space) र कुल सङ्ख्या n(S) पत्ता लगाउन',
      'जोडी, विजोडी वा रूढ सङ्ख्या जस्ता घटनाहरूको अनुकूल सङ्ख्या n(E) पहिचान गर्न',
      'सैद्धान्तिक सम्भाव्यता P(E) = n(E) / n(S) सूत्र प्रयोग गरी सम्भाव्यता निकाल्न',
    ],
    tags: ['math', 'grade-9', 'unit-19', 'probability', 'coin-toss', 'dice-roll', 'spinner', 'sample-space'],
  },
  {
    code: 'SIM-MATH-G9-U19-02',
    key: 'class9-math-u19-probability-challenge-real-life-lab',
    chapterNumber: 19,
    chapterName: 'Probability',
    chapterNameNepali: 'सम्भाव्यता',
    title: 'Probability Challenge and Real-Life Lab',
    titleNepali: 'सम्भाव्यता चुनौती तथा व्यावहारिक प्रयोगशाला',
    description: 'Practical probability laboratory covering numbered cards 1–10, standard 52-card decks, classroom student selection, and the 0 to 1 probability scale.',
    descriptionNepali: '१ देखि १० सम्मका नम्बर कार्डहरू, ५२ पत्तीको तास, कक्षाकोठामा विद्यार्थी छनोट र ० देखि १ सम्मको सम्भाव्यता नाप मार्फत वास्तविक समस्या समाधान प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Calculate probabilities of drawing specific categories (even, odd, square) from numbered cards',
      'Understand standard 52-card pack distributions (suits, colors, face cards) and their probabilities',
      'Understand the 0 to 1 probability scale (impossible to certain) and complementary probability P(not E) = 1 - P(E)',
    ],
    learningObjectivesNepali: [
      'सङ्ख्या कार्डहरूबाट वर्ग वा रूढ सङ्ख्या पर्ने सम्भाव्यता निकाल्न',
      '५२ पत्तीको तासमा विभिन्न रङ्ग र पत्तीको सम्भाव्यता गणना गर्न',
      '० देखि १ सम्मको सम्भाव्यता रेखा र पूरक सम्भाव्यता P(not E) = १ - P(E) बुझ्न',
    ],
    tags: ['math', 'grade-9', 'unit-19', 'cards-probability', 'playing-cards', 'probability-scale', 'mutually-exclusive'],
  },
  {
    code: 'SIM-MATH-G9-U19-03',
    key: 'class9-math-u19-empirical-probability-analyser',
    chapterNumber: 19,
    chapterName: 'Probability',
    chapterNameNepali: 'सम्भाव्यता',
    title: 'Empirical Probability and Experiment Analyser',
    titleNepali: 'प्रयोगात्मक सम्भाव्यता तथा विश्लेषण प्रयोगशाला',
    description: 'Analyze repeated random experiments (up to 500+ trials), observe convergence to theoretical probability (Law of Large Numbers), and solve defective brick factory problems.',
    descriptionNepali: 'दोहोर्याइएका परीक्षणहरूबाट प्रयोगात्मक सम्भाव्यता (Empirical Probability = पटक / कुल परीक्षण) निकाल्ने, ठूलो सङ्ख्याको नियम र इँटा कारखाना गुणस्तर समस्या समाधान।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Calculate empirical probability from actual trial data: Empirical P = Outcome Count / Total Trials',
      'Observe the Law of Large Numbers as empirical probability converges to theoretical probability',
      'Apply empirical probability to quality control and estimation problems (defective bricks in shipments)',
    ],
    learningObjectivesNepali: [
      'वास्तविक परीक्षणका आधारमा प्रयोगात्मक सम्भाव्यता गणना गर्न',
      'परीक्षणको सङ्ख्या बढ्दै जाँदा प्रयोगात्मक सम्भाव्यता सैद्धान्तिक मानको नजिक पुग्छ भनी बुझ्न',
      'इँटा कारखानाको नमुना परीक्षणबाट ठूलो लटमा खराब इँटाको अनुमान गर्न',
    ],
    tags: ['math', 'grade-9', 'unit-19', 'empirical-probability', 'law-of-large-numbers', 'brick-problem', 'experiment-analyser'],
  },

  // ── UNIT 20: TRIGONOMETRY (त्रिकोणमिति) ──────────────────────────────────
  {
    code: 'SIM-MATH-G9-U20-01',
    key: 'class9-math-u20-trigonometric-ratio-explorer',
    chapterNumber: 20,
    chapterName: 'Trigonometry',
    chapterNameNepali: 'त्रिकोणमिति',
    title: 'Trigonometric Ratio Explorer',
    titleNepali: 'त्रिकोणमितीय अनुपात अन्वेषक',
    description: 'Explore right-angled triangles, dynamically identify opposite, adjacent, and hypotenuse sides, calculate all six trigonometric ratios, and verify fundamental identities.',
    descriptionNepali: 'समकोणी त्रिभुजमा सन्दर्भ कोण अनुसार सम्मुख भुजा (p), आसन्न भुजा (b) र कर्ण (h) पहिचान गर्ने, ६ वटा त्रिकोणमितीय अनुपात निकाल्ने र सर्वसमिका प्रमाणित गर्ने अन्वेषक।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Identify opposite (p), adjacent (b), and hypotenuse (h) based on reference angle θ in right triangles',
      'Compute all six ratios: sin, cos, tan, cosec, sec, and cot',
      'Verify fundamental identities: sin²θ + cos²θ = 1, sec²θ - tan²θ = 1, cosec²θ - cot²θ = 1',
    ],
    learningObjectivesNepali: [
      'सन्दर्भ कोणका आधारमा समकोणी त्रिभुजका भुजाहरू (सम्मुख, आसन्न, कर्ण) पहिचान गर्न',
      'छ वटै त्रिकोणमितीय अनुपातहरू (sin, cos, tan, cosec, sec, cot) गणना गर्न',
      'त्रिकोणमितीय सर्वसमिकाहरूको ज्यामितीय प्रमाणीकरण बुझ्न',
    ],
    tags: ['math', 'grade-9', 'unit-20', 'trigonometry', 'trig-ratios', 'pythagoras', 'trig-identities'],
  },
  {
    code: 'SIM-MATH-G9-U20-02',
    key: 'class9-math-u20-special-angles-identities-lab',
    chapterNumber: 20,
    chapterName: 'Trigonometry',
    chapterNameNepali: 'त्रिकोणमिति',
    title: 'Special Angles and Trigonometric Identities Lab',
    titleNepali: 'विशिष्ट कोण तथा त्रिकोणमितीय सर्वसमिका प्रयोगशाला',
    description: 'Derive and memorize trigonometric values for special angles (0°, 30°, 45°, 60°, 90°) with geometric triangle models and complementary angle relations (90° - θ).',
    descriptionNepali: 'विशिष्ट कोणहरू (०°, ३०°, ४५°, ६०°, ९०°) का त्रिकोणमितीय मानहरू ज्यामितीय विधिबाट निकाल्ने, मान तालिका कण्ठस्थ गर्ने र पूरक कोण सम्बन्ध अन्वेषण गर्ने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Derive exact values for 45° using an isosceles right triangle and 30°/60° using an equilateral triangle',
      'Recall and apply trigonometric ratios for special angles: 0°, 30°, 45°, 60°, and 90°',
      'Understand complementary angle formulas: sin θ = cos(90° - θ), cos θ = sin(90° - θ), tan θ = cot(90° - θ)',
    ],
    learningObjectivesNepali: [
      '४५° र ३०°-६०° का मानहरू समद्विबाहु र समबाहु त्रिभुजबाट निकाल्न',
      'विशिष्ट कोणका मानहरू तालिकाबाट सम्झन र प्रयोग गर्न',
      'पूरक कोणका त्रिकोणमितीय सम्बन्धहरू (९०° - θ) बुझ्न',
    ],
    tags: ['math', 'grade-9', 'unit-20', 'special-angles', 'geometric-derivation', 'complementary-angles', 'trig-table'],
  },
  {
    code: 'SIM-MATH-G9-U20-03',
    key: 'class9-math-u20-height-distance-application-lab',
    chapterNumber: 20,
    chapterName: 'Trigonometry',
    chapterNameNepali: 'त्रिकोणमिति',
    title: 'Height and Distance Application Laboratory',
    titleNepali: 'उचाइ र दुरी व्यावहारिक अनुप्रयोग प्रयोगशाला',
    description: 'Solve real-world height and distance problems for buildings, trees, and ladders using angle of elevation and tangent/sine ratios.',
    descriptionNepali: 'उन्नतांश कोण (Angle of elevation), स्पर्शरेखा (tan) र ज्या (sin) प्रयोग गरी भवन, रुख र भर्‍याङको उचाइ तथा दुरी हिसाब गर्ने व्यावहारिक प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Model real-world scenarios as right-angled triangles using horizontal distance and angle of elevation',
      'Calculate unknown heights of buildings and trees using tangent: h = d × tan θ',
      'Calculate vertical reach and ground distance of ladders using sine, cosine, and the Pythagorean theorem',
    ],
    learningObjectivesNepali: [
      'वास्तविक समस्यालाई समकोणी त्रिभुजमा रूपान्तरण गर्न',
      'उन्नतांश कोण र स्पर्शरेखा (tan) प्रयोग गरी घर र रुखको उचाइ निकाल्न',
      'भर्‍याङको समस्यामा sin, cos र पाइथागोरस साध्य प्रयोग गरी अज्ञात नाप निकाल्न',
    ],
    tags: ['math', 'grade-9', 'unit-20', 'height-and-distance', 'angle-of-elevation', 'ladder-problem', 'real-world-trig'],
  },
];

async function seedClass9MathU19U20() {
  try {
    console.log('Connecting to MongoDB at:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    for (const sim of CLASS9_U19_U20_SIMS) {
      const doc = {
        code: sim.code,
        title: sim.title,
        titleNepali: sim.titleNepali,
        description: sim.description,
        descriptionNepali: sim.descriptionNepali,
        subjectCode: 'MATH-G9',
        subjectName: 'Grade 9 Compulsory Mathematics',
        gradeLevels: [9],
        chapterNumber: sim.chapterNumber,
        chapterName: sim.chapterName,
        chapterNameNepali: sim.chapterNameNepali,
        simulationType: sim.simulationType,
        componentKey: sim.key,
        runtimeUrl: `/simulations/class9-math/${sim.key}`,
        difficulty: 'INTERMEDIATE',
        estimatedDurationMinutes: 15,
        learningObjectives: sim.learningObjectives,
        learningObjectivesNepali: sim.learningObjectivesNepali,
        isPublished: true,
        currentVersion: '1.0.0',
        tags: sim.tags,
      };

      await Simulation.findOneAndUpdate(
        { code: sim.code },
        { $set: doc },
        { upsert: true, returnDocument: 'after' }
      );
      console.log(`Upserted simulation: [${sim.code}] ${sim.title} (${sim.key})`);
    }

    const totalCount = await Simulation.countDocuments({ subjectCode: 'MATH-G9' });
    console.log(`\nTotal Grade 9 Mathematics simulations now in DB: ${totalCount}`);

    await mongoose.disconnect();
    console.log('Database connection closed.');
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seedClass9MathU19U20();
